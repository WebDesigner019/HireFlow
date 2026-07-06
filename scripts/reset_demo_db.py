from pathlib import Path

from db import _sqlite_path, init_db


def main() -> None:
    db_path = _sqlite_path()
    if db_path.exists():
        db_path.unlink()
    init_db()
    print(f"Reset demo database: {db_path}")


if __name__ == "__main__":
    main()
