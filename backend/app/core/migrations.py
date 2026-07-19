from pathlib import Path


def get_migration_sql(filename: str) -> str:
    migration_path = Path(__file__).resolve().parent / "migrations" / filename
    if not migration_path.exists():
        raise FileNotFoundError(filename)
    return migration_path.read_text(encoding="utf-8")
