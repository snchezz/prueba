import asyncio
import datetime as dt
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .config import DAILY_CAPTURE_HOUR, DAILY_CAPTURE_MINUTE, DIGEST_DAYS
from .crud import (
    create_screenshot,
    get_pending_digest_screenshots,
    list_websites,
    update_last_digest,
)
from .database import get_session
from .models import Website
from .services.email import send_email
from .services.pdf import build_pdf_path, create_pdf_from_images
from .services.screenshot import build_screenshot_path, capture_screenshot


async def process_website(website: Website) -> None:
    timestamp = dt.datetime.utcnow()
    screenshot_path = build_screenshot_path(website.id, timestamp)
    await capture_screenshot(website.url, screenshot_path)

    with get_session() as session:
        website_db = session.merge(website)
        create_screenshot(session, website_db, str(screenshot_path), timestamp)

    send_email(
        subject=f"Captura diaria - {website.name}",
        body=f"Captura realizada el {timestamp.isoformat()} UTC",
        to=website.recipient_email,
        attachments=[screenshot_path],
    )

    await maybe_send_digest(website)


async def maybe_send_digest(website: Website) -> None:
    with get_session() as session:
        website_db = session.get(Website, website.id)
        if website_db is None:
            return

        screenshots = get_pending_digest_screenshots(session, website_db, DIGEST_DAYS)
        if not screenshots:
            return

        pdf_path = build_pdf_path(website_db.id, dt.datetime.utcnow().strftime("%Y%m%d"))
        create_pdf_from_images((Path(s.image_path) for s in screenshots), pdf_path)
        send_email(
            subject=f"Resumen de {DIGEST_DAYS} días - {website_db.name}",
            body=f"Adjunto encontrará el resumen de capturas de los últimos {DIGEST_DAYS} días.",
            to=website_db.recipient_email,
            attachments=[pdf_path],
        )
        update_last_digest(session, website_db)


async def run_daily_job() -> None:
    with get_session() as session:
        websites = [w for w in list_websites(session) if w.active]

    for website in websites:
        try:
            await process_website(website)
        except Exception as exc:  # pragma: no cover - logging placeholder
            print(f"Error processing website {website.id}: {exc}")


scheduler = AsyncIOScheduler()


def start_scheduler() -> None:
    scheduler.add_job(
        lambda: asyncio.create_task(run_daily_job()),
        CronTrigger(hour=DAILY_CAPTURE_HOUR, minute=DAILY_CAPTURE_MINUTE),
        id="daily_capture",
        replace_existing=True,
    )
    if not scheduler.running:
        scheduler.start()
