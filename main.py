from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from config import frontend_origins, load_local_env

load_local_env()

from agents.consistency import shortlist_has_consistency_flag
from agents.intake import IntakeParsingError, extract_text_from_upload, parse_candidate_profile, parse_job_posting
from agents.matching import rank_candidates_for_job, to_shortlist_candidate
from agents.scheduling import draft_interview_invite, draft_skill_gap_feedback
from db import (
    add_decision_log,
    get_candidate,
    get_job,
    init_db,
    list_candidates,
    list_decision_logs,
    save_candidate,
    save_job,
)
from schemas import (
    ApprovalResponse,
    CandidateResponse,
    DecisionLogResponse,
    DecisionRequest,
    JobCreateRequest,
    JobResponse,
    RejectionResponse,
    ShortlistResponse,
)
from storage import save_uploaded_file


app = FastAPI(
    title="HireFlow API",
    description="Recruiter autopilot backend for intake, matching, human review, and audit logs.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "HireFlow API",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
    }


@app.post("/jobs", response_model=JobResponse)
def create_job(payload: JobCreateRequest) -> JobResponse:
    try:
        parsed = parse_job_posting(payload.title, payload.description_raw)
    except IntakeParsingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    job = save_job(parsed.record)
    add_decision_log(
        agent_name="intake_agent",
        decision=f"parsed {job.job_id}",
        input_summary="job posting title and raw description",
        confidence=parsed.confidence,
    )
    return JobResponse(job_id=job.job_id, title=job.title, requirements=job.requirements)


@app.post("/candidates", response_model=CandidateResponse)
async def create_candidate(
    resume_file: UploadFile | None = File(default=None),
    raw_text: str | None = Form(default=None),
) -> CandidateResponse:
    if resume_file is None and not raw_text:
        raise HTTPException(status_code=400, detail="Provide resume_file or raw_text.")

    raw_file_url = None
    source_text = raw_text or ""
    input_type = "raw candidate text"
    if resume_file is not None:
        data = await resume_file.read()
        raw_file_url = save_uploaded_file(resume_file.filename or "resume", data)
        source_text = extract_text_from_upload(resume_file.filename or "", data)
        input_type = "resume file"

    try:
        parsed = parse_candidate_profile(source_text, raw_file_url=raw_file_url)
    except IntakeParsingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    candidate = save_candidate(parsed.record)
    add_decision_log(
        agent_name="intake_agent",
        decision=f"parsed {candidate.candidate_id}",
        input_summary=input_type,
        confidence=parsed.confidence,
    )
    return CandidateResponse(
        candidate_id=candidate.candidate_id,
        name=candidate.name,
        skills=candidate.skills,
        experience_years=candidate.experience_years,
        education=candidate.education,
    )


@app.get("/jobs/{job_id}/shortlist", response_model=ShortlistResponse)
def get_shortlist(job_id: str) -> ShortlistResponse:
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    ranked = rank_candidates_for_job(job, list_candidates())
    top_confidence = ranked[0].match_score if ranked else None
    consistency_flag = shortlist_has_consistency_flag(
        job,
        [item.candidate.skills for item in ranked],
        [item.match_score for item in ranked],
    )
    add_decision_log(
        agent_name="matching_agent",
        decision=f"ranked {len(ranked)} candidates for {job_id}",
        input_summary="candidate skills vs job requirements",
        confidence=top_confidence,
    )
    add_decision_log(
        agent_name="consistency_checker",
        decision=f"checked shortlist consistency for {job_id}",
        input_summary="shortlist skills vs stated job requirements",
        confidence=None,
    )
    return ShortlistResponse(
        job_id=job_id,
        candidates=[to_shortlist_candidate(item) for item in ranked],
        consistency_flag=consistency_flag,
    )


@app.post("/decisions/{candidate_id}/approve", response_model=ApprovalResponse)
def approve_candidate(candidate_id: str, payload: DecisionRequest) -> ApprovalResponse:
    candidate = get_candidate(candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    job = get_job(payload.job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    scheduled_message = draft_interview_invite(candidate, job)
    add_decision_log(
        agent_name="human_reviewer",
        decision=f"approved {candidate_id} for {payload.job_id}",
        input_summary="reviewer approval",
        confidence=None,
        human_override=True,
    )
    add_decision_log(
        agent_name="scheduling_agent",
        decision=f"drafted interview invite for {candidate_id} and {payload.job_id}",
        input_summary="approved candidate and job details",
        confidence=0.86,
    )
    return ApprovalResponse(
        status="approved",
        scheduled_message=scheduled_message,
    )


@app.post("/decisions/{candidate_id}/reject", response_model=RejectionResponse)
def reject_candidate(candidate_id: str, payload: DecisionRequest) -> RejectionResponse:
    candidate = get_candidate(candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    job = get_job(payload.job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    skill_gap_feedback = draft_skill_gap_feedback(candidate, job)
    add_decision_log(
        agent_name="human_reviewer",
        decision=f"rejected {candidate_id} for {payload.job_id}",
        input_summary="reviewer rejection",
        confidence=None,
        human_override=True,
    )
    add_decision_log(
        agent_name="matching_agent",
        decision=f"generated skill-gap feedback for {candidate_id} and {payload.job_id}",
        input_summary="candidate profile compared with job requirements",
        confidence=0.79,
    )
    return RejectionResponse(
        status="rejected",
        skill_gap_feedback=skill_gap_feedback,
    )


@app.get("/decisions/log", response_model=DecisionLogResponse)
def get_decision_log() -> DecisionLogResponse:
    return DecisionLogResponse(log=list_decision_logs())
