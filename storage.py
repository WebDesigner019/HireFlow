import os
from pathlib import Path
from uuid import uuid4


UPLOAD_DIR = Path("uploads")


def save_uploaded_file(filename: str, data: bytes) -> str:
    if _oss_configured():
        return _save_to_oss(filename, data)
    return _save_locally(filename, data)


def _oss_configured() -> bool:
    required = [
        "OSS_ENDPOINT",
        "OSS_BUCKET",
        "OSS_ACCESS_KEY_ID",
        "OSS_ACCESS_KEY_SECRET",
    ]
    return all(os.environ.get(name) for name in required)


def _save_to_oss(filename: str, data: bytes) -> str:
    import oss2

    auth = oss2.Auth(os.environ["OSS_ACCESS_KEY_ID"], os.environ["OSS_ACCESS_KEY_SECRET"])
    bucket = oss2.Bucket(auth, os.environ["OSS_ENDPOINT"], os.environ["OSS_BUCKET"])
    object_key = f"uploads/{uuid4().hex}_{Path(filename).name}"
    bucket.put_object(object_key, data)
    return f"oss://{os.environ['OSS_BUCKET']}/{object_key}"


def _save_locally(filename: str, data: bytes) -> str:
    UPLOAD_DIR.mkdir(exist_ok=True)
    safe_name = Path(filename or "upload.bin").name
    path = UPLOAD_DIR / f"{uuid4().hex}_{safe_name}"
    path.write_bytes(data)
    return str(path)
