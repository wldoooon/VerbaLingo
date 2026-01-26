from typing import List
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import get_settings
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from datetime import datetime

settings = get_settings()

# Get the templates directory path
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

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
            TEMPLATE_FOLDER=None  # We handle templates manually with Jinja2
        )
        self.fastmail = FastMail(self.config)
        
        # Set up Jinja2 environment for email templates
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(TEMPLATES_DIR)),
            autoescape=True
        )

    def _render_template(self, template_name: str, **context) -> str:
        """Render an email template with the given context."""
        template = self.jinja_env.get_template(template_name)
        return template.render(**context)

    async def send_otp(self, email: List[EmailStr], otp: str):
        """
        Sends an OTP code for password reset.
        """
        if not settings.MAIL_USERNAME:
            print(f"Authentication (MOCK): Sending OTP {otp} to {email}")
            return

        # Render the professional OTP email template
        html = self._render_template(
            "otp_email.html",
            otp=otp,
            year=datetime.now().year
        )

        message = MessageSchema(
            subject="VerbaLingo - Password Reset Code",
            recipients=email,
            body=html,
            subtype=MessageType.html
        )

        await self.fastmail.send_message(message)
        print(f"Email sent to {email}")

email_service = EmailService()

