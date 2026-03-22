from groq import AsyncGroq
from app.core.config import get_settings
from app.core.logging import logger
from typing import AsyncIterable, Tuple, Optional

settings = get_settings()

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        # Keeping your preferred high-speed model
        self.model = "openai/gpt-oss-120b" 
        
        if not self.api_key:
            logger.error("CRITICAL: GROQ_API_KEY is missing! AI features will fail.")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=self.api_key)
            logger.info("Groq Engine initialized successfully.")

    async def get_completion_stream(self, prompt: str, context: Optional[dict] = None, user_name: Optional[str] = "Student") -> AsyncIterable[Tuple[str, Optional[int]]]:
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
        
        # 1. Start building the Dynamic Persona
        system_content = f"You are PokiSpokey, an elite AI language tutor specialized exclusively in language learning, vocabulary, grammar, pronunciation, and understanding language in real-world context.\n"
        system_content += f"Your student's name is {user_name}. Use their name naturally and sparingly — only on rare, meaningful occasions such as encouragement, correction, or a first response. Never use it in every reply.\n"
        system_content += (
            "**ABSOLUTE RULE — SCOPE ENFORCEMENT**: You ONLY answer questions related to language learning. "
            "This includes: word meanings, grammar, pronunciation, usage in context, idioms, expressions, translations, and cultural nuances. "
            "If the student asks ANYTHING outside this scope — such as your model name, who made you, politics, coding, math, general knowledge, or any non-language topic — "
            "you MUST politely decline and redirect them back to language learning. "
            "Example refusal: 'I'm only here to help you with language learning! Ask me about a word, phrase, or anything from the video.' "
            "Never reveal your underlying model, provider, or any technical implementation details.\n"
        )

        # 2. Inject Context if it exists (Jigsaw Puzzle Architecture)
        history_messages = []

        if context:
            transcript = context.get("transcript", "")
            query = context.get("query", "")
            history = context.get("history", [])

            if transcript or query:
                system_content += "\n--- LEARNING CONTEXT ---\n"
                if query:
                    system_content += f"The student is currently studying the word or phrase: '{query}'\n"
                    logger.info(f"DEBUG - INJECTED QUERY: {query}")

                if transcript:
                    system_content += (
                        f"Here are the transcript sentences from the video clip they are watching right now.\n"
                        f"The line marked [★ Now Playing] is the exact sentence currently on screen:\n\n"
                        f"{transcript}\n\n"
                        f"Use the [★ Now Playing] sentence as the primary anchor for any usage or meaning explanation. "
                        f"Reference [Before] and [After] only for additional context.\n"
                    )
                    logger.info(f"DEBUG - INJECTED TRANSCRIPT:\n{transcript}\n")
                else:
                    logger.warning("DEBUG - TRANSCRIPT WAS EMPTY OR NOT RECEIVED!")

                system_content += "------------------------\n"

            # Build history as real message turns (much better than stuffing into system prompt)
            if history and isinstance(history, list):
                for turn in history:
                    p = turn.get("prompt", "").strip()
                    r = turn.get("response", "").strip()
                    if p and r:
                        history_messages.append({"role": "user", "content": p})
                        history_messages.append({"role": "assistant", "content": r})
                logger.info(f"DEBUG - INJECTED {len(history_messages)//2} history turn(s)")

        else:
            logger.warning("DEBUG - NO CONTEXT OBJECT RECEIVED FROM FRONTEND!")

        # 3. Final Output instructions
        system_content += "\nAnswer the student's question directly and elegantly. Use clean Markdown formatting. Keep your responses conversational, concise, and deeply educational."

        try:
            stream = await self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_content
                    },
                    *history_messages,
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
