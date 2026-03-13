"""remove export column

Revision ID: e19c1996a50d
Revises: f097d47baa61
Create Date: 2026-03-13 00:19:43.689537

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e19c1996a50d'
down_revision: Union[str, Sequence[str], None] = 'f097d47baa61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename daily_searches_count to searches_count
    op.alter_column('user_usage', 'daily_searches_count', new_column_name='searches_count')
    
    # Drop export columns
    op.drop_column('user_usage', 'total_exports')
    op.drop_column('user_usage', 'daily_exports_count')
    
    # Update foreign key naming (optional but cleaner)
    op.drop_constraint(op.f('subscription_user_id_fkey'), 'subscription', type_='foreignkey')
    op.create_foreign_key(None, 'subscription', 'user', ['user_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    # Revert foreign key
    op.drop_constraint(None, 'subscription', type_='foreignkey')
    op.create_foreign_key(op.f('subscription_user_id_fkey'), 'subscription', 'user', ['user_id'], ['id'], ondelete='CASCADE')

    # Re-add export columns
    op.add_column('user_usage', sa.Column('daily_exports_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user_usage', sa.Column('total_exports', sa.Integer(), nullable=False, server_default='0'))
    
    # Rename searches_count back to daily_searches_count
    op.alter_column('user_usage', 'searches_count', new_column_name='daily_searches_count')
