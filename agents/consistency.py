import re

from schemas import Job


def shortlist_has_consistency_flag(
    job: Job, candidate_skill_sets: list[list[str]], top_scores: list[float]
) -> bool:
    required_skills = _skill_requirements(job.requirements)
    if not required_skills or not candidate_skill_sets:
        return False

    shortlist_skills = {
        _normalize(skill)
        for skills in candidate_skill_sets
        for skill in skills
    }
    covered = {skill for skill in required_skills if skill in shortlist_skills}
    top_scores_low = bool(top_scores) and all(score < 0.5 for score in top_scores[:3])
    weak_coverage = len(covered) < (len(required_skills) / 2)
    return weak_coverage or top_scores_low


def _skill_requirements(requirements: list[str]) -> list[str]:
    skills: list[str] = []
    for requirement in requirements:
        normalized = _normalize(requirement)
        if "year" in normalized or "experience" in normalized:
            continue
        if normalized:
            skills.append(normalized)
    return skills


def _normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9+#.]+", " ", value.lower()).strip()
