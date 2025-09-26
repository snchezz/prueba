import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'app.db'}")

SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "" )
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "" )
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").lower() == "true"

SCREENSHOT_DIR = Path(os.getenv("SCREENSHOT_DIR", BASE_DIR / "storage" / "screenshots"))
PDF_DIR = Path(os.getenv("PDF_DIR", BASE_DIR / "storage" / "pdfs"))

DAILY_CAPTURE_HOUR = int(os.getenv("DAILY_CAPTURE_HOUR", "10"))
DAILY_CAPTURE_MINUTE = int(os.getenv("DAILY_CAPTURE_MINUTE", "0"))

DIGEST_DAYS = int(os.getenv("DIGEST_DAYS", "30"))
