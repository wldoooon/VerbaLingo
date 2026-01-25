from typing import List
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import get_settings
from jinja2 import Environment, FileSystemLoader

settings = get_settings()

class EmailService:
    def __init__(self):
        self.config = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            # For Gmail, SSL is usually False, TLS is True (StartTLS) on port 587
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
            TEMPLATE_FOLDER=None # We will use inline or a path later if needed
        )
        self.fastmail = FastMail(self.config)

    async def send_otp(self, email: List[EmailStr], otp: str):
        """
        Sends an OTP code for password reset.
        """
        if not settings.MAIL_USERNAME:
            print(f"Authentication (MOCK): Sending OTP {otp} to {email}")
            return

        html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset. Use the code below to proceed:</p>
            <h1 style="color: #4F46E5; letter-spacing: 5px; font-size: 32px;">{otp}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <small>The VerbaLingo Team</small>
        </div>
        """

        message = MessageSchema(
            subject="VerbaLingo - Password Reset Code",
            recipients=email,
            body=html,
            subtype=MessageType.html
        )

        await self.fastmail.send_message(message)
        print(f"Email sent to {email}")

email_service = EmailService()
