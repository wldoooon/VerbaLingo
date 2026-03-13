from groq import AsyncGroq
from app.core.config import get_settings
from app.core.logging import logger
from typing import AsyncIterable, Tuple, Optional

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

    async def get_completion_stream(self, prompt: str) -> AsyncIterable[Tuple[str, Optional[int]]]:
        """
        Streams AI tokens using an Async Generator.
        Yields (text_chunk, None) during the stream.
        When finished, yields ("", total_tokens) for billing.
        """
        if not self.client:
            yield "Error: AI Service not configured. Check API keys.", None
            return

        logger.info(f"AI Request: {len(prompt)} chars | Model: {self.model}")
        logger.info(f"--- FULL PROMPT FROM UI ---\n{prompt}\n---------------------------")
        
        try:
            stream = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": """You are VerbaLingo AI, an expert language tutor.
                        Answer the user's question with a medium-length, beautiful explanation.
                        Use Markdown formatting. Use tables occasionally to compare words, grammar structures, or meanings.
                        Max 2-3 paragraphs or 1 table. Be direct and highly educational."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                stream=True,
                extra_body={"stream_options": {"include_usage": True}}
            )
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content, None
                
                # Catch the Token Receipt (The Ghost Calculator)
                if getattr(chunk, "usage", None):
                    input_t = chunk.usage.prompt_tokens if getattr(chunk.usage, "prompt_tokens", None) else 0
                    output_t = chunk.usage.completion_tokens if getattr(chunk.usage, "completion_tokens", None) else 0
                    total = chunk.usage.total_tokens if getattr(chunk.usage, "total_tokens", None) else 0
                    
                    if total > 0:
                        logger.info(
                            f"\n"
                            f"╔══════════════════════════════════════════╗\n"
                            f"║         TOKEN USAGE RECEIPT            ║\n"
                            f"╚══════════════════════════════════════════╝\n"
                            f"  Input  Tokens : {input_t:>8,}  (prompt sent to Groq)\n"
                            f"  Output Tokens : {output_t:>8,}  (AI response generated)\n"
                            f"  ─────────────────────────────────────────\n"
                            f"  TOTAL  Tokens : {total:>8,}  (will be deducted from wallet)\n"
                            f"════════════════════════════════════════════"
                        )
                        yield "", total
                        return

            # Fallback: if Groq never reported usage, estimate from streamed text
            logger.warning("Ghost Calculator: No usage data received from Groq, using fallback estimation.")
            # Rough estimate: ~4 chars per token for English text (industry standard)
            # We don't have access to the full streamed text here, so yield a minimum charge
            yield "", 150  # Conservative minimum (covers ~600 chars of output + prompt overhead)

        except Exception as e:
            logger.error(f"Groq Stream Failure: {type(e).__name__}: {str(e)}")
            yield f"\n[System Error: {str(e)}]", None

# Singleton Instance
_groq_service = None

def get_groq_service() -> GroqService:
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service
