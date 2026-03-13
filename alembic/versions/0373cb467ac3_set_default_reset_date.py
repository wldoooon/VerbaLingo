"""set default reset date

Revision ID: 0373cb467ac3
Revises: e19c1996a50d
Create Date: 2026-03-13 01:20:37.153225

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from datetime import datetime, timezone

# revision identifiers, used by Alembic.
revision: str = '0373cb467ac3'
down_revision: Union[str, Sequence[str], None] = 'e19c1996a50d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: ensure usage_reset_at exists with correct type."""
    # We use an inspector to make this migration "Idempotent" 
    # (Safe to run in production and local dev even if we manually tinkered)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [c['name'] for c in inspector.get_columns('user_usage')]

    # Case 1: Column already exists as 'usage_reset_at' (Manual fix success)
    if 'usage_reset_at' in columns:
        # Just ensure it's NOT NULL and correct type just in case
        op.alter_column('user_usage', 'usage_reset_at',
                   existing_type=sa.DateTime(timezone=True),
                   nullable=False)
        
    # Case 2: We have the old 'usage_reset_date' name
    elif 'usage_reset_date' in columns:
        # Backfill NULLs
        op.execute("UPDATE user_usage SET usage_reset_date = CURRENT_TIMESTAMP WHERE usage_reset_date IS NULL")
        # Rename
        op.alter_column('user_usage', 'usage_reset_date', new_column_name='usage_reset_at')
        # Change Type
        op.execute("""
            ALTER TABLE user_usage 
            ALTER COLUMN usage_reset_at TYPE TIMESTAMP WITH TIME ZONE 
            USING usage_reset_at::timestamp with time zone
        """)
        # Ensure NOT NULL
        op.alter_column('user_usage', 'usage_reset_at',
                   existing_type=sa.DateTime(timezone=True),
                   nullable=False)
                   
    # Case 3: Fresh production start (Neither column exists)
    else:
        op.add_column('user_usage', sa.Column('usage_reset_at', sa.DateTime(timezone=True), nullable=True))
        op.execute("UPDATE user_usage SET usage_reset_at = CURRENT_TIMESTAMP")
        op.alter_column('user_usage', 'usage_reset_at', nullable=False)


def downgrade() -> None:
    """Downgrade schema: Revert to usage_reset_date as DATE."""
    # Only downgrade if it exists
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [c['name'] for c in inspector.get_columns('user_usage')]
    
    if 'usage_reset_at' in columns:
        # Allow NULLs
        op.alter_column('user_usage', 'usage_reset_at',
                   existing_type=sa.DateTime(timezone=True),
                   nullable=True)
                   
        # Revert type
        op.execute("""
            ALTER TABLE user_usage 
            ALTER COLUMN usage_reset_at TYPE DATE 
            USING usage_reset_at::date
        """)
        
        # Rename back
        op.alter_column('user_usage', 'usage_reset_at', new_column_name='usage_reset_date')
