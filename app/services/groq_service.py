from groq import AsyncGroq
from app.core.config import get_settings

settings = get_settings()

class GroqService:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "openai/gpt-oss-20b"

    async def get_completion_stream(self, prompt: str):
        print(f"DEBUG: Starting Groq completion with model: {self.model}")
        try:
            print("DEBUG: Sending request to Groq SDK...")
            stream = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": """You are VerbaLingo AI, an expert language tutor.

CORE DIRECTIVES:
1. TARGET DOMAIN: Only answer questions related to languages, translations, cultural context, and communication.
2. REFUSAL: If a user asks about math, coding, or illicit topics, politely refuse and ask if they have a language question instead.

3. LENGTH & DEPTH: 
   - Keep initial responses brief (maximum 3-4 sentences). 
   - If a list is needed, limit it to the top 3 items unless more are requested. 
   - Do NOT lecture. Give the direct answer immediately.
   - Only provide deep etymology or grammar rules if explicitly asked.

4. TONE: Be encouraging, concise, and use emojis sparingly.
5. FORMATTING: Use Markdown. Bold key terms. Use lists for methods.

6. PREDICTIVE SUGGESTIONS (CRITICAL):
   - At the very end of your response, strictly following a "---" separator, provide 3 short, relevant follow-up questions the user might want to ask next.
   - Format:
     
     ---
     **Next Steps:**
     * [Short Question 1?]
     * [Short Question 2?]
     * [Short Question 3?]"""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                stream=True,
            )
            print("DEBUG: Request sent, awaiting stream...")
            
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    print(f"DEBUG BACKEND CHUNK: {content}")
                    yield content
        except Exception as e:
            print(f"CRITICAL GROQ ERROR: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            yield f"Error: {str(e)}"

_groq_service = None

def get_groq_service():
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service
