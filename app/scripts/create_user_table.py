"""Create the `user` table in the configured Postgres database.

This uses your existing SQLModel model definitions and async engine.

Run from the repo root:
    python -m app.scripts.create_user_table

Notes:
- Idempotent: safe to run multiple times.
- Only creates the `user` table (and any required SQLModel metadata for it).
"""

import asyncio

from sqlmodel import SQLModel

from app.db.session import engine
from app.models.user import User  # ensure table is registered in metadata


async def create_user_table() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn,
                tables=[User.__table__],
            )
        )


def main() -> None:
    asyncio.run(create_user_table())


if __name__ == "__main__":
    main()
