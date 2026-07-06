import json
import math
import os
import re
from dataclasses import dataclass

from config import dashscope_enabled
from schemas import Candidate, Job, ShortlistCandidate


DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
CHAT_MODEL = os.environ.get("DASHSCOPE_MODEL", "qwen-plus")
EMBEDDING_MODEL = os.environ.get("DASHSCOPE_EMBEDDING_MODEL", "text-embedding-v4")


@dataclass(frozen=True)
class RankedCandidate:
    candidate: Candidate
    match_score: float
    reasoning: str


def rank_candidates_for_job(job: Job, candidates: list[Candidate]) -> list[RankedCandidate]:
    if not candidates:
        return []

    if dashscope_enabled() and os.environ.get("DASHSCOPE_API_KEY"):
        try:
            preliminary = _rank_with_embeddings(job, candidates, use_qwen=True)
            return _confirm_scores_and_reasoning_with_qwen(job, preliminary)
        except Exception:
            pass

    preliminary = _rank_with_embeddings(job, candidates, use_qwen=False)
    locally_ranked = [_with_local_reasoning(job, ranked) for ranked in preliminary]
    return sorted(locally_ranked, key=lambda item: item.match_score, reverse=True)


def to_shortlist_candidate(ranked: RankedCandidate) -> ShortlistCandidate:
    return ShortlistCandidate(
        candidate_id=ranked.candidate.candidate_id,
        name=ranked.candidate.name,
        match_score=ranked.match_score,
        reasoning=ranked.reasoning,
    )


def _rank_with_embeddings(job: Job, candidates: list[Candidate], *, use_qwen: bool) -> list[RankedCandidate]:
    job_text = _job_text(job)
    candidate_texts = [_candidate_text(candidate) for candidate in candidates]
    if use_qwen:
        vectors = _qwen_embeddings([job_text, *candidate_texts])
    else:
        vocabulary = _vocabulary([job_text, *candidate_texts])
        vectors = [_local_embedding(text, vocabulary) for text in [job_text, *candidate_texts]]

    job_vector = vectors[0]
    ranked = [
        RankedCandidate(
            candidate=candidate,
            match_score=_clamp_score(_cosine_similarity(job_vector, vector)),
            reasoning="Pending reasoning generation.",
        )
        for candidate, vector in zip(candidates, vectors[1:], strict=True)
    ]
    return sorted(ranked, key=lambda item: item.match_score, reverse=True)


def _confirm_scores_and_reasoning_with_qwen(
    job: Job, preliminary: list[RankedCandidate]
) -> list[RankedCandidate]:
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["DASHSCOPE_API_KEY"], base_url=DASHSCOPE_BASE_URL)
    candidates_payload = [
        {
            "candidate_id": ranked.candidate.candidate_id,
            "name": ranked.candidate.name,
            "skills": ranked.candidate.skills,
            "experience_years": ranked.candidate.experience_years,
            "education": ranked.candidate.education,
            "preliminary_score": ranked.match_score,
        }
        for ranked in preliminary
    ]
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are HireFlow's matching agent. Return strict JSON only. "
                    "Use only stated skills, experience, education, and availability. "
                    "Never use or infer protected demographic attributes."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Confirm or slightly adjust these preliminary candidate match scores "
                    "and produce one concise human-readable reasoning string for each. "
                    "Return JSON: {\"candidates\":[{\"candidate_id\":\"...\","
                    "\"match_score\":0.0,\"reasoning\":\"...\"}]}.\n\n"
                    f"Job: {job.model_dump()}\n"
                    f"Candidates: {json.dumps(candidates_payload)}"
                ),
            },
        ],
    )
    content = response.choices[0].message.content or "{}"
    payload = json.loads(content)
    by_id = {
        item.get("candidate_id"): item
        for item in payload.get("candidates", [])
        if isinstance(item, dict)
    }

    confirmed: list[RankedCandidate] = []
    for ranked in preliminary:
        item = by_id.get(ranked.candidate.candidate_id, {})
        confirmed.append(
            RankedCandidate(
                candidate=ranked.candidate,
                match_score=_clamp_score(float(item.get("match_score", ranked.match_score))),
                reasoning=str(item.get("reasoning") or _local_reasoning(job, ranked.candidate)),
            )
        )
    return sorted(confirmed, key=lambda item: item.match_score, reverse=True)


