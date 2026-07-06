from datetime import datetime

from pydantic import BaseModel, Field


class JobCreateRequest(BaseModel):
    title: str
    description_raw: str


class Job(BaseModel):
    job_id: str
    title: str
    requirements: list[str]
    raw_file_url: str | None = None


class JobResponse(BaseModel):
    job_id: str
    title: str
    requirements: list[str]


class Candidate(BaseModel):
    candidate_id: str
    name: str
    skills: list[str]
    experience_years: float
    education: str | None
    raw_file_url: str | None = None


class CandidateResponse(BaseModel):
    candidate_id: str
    name: str
    skills: list[str]
    experience_years: float
    education: str | None


class ShortlistCandidate(BaseModel):
    candidate_id: str
    name: str
    match_score: float = Field(ge=0, le=1)
    reasoning: str


class ShortlistResponse(BaseModel):
    job_id: str
    candidates: list[ShortlistCandidate]
    consistency_flag: bool


class DecisionRequest(BaseModel):
    job_id: str


class ApprovalResponse(BaseModel):
    status: str
    scheduled_message: str


class RejectionResponse(BaseModel):
    status: str
    skill_gap_feedback: str


class MatchResult(BaseModel):
    candidate_id: str
    job_id: str
    match_score: float = Field(ge=0, le=1)
    reasoning: str


class DecisionLogEntry(BaseModel):
    timestamp: datetime
    agent_name: str
    decision: str
    input_summary: str
    confidence: float | None
    human_override: bool = False


class DecisionLogResponse(BaseModel):
    log: list[DecisionLogEntry]
