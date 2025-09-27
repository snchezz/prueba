import datetime as dt
from typing import Iterable, List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import select

from . import models, schemas


def create_website(session: Session, data: schemas.WebsiteCreate) -> models.Website:
    website = models.Website(**data.dict())
    session.add(website)
    session.flush()
    return website


def get_website(session: Session, website_id: int) -> Optional[models.Website]:
    return session.get(models.Website, website_id)


def list_websites(session: Session) -> List[models.Website]:
    return session.execute(select(models.Website).order_by(models.Website.id)).scalars().all()


def update_website(session: Session, website: models.Website, data: schemas.WebsiteUpdate) -> models.Website:
    for field, value in data.dict(exclude_unset=True).items():
        setattr(website, field, value)
    session.add(website)
    session.flush()
    return website


def delete_website(session: Session, website: models.Website) -> None:
    session.delete(website)


def create_screenshot(
    session: Session,
    website: models.Website,
    image_path: str,
    captured_at: Optional[dt.datetime] = None,
) -> models.Screenshot:
    screenshot = models.Screenshot(
        website=website,
        image_path=image_path,
        captured_at=captured_at or dt.datetime.utcnow(),
    )
    session.add(screenshot)
    session.flush()
    return screenshot


def get_recent_screenshots(session: Session, website: models.Website, limit: int) -> List[models.Screenshot]:
    stmt = (
        select(models.Screenshot)
        .where(models.Screenshot.website_id == website.id)
        .order_by(models.Screenshot.captured_at.desc())
        .limit(limit)
    )
    return list(reversed(session.execute(stmt).scalars().all()))


def get_pending_digest_screenshots(session: Session, website: models.Website, days: int) -> List[models.Screenshot]:
    since = website.last_digest_sent or (dt.datetime.utcnow() - dt.timedelta(days=days))
    stmt = (
        select(models.Screenshot)
        .where(
            models.Screenshot.website_id == website.id,
            models.Screenshot.captured_at >= since,
        )
        .order_by(models.Screenshot.captured_at.asc())
    )
    screenshots = session.execute(stmt).scalars().all()
    if len(screenshots) >= days:
        return screenshots[-days:]
    return []


def update_last_digest(session: Session, website: models.Website, timestamp: Optional[dt.datetime] = None) -> None:
    website.last_digest_sent = timestamp or dt.datetime.utcnow()
    session.add(website)