def _with_local_reasoning(job: Job, ranked: RankedCandidate) -> RankedCandidate:
    return RankedCandidate(
        candidate=ranked.candidate,
        match_score=_hybrid_local_score(job, ranked.candidate, ranked.match_score),
        reasoning=_local_reasoning(job, ranked.candidate),
    )


def _hybrid_local_score(job: Job, candidate: Candidate, embedding_score: float) -> float:
    required_terms = [_normalize_skill(requirement) for requirement in job.requirements]
    candidate_terms = {_normalize_skill(skill) for skill in candidate.skills}
    required_skills = [term for term in required_terms if "year" not in term and term]
    if required_skills:
        overlap = sum(1 for skill in required_skills if skill in candidate_terms)
        skill_score = overlap / len(required_skills)
    else:
        skill_score = embedding_score

    required_years = _required_years(job.requirements)
    if required_years is None:
        experience_score = 0.75
    elif required_years == 0:
        experience_score = 1.0
    else:
        experience_score = min(candidate.experience_years / required_years, 1.0)

    return _clamp_score((skill_score * 0.65) + (experience_score * 0.25) + (embedding_score * 0.10))


def _local_reasoning(job: Job, candidate: Candidate) -> str:
    required_skills = [
        requirement
        for requirement in job.requirements
        if "year" not in requirement.lower() and "experience" not in requirement.lower()
    ]
    candidate_terms = {_normalize_skill(skill) for skill in candidate.skills}
    matched = [
        requirement
        for requirement in required_skills
        if _normalize_skill(requirement) in candidate_terms
    ]
    missing = [requirement for requirement in required_skills if requirement not in matched]
    missing_text = ", ".join(missing) if missing else "none"
    return (
        f"{len(matched)}/{len(required_skills) or len(job.requirements)} required skills matched, "
        f"{candidate.experience_years:g} years relevant experience, missing: {missing_text}"
    )


def _qwen_embeddings(texts: list[str]) -> list[list[float]]:
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["DASHSCOPE_API_KEY"], base_url=DASHSCOPE_BASE_URL)
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in response.data]


def _job_text(job: Job) -> str:
    return f"{job.title}. Requirements: {', '.join(job.requirements)}"


def _candidate_text(candidate: Candidate) -> str:
    education = candidate.education or "No education listed"
    return (
        f"{candidate.name}. Skills: {', '.join(candidate.skills)}. "
        f"Experience: {candidate.experience_years:g} years. Education: {education}."
    )


def _vocabulary(texts: list[str]) -> list[str]:
    terms: set[str] = set()
    for text in texts:
        terms.update(_tokens(text))
    return sorted(terms)


def _local_embedding(text: str, vocabulary: list[str]) -> list[float]:
    token_counts: dict[str, int] = {}
    for token in _tokens(text):
        token_counts[token] = token_counts.get(token, 0) + 1
    return [float(token_counts.get(term, 0)) for term in vocabulary]


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z0-9+#.]+", text.lower())


def _cosine_similarity(left: list[float], right: list[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right, strict=True))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


def _clamp_score(value: float) -> float:
    return round(max(0.0, min(1.0, value)), 2)


def _normalize_skill(value: str) -> str:
    return re.sub(r"[^a-z0-9+#.]+", " ", value.lower()).strip()


def _required_years(requirements: list[str]) -> float | None:
    for requirement in requirements:
        match = re.search(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)", requirement, flags=re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None
