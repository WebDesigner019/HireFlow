import json
import os

from config import dashscope_enabled
from schemas import Candidate, Job


DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
CHAT_MODEL = os.environ.get("DASHSCOPE_MODEL", "qwen-plus")


def draft_interview_invite(candidate: Candidate, job: Job) -> str:
    if dashscope_enabled() and os.environ.get("DASHSCOPE_API_KEY"):
        try:
            return _draft_invite_with_qwen(candidate, job)
        except Exception:
            pass

    return (
        f"Hi {candidate.name}, we'd like to invite you to interview for the {job.title} role. "
        "Are you available Tuesday 2pm or Wednesday 10am? This is a draft invite for reviewer "
        "approval and has not been sent."
    )


def draft_skill_gap_feedback(candidate: Candidate, job: Job) -> str:
    missing = _missing_requirements(candidate, job)
    matched = _matched_requirements(candidate, job)

    if dashscope_enabled() and os.environ.get("DASHSCOPE_API_KEY"):
        try:
            return _draft_feedback_with_qwen(candidate, job, missing, matched)
        except Exception:
            pass

    if missing:
        missing_text = ", ".join(missing)
        matched_text = ", ".join(matched) if matched else "your current experience"
        return (
            f"You're a strong match on {matched_text}, but this role requires {missing_text}, "
            "which wasn't fully reflected in your profile. Adding hands-on examples, project "
            "work, or certification in those areas would make you a stronger fit for similar roles."
        )

    return (
        f"You match the stated requirements for the {job.title} role, but the reviewer chose "
        "not to move forward for this opening. Keep your profile updated so you can be reconsidered "
        "for similar roles."
    )


def _draft_invite_with_qwen(candidate: Candidate, job: Job) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["DASHSCOPE_API_KEY"], base_url=DASHSCOPE_BASE_URL)
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Draft interview invitations only. Do not claim the message was sent. "
                    "Keep it concise, professional, and candidate-facing."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Draft an interview invite using this JSON. Include two time options.\n"
                    f"{json.dumps({'candidate': candidate.model_dump(), 'job': job.model_dump()})}"
                ),
            },
        ],
    )
    return (response.choices[0].message.content or "").strip()


def _draft_feedback_with_qwen(
    candidate: Candidate, job: Job, missing: list[str], matched: list[str]
) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=os.environ["DASHSCOPE_API_KEY"], base_url=DASHSCOPE_BASE_URL)
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "Draft specific skill-gap feedback for a rejected candidate. "
                    "Use only skills, experience, education, and stated job requirements. "
                    "Never mention or infer protected demographic attributes."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Draft one concise candidate-facing paragraph using this JSON.\n"
                    f"{json.dumps({'candidate': candidate.model_dump(), 'job': job.model_dump(), 'missing': missing, 'matched': matched})}"
                ),
            },
        ],
    )
    return (response.choices[0].message.content or "").strip()


def _missing_requirements(candidate: Candidate, job: Job) -> list[str]:
    candidate_skills = {_normalize(skill) for skill in candidate.skills}
    missing: list[str] = []
    for requirement in job.requirements:
        normalized = _normalize(requirement)
        if _is_experience_requirement(normalized):
            required_years = _required_years(normalized)
            if required_years is not None and candidate.experience_years < required_years:
                missing.append(requirement)
        elif normalized not in candidate_skills:
            missing.append(requirement)
    return missing


def _matched_requirements(candidate: Candidate, job: Job) -> list[str]:
    missing = set(_missing_requirements(candidate, job))
    return [requirement for requirement in job.requirements if requirement not in missing]


def _normalize(value: str) -> str:
    return " ".join(value.lower().replace(",", " ").split())


def _is_experience_requirement(value: str) -> bool:
    return "year" in value or "experience" in value


def _required_years(value: str) -> float | None:
    for token in value.replace("+", " ").split():
        try:
            return float(token)
        except ValueError:
            continue
    return None
