"""
Translation service using LibreTranslate
Based on: https://github.com/wagtail/wagtail-localize/blob/main/wagtail_localize/machine_translators/libretranslate.py
"""
import requests
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class TranslationService:
    def __init__(self, api_url: str = "http://127.0.0.1:5000"):
        """
        Initialize LibreTranslate client
        
        Args:
            api_url: LibreTranslate API URL (use container name for docker network)
        """
        self.api_url = api_url.rstrip("/")
        self.timeout = 30  # Timeout for translation requests
        
    def get_supported_languages(self) -> List[dict]:
        """Get list of supported languages from LibreTranslate"""
        try:
            response = requests.get(
                f"{self.api_url}/languages",
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get supported languages: {e}")
            return []
    
    def translate_text(
        self, 
        text: str, 
        source_lang: str = "en", 
        target_lang: str = "ar"
    ) -> Optional[str]:
        """
        Translate text using LibreTranslate
        
        Args:
            text: Text to translate
            source_lang: Source language code (e.g., 'en', 'fr')
            target_lang: Target language code (e.g., 'ar', 'es')
            
        Returns:
            Translated text or None if translation fails
        """
        if not text or not text.strip():
            return text
            
        try:
            response = requests.post(
                f"{self.api_url}/translate",
                json={
                    "q": text,
                    "source": source_lang,
                    "target": target_lang,
                    "format": "text"
                },
                headers={"Content-Type": "application/json"},
                timeout=self.timeout
            )
            response.raise_for_status()
            result = response.json()
            return result.get("translatedText", "")
        except requests.exceptions.Timeout:
            logger.error(f"Translation timeout for text: {text[:50]}...")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Translation failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during translation: {e}")
            return None
    
    def translate_batch(
        self,
        texts: List[str],
        source_lang: str = "en",
        target_lang: str = "ar"
    ) -> List[Optional[str]]:
        """
        Translate multiple texts (one by one to avoid API limits)
        
        Args:
            texts: List of texts to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            List of translated texts (None for failed translations)
        """
        translations = []
        for text in texts:
            translated = self.translate_text(text, source_lang, target_lang)
            translations.append(translated)
        return translations
    
    def health_check(self) -> bool:
        """Check if LibreTranslate service is available"""
        try:
            response = requests.get(
                f"{self.api_url}/languages",
                timeout=5
            )
            return response.status_code == 200
        except Exception:
            return False


# Singleton instance
_translation_service: Optional[TranslationService] = None


def get_translation_service() -> TranslationService:
    """Get or create translation service singleton"""
    global _translation_service
    if _translation_service is None:
        # Lazy import to avoid potential circular imports at module level
        try:
            from app.core.config import get_settings
            settings = get_settings()
            base_url = getattr(settings, "LIBRETRANSLATE_URL", "http://127.0.0.1:5000")
        except Exception:
            # Fall back to localhost if settings import fails
            base_url = "http://127.0.0.1:5000"

        _translation_service = TranslationService(api_url=base_url)
    return _translation_service
