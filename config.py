import os
from pathlib import Path


def load_local_env(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)


def dashscope_enabled() -> bool:
    value = os.environ.get("DASHSCOPE_ENABLED", "false").strip().lower()
    return value in {"1", "true", "yes", "on"}


def frontend_origins() -> list[str]:
    raw_value = os.environ.get(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw_value.split(",") if origin.strip()]
