import json
import os
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from schemas import Candidate, DecisionLogEntry, Job


DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./hireflow_dev.db")


def _database_url() -> str:
    return os.environ.get("DATABASE_URL", DATABASE_URL)


def _is_sqlite() -> bool:
    return _database_url().startswith("sqlite:///") or not _database_url()


def _sqlite_path() -> Path:
    database_url = _database_url()
    if database_url.startswith("sqlite:///"):
        return Path(database_url.removeprefix("sqlite:///"))
    if database_url:
        raise RuntimeError("SQLite path requested while DATABASE_URL points to a non-SQLite database.")
    return Path("hireflow_dev.db")


def _connect_sqlite() -> sqlite3.Connection:
    conn = sqlite3.connect(_sqlite_path())
    conn.row_factory = sqlite3.Row
    return conn


def _connect_postgres():
    import psycopg
    from psycopg.rows import dict_row

    return psycopg.connect(_database_url(), row_factory=dict_row)


def _placeholder() -> str:
    return "?" if _is_sqlite() else "%s"


def _placeholders(count: int) -> str:
    return ", ".join(_placeholder() for _ in range(count))


def _row_value(row: Any, key: str) -> Any:
    return row[key]


def init_db() -> None:
    if _is_sqlite():
        _init_sqlite()
    else:
        _init_postgres()


def _init_sqlite() -> None:
    with _connect_sqlite() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                requirements_json TEXT NOT NULL,
                raw_file_url TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS candidates (
                candidate_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                experience_years REAL NOT NULL,
                education TEXT,
                raw_file_url TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS decision_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                decision TEXT NOT NULL,
                input_summary TEXT NOT NULL,
                confidence REAL,
                human_override INTEGER NOT NULL DEFAULT 0
            )
            """
        )


def _init_postgres() -> None:
    with _connect_postgres() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                requirements_json TEXT NOT NULL,
                raw_file_url TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS candidates (
                candidate_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                skills_json TEXT NOT NULL,
                experience_years DOUBLE PRECISION NOT NULL,
                education TEXT,
                raw_file_url TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS decision_log (
                id BIGSERIAL PRIMARY KEY,
                timestamp TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                decision TEXT NOT NULL,
                input_summary TEXT NOT NULL,
                confidence DOUBLE PRECISION,
                human_override INTEGER NOT NULL DEFAULT 0
            )
            """
        )


def save_job(job: Job) -> Job:
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        conn.execute(
            f"""
            INSERT INTO jobs (job_id, title, requirements_json, raw_file_url)
            VALUES ({_placeholders(4)})
            ON CONFLICT(job_id) DO UPDATE SET
                title = excluded.title,
                requirements_json = excluded.requirements_json,
                raw_file_url = excluded.raw_file_url
            """,
            (job.job_id, job.title, json.dumps(job.requirements), job.raw_file_url),
        )
    return job


def save_candidate(candidate: Candidate) -> Candidate:
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        conn.execute(
            f"""
            INSERT INTO candidates (
                candidate_id, name, skills_json, experience_years, education, raw_file_url
            )
            VALUES ({_placeholders(6)})
            ON CONFLICT(candidate_id) DO UPDATE SET
                name = excluded.name,
                skills_json = excluded.skills_json,
                experience_years = excluded.experience_years,
                education = excluded.education,
                raw_file_url = excluded.raw_file_url
            """,
            (
                candidate.candidate_id,
                candidate.name,
                json.dumps(candidate.skills),
                candidate.experience_years,
                candidate.education,
                candidate.raw_file_url,
            ),
        )
    return candidate


def get_job(job_id: str) -> Job | None:
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        row = conn.execute(f"SELECT * FROM jobs WHERE job_id = {_placeholder()}", (job_id,)).fetchone()
    if row is None:
        return None
    return Job(
        job_id=_row_value(row, "job_id"),
        title=_row_value(row, "title"),
        requirements=json.loads(_row_value(row, "requirements_json")),
        raw_file_url=_row_value(row, "raw_file_url"),
    )


def get_candidate(candidate_id: str) -> Candidate | None:
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        row = conn.execute(
            f"SELECT * FROM candidates WHERE candidate_id = {_placeholder()}",
            (candidate_id,),
        ).fetchone()
    if row is None:
        return None
    return Candidate(
        candidate_id=_row_value(row, "candidate_id"),
        name=_row_value(row, "name"),
        skills=json.loads(_row_value(row, "skills_json")),
        experience_years=_row_value(row, "experience_years"),
        education=_row_value(row, "education"),
        raw_file_url=_row_value(row, "raw_file_url"),
    )


def list_candidates() -> list[Candidate]:
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        rows = conn.execute("SELECT * FROM candidates ORDER BY candidate_id").fetchall()
    return [
        Candidate(
            candidate_id=_row_value(row, "candidate_id"),
            name=_row_value(row, "name"),
            skills=json.loads(_row_value(row, "skills_json")),
            experience_years=_row_value(row, "experience_years"),
            education=_row_value(row, "education"),
            raw_file_url=_row_value(row, "raw_file_url"),
        )
        for row in rows
    ]


def add_decision_log(
    *,
    agent_name: str,
    decision: str,
    input_summary: str,
    confidence: float | None,
    human_override: bool = False,
) -> DecisionLogEntry:
    entry = DecisionLogEntry(
        timestamp=datetime.now(UTC),
        agent_name=agent_name,
        decision=decision,
        input_summary=input_summary,
        confidence=confidence,
        human_override=human_override,
    )
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        conn.execute(
            f"""
            INSERT INTO decision_log (
                timestamp, agent_name, decision, input_summary, confidence, human_override
            )
            VALUES ({_placeholders(6)})
            """,
            (
                entry.timestamp.isoformat().replace("+00:00", "Z"),
                entry.agent_name,
                entry.decision,
                entry.input_summary,
                entry.confidence,
                int(entry.human_override),
            ),
        )
    return entry


def list_decision_logs() -> list[DecisionLogEntry]:
    conn_factory = _connect_sqlite if _is_sqlite() else _connect_postgres
    with conn_factory() as conn:
        rows = conn.execute("SELECT * FROM decision_log ORDER BY id").fetchall()
    return [
        DecisionLogEntry(
            timestamp=datetime.fromisoformat(_row_value(row, "timestamp").replace("Z", "+00:00")),
            agent_name=_row_value(row, "agent_name"),
            decision=_row_value(row, "decision"),
            input_summary=_row_value(row, "input_summary"),
            confidence=_row_value(row, "confidence"),
            human_override=bool(_row_value(row, "human_override")),
        )
        for row in rows
    ]
