import pytest
from httpx import AsyncClient
from app.core.security import verify_password
from sqlmodel import select
from app.models.user import User

@pytest.mark.asyncio
async def test_signup_success(client: AsyncClient, db_session):
    """
    STORY: A new user tries to register with valid data.
    EXPECTATION: Account created, status 201, password hidden.
    """
    payload = {
        "email": "sara@example.com",
        "password": "securepassword123"
    }
    
    # 1. Action: Send the request to our "Invisible Browser"
    response = await client.post("/auth/signup", json=payload)
    
    # 2. Assertions: Verify the response
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "sara@example.com"
    assert "id" in data
    assert "password" not in data  # Security check: Never leak password!
    
    # 3. Double Check: Verify the data is actually in the "Stunt Double" DB
    statement = select(User).where(User.email == "sara@example.com")
    result = await db_session.exec(statement)
    db_user = result.first()
    
    assert db_user is not None
    assert db_user.email == "sara@example.com"
    # Ensure it's hashed, not raw!
    assert db_user.hashed_password != "securepassword123"

@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    """
    STORY: A user tries to register with an email that already exists.
    EXPECTATION: Server rejects with 400 Bad Request.
    """
    payload = {"email": "duplicate@example.com", "password": "pass"}
    
    # First signup
    await client.post("/auth/signup", json=payload)
    
    # Second signup with same email
    response = await client.post("/auth/signup", json=payload)
    
    assert response.status_code == 400
    assert response.json()["detail"] == "A user with this email already exists."

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """
    STORY: User provides correct credentials.
    EXPECTATION: Login message and a secure HTTPOnly Cookie set.
    """
    # 1. Setup: Create the user first
    signup_payload = {"email": "login@example.com", "password": "correct_pass"}
    await client.post("/auth/signup", json=signup_payload)
    
    # 2. Action: Try to login
    login_payload = {"email": "login@example.com", "password": "correct_pass"}
    response = await client.post("/auth/login", json=login_payload)
    
    # 3. Assertions
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"
    
    # IMPORTANT: Check if the secure cookie was issued
    assert "access_token" in response.cookies
