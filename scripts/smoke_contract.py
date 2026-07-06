import json
import sys
import urllib.parse
import urllib.request


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"


def request_json(path: str, *, method: str = "GET", body: bytes | None = None, content_type: str | None = None) -> dict:
    headers = {}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        headers=headers,
        method=method,
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def require_keys(payload: dict, keys: set[str], label: str) -> None:
    actual = set(payload.keys())
    missing = keys - actual
    if missing:
        raise AssertionError(f"{label} missing keys: {sorted(missing)}")


def main() -> None:
    health = request_json("/health")
    require_keys(health, {"status"}, "GET /health")

    job = request_json(
        "/jobs",
        method="POST",
        body=json.dumps(
            {
                "title": "Backend Engineer",
                "description_raw": "Need Python FastAPI PostgreSQL and 2+ years experience",
            }
        ).encode("utf-8"),
        content_type="application/json",
    )
    require_keys(job, {"job_id", "title", "requirements"}, "POST /jobs")

    candidate = request_json(
        "/candidates",
        method="POST",
        body=urllib.parse.urlencode(
            {
                "raw_text": "Jane Doe\nPython FastAPI SQL\n1.5 years experience\nB.Sc. Informatics",
            }
        ).encode("utf-8"),
        content_type="application/x-www-form-urlencoded",
    )
    require_keys(
        candidate,
        {"candidate_id", "name", "skills", "experience_years", "education"},
        "POST /candidates",
    )

    shortlist = request_json(f"/jobs/{job['job_id']}/shortlist")
    require_keys(shortlist, {"job_id", "candidates", "consistency_flag"}, "GET /jobs/{job_id}/shortlist")
    if shortlist["candidates"]:
        require_keys(
            shortlist["candidates"][0],
            {"candidate_id", "name", "match_score", "reasoning"},
            "shortlist candidate",
        )

    approval = request_json(
        f"/decisions/{candidate['candidate_id']}/approve",
        method="POST",
        body=json.dumps({"job_id": job["job_id"]}).encode("utf-8"),
        content_type="application/json",
    )
    require_keys(approval, {"status", "scheduled_message"}, "POST /decisions/{candidate_id}/approve")

    rejection = request_json(
        f"/decisions/{candidate['candidate_id']}/reject",
        method="POST",
        body=json.dumps({"job_id": job["job_id"]}).encode("utf-8"),
        content_type="application/json",
    )
    require_keys(rejection, {"status", "skill_gap_feedback"}, "POST /decisions/{candidate_id}/reject")

    log = request_json("/decisions/log")
    require_keys(log, {"log"}, "GET /decisions/log")
    if log["log"]:
        require_keys(
            log["log"][-1],
            {"timestamp", "agent_name", "decision", "input_summary", "confidence", "human_override"},
            "decision log entry",
        )

    print("Contract smoke test passed")


if __name__ == "__main__":
    main()
