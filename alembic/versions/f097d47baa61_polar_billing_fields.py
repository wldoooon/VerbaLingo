"""polar billing fields

Revision ID: f097d47baa61
Revises: 0fb70a9671dc
Create Date: 2026-03-12 22:16:12.758500

Changes:
- Converts tier column from PostgreSQL ENUM → VARCHAR
  (adding new tiers in future requires zero migration — just update Python enum)
- Migrates existing 'unlimited' rows → 'max'
- Drops the usertier PostgreSQL type entirely
- Adds polar_customer_id to user table
- Creates subscription table (full billing history)
- Fixes ai_credit_balance server default: 30000 → 50000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'f097d47baa61'
down_revision: Union[str, Sequence[str], None] = '0fb70a9671dc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. Convert tier column: PostgreSQL ENUM → VARCHAR ─────────────────────
    # USING tier::text casts the enum value to its string label before changing type
    op.execute("""
        ALTER TABLE "user"
        ALTER COLUMN tier TYPE VARCHAR
        USING tier::text
    """)

    # ── 2. Drop the usertier PostgreSQL type (no longer needed) ───────────────
    op.execute("DROP TYPE IF EXISTS usertier")

    # ── 3. Migrate 'unlimited' → 'max' ────────────────────────────────────────
    op.execute("UPDATE \"user\" SET tier = 'max' WHERE tier = 'unlimited'")

    # ── 4. Create subscription table ──────────────────────────────────────────
    op.create_table(
        'subscription',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('polar_subscription_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('polar_price_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('polar_product_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('status', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='active'),
        sa.Column('cancel_at_period_end', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('current_period_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscription_id'), 'subscription', ['id'], unique=False)
    op.create_index(op.f('ix_subscription_polar_subscription_id'), 'subscription', ['polar_subscription_id'], unique=True)
    op.create_index(op.f('ix_subscription_status'), 'subscription', ['status'], unique=False)
    op.create_index(op.f('ix_subscription_user_id'), 'subscription', ['user_id'], unique=False)

    # ── 5. Add polar_customer_id to user ──────────────────────────────────────
    op.add_column('user', sa.Column('polar_customer_id', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.create_index(op.f('ix_user_polar_customer_id'), 'user', ['polar_customer_id'], unique=True)

    # ── 6. Fix ai_credit_balance server default: 30000 → 50000 ───────────────
    op.alter_column(
        'user_usage', 'ai_credit_balance',
        server_default=sa.text('50000'),
        existing_type=sa.Integer(),
        existing_nullable=False,
    )


def downgrade() -> None:
    # ── 1. Restore ai_credit_balance default ──────────────────────────────────
    op.alter_column(
        'user_usage', 'ai_credit_balance',
        server_default=sa.text('30000'),
        existing_type=sa.Integer(),
        existing_nullable=False,
    )

    # ── 2. Remove polar_customer_id ───────────────────────────────────────────
    op.drop_index(op.f('ix_user_polar_customer_id'), table_name='user')
    op.drop_column('user', 'polar_customer_id')

    # ── 3. Drop subscription table ────────────────────────────────────────────
    op.drop_index(op.f('ix_subscription_user_id'), table_name='subscription')
    op.drop_index(op.f('ix_subscription_status'), table_name='subscription')
    op.drop_index(op.f('ix_subscription_polar_subscription_id'), table_name='subscription')
    op.drop_index(op.f('ix_subscription_id'), table_name='subscription')
    op.drop_table('subscription')

    # ── 4. Restore tier column: VARCHAR → ENUM ────────────────────────────────
    # Downgrade users on new tiers back to 'free' (lossy by design)
    op.execute("UPDATE \"user\" SET tier = 'free' WHERE tier IN ('basic', 'premium', 'max')")
    op.execute("UPDATE \"user\" SET tier = 'unlimited' WHERE tier = 'max'")
    op.execute("CREATE TYPE usertier AS ENUM ('free', 'pro', 'unlimited')")
    op.execute("""
        ALTER TABLE "user"
        ALTER COLUMN tier TYPE usertier
        USING tier::text::usertier
    """)
