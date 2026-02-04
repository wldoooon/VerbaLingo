import sys
from pathlib import Path
from loguru import logger

logger.remove()

LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Console
logger.add(
    sys.stderr,
    level="DEBUG",
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    colorize=True,
)

# File (human-readable)
logger.add(
    LOG_DIR / "app.log",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,
)

# JSON (machine-readable)
logger.add(
    LOG_DIR / "app.json",
    level="INFO",
    format="{message}",
    serialize=True,
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    enqueue=True,
)

# Errors only
logger.add(
    LOG_DIR / "errors.log",
    level="ERROR",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}\n{exception}",
    rotation="5 MB",
    retention="60 days",
    compression="zip",
    enqueue=True,
    backtrace=True,
    diagnose=True,
)


def setup_logging():
    logger.info("Logging initialized")
    return logger


__all__ = ["logger", "setup_logging"]
