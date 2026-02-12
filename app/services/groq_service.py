from groq import AsyncGroq
from app.core.config import get_settings
from app.core.logging import logger
from typing import AsyncIterable

settings = get_settings()

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        # Keeping your preferred high-speed model
        self.model = "openai/gpt-oss-20b" 
        
        if not self.api_key:
            logger.error("CRITICAL: GROQ_API_KEY is missing! AI features will fail.")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=self.api_key)
            logger.info("Groq Engine initialized successfully.")

    async def get_completion_stream(self, prompt: str) -> AsyncIterable[str]:
        """
        Streams AI tokens using an Async Generator.
        Expert Move: Catch specific API errors so the server doesn't crash.
        """
        if not self.client:
            yield "Error: AI Service not configured. Check API keys."
            return

        logger.info(f"AI Request: {len(prompt)} chars | Model: {self.model}")
        
        try:
            stream = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": """You are VerbaLingo AI, an expert language tutor.
                        Answer briefly (3-4 sentences). Provide 3 follow-up questions at the end."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                stream=True,
            )
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"Groq Logic Failure: {type(e).__name__}: {str(e)}")
            yield f"Error: [Service Interrupted] {str(e)}"

# Singleton Instance
_groq_service = None

def get_groq_service() -> GroqService:
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service
