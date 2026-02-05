import asyncio
import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from asgi_lifespan import LifespanManager

from app.main import app
from app.core.config import get_settings
from app.db.session import get_session

# --- 1. SETTINGS OVERRIDE ---
settings = get_settings()

# We point to a unique test database
TEST_POSTGRES_URL = settings.postgres_url.replace(settings.POSTGRES_DB, f"{settings.POSTGRES_DB}_test")

# --- 2. GLOBAL TEST ENGINE ---
# This engine only lives during the test run
test_engine = create_async_engine(TEST_POSTGRES_URL, echo=False, future=True)

# --- 3. FIXTURES ---

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def init_db():
    """
    Sets up the database once per test session.
    It creates all tables, and then drops them at the very end.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provides a clean database session for a single test.
    Every test gets a clean transaction.
    """
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    The 'Invisible Browser'. 
    It overrides the 'get_session' dependency with our 'db_session' fixture.
    """
    def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session
    
    async with LifespanManager(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac
    
    # Clean up the override after the test
    app.dependency_overrides.clear()
