import json
import os
import re
from dataclasses import dataclass
from io import BytesIO
from uuid import uuid4

from config import dashscope_enabled
from schemas import Candidate, Job


DASHSCOPE_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
DEFAULT_MODEL = os.environ.get("DASHSCOPE_MODEL", "qwen-plus")


class IntakeParsingError(RuntimeError):
    pass


@dataclass(frozen=True)
class ParsedResult:
    record: Candidate | Job
    confidence: float
    parser: str


def parse_job_posting(title: str, description_raw: str, raw_file_url: str | None = None) -> ParsedResult:
    if dashscope_enabled() and os.environ.get("DASHSCOPE_API_KEY"):
        try:
            payload = _parse_with_qwen(
                kind="job",
                text=f"Title: {title}\n\nDescription:\n{description_raw}",
                expected_keys=["title", "requirements"],
            )
            job = Job(
                job_id=_new_id("job"),
                title=str(payload.get("title") or title),
                requirements=_clean_string_list(payload.get("requirements")),
                raw_file_url=raw_file_url,
            )
            _validate_requirements(job.requirements)
            return ParsedResult(record=job, confidence=0.9, parser="qwen")
        except Exception:
            pass

    job = Job(
        job_id=_new_id("job"),
        title=title,
        requirements=_fallback_requirements(description_raw),
        raw_file_url=raw_file_url,
    )
    parser = "qwen_failed_local_fallback" if dashscope_enabled() else "local_fallback"
    return ParsedResult(record=job, confidence=0.55, parser=parser)


def parse_candidate_profile(text: str, raw_file_url: str | None = None) -> ParsedResult:
    if dashscope_enabled() and os.environ.get("DASHSCOPE_API_KEY"):
        try:
            payload = _parse_with_qwen(
                kind="candidate",
                text=text,
                expected_keys=["name", "skills", "experience_years", "education"],
            )
            candidate = Candidate(
                candidate_id=_new_id("cand"),
                name=str(payload.get("name") or "Unknown Candidate"),
                skills=_clean_string_list(payload.get("skills")),
                experience_years=float(payload.get("experience_years") or 0),
                education=payload.get("education"),
                raw_file_url=raw_file_url,
            )
            _validate_skills(candidate.skills)
            return ParsedResult(record=candidate, confidence=0.88, parser="qwen")
        except Exception:
            pass

    candidate = Candidate(
        candidate_id=_new_id("cand"),
        name=_fallback_name(text),
        skills=_fallback_skills(text),
        experience_years=_fallback_experience_years(text),
        education=_fallback_education(text),
        raw_file_url=raw_file_url,
    )
    parser = "qwen_failed_local_fallback" if dashscope_enabled() else "local_fallback"
    return ParsedResult(record=candidate, confidence=0.52, parser=parser)


def extract_text_from_upload(filename: str, data: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        return _extract_pdf_text(data)
    return data.decode("utf-8", errors="ignore")


def _parse_with_qwen(kind: str, text: str, expected_keys: list[str]) -> dict:
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["DASHSCOPE_API_KEY"],
        base_url=DASHSCOPE_BASE_URL,
    )
    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You extract hiring data into strict JSON. Use only stated skills, "
                    "experience, education, requirements, and availability. Never infer "
                    "or include protected demographic attributes such as race, gender, age, "
                    "religion, disability, or ethnicity."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Parse this {kind}. Return one JSON object with exactly these keys: "
                    f"{', '.join(expected_keys)}.\n\n{text}"
                ),
            },
        ],
    )
    content = response.choices[0].message.content
    try:
        payload = json.loads(content or "{}")
    except json.JSONDecodeError as exc:
        raise IntakeParsingError("Qwen returned invalid JSON for intake parsing.") from exc
    if not isinstance(payload, dict):
        raise IntakeParsingError("Qwen intake response must be a JSON object.")
    return payload


def _extract_pdf_text(data: bytes) -> str:
    import pdfplumber

    with pdfplumber.open(BytesIO(data)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages).strip()


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:8]}"


def _clean_string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def _validate_requirements(requirements: list[str]) -> None:
    if not requirements:
        raise IntakeParsingError("Parsed job has no requirements.")


def _validate_skills(skills: list[str]) -> None:
    if not skills:
        raise IntakeParsingError("Parsed candidate has no skills.")


def _fallback_requirements(text: str) -> list[str]:
    requirements = _fallback_skills(text)
    experience = _fallback_experience_requirement(text)
    if experience:
        requirements.append(experience)
    return requirements or ["Python", "FastAPI", "PostgreSQL", "2+ years experience"]


def _fallback_skills(text: str) -> list[str]:
    known_skills = [
        "Python",
        "FastAPI",
        "PostgreSQL",
        "SQL",
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Docker",
        "AWS",
        "Alibaba Cloud",
        "REST APIs",
        "Machine Learning",
    ]
    lower_text = text.lower()
    return [skill for skill in known_skills if skill.lower() in lower_text]


def _fallback_experience_requirement(text: str) -> str | None:
    match = re.search(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)", text, flags=re.IGNORECASE)
    if match:
        return f"{match.group(1)}+ years experience"
    return None


def _fallback_experience_years(text: str) -> float:
    match = re.search(r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)", text, flags=re.IGNORECASE)
    return float(match.group(1)) if match else 0.0


def _fallback_education(text: str) -> str | None:
    patterns = [
        r"(B\.?Sc\.?[^\n,]*)",
        r"(Bachelor[^\n,]*)",
        r"(M\.?Sc\.?[^\n,]*)",
        r"(Master[^\n,]*)",
        r"(Ph\.?D\.?[^\n,]*)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _fallback_name(text: str) -> str:
    for line in text.splitlines():
        cleaned = line.strip()
        if cleaned and len(cleaned.split()) <= 4 and not any(char.isdigit() for char in cleaned):
            return cleaned
    return "Unknown Candidate"
