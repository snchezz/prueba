import datetime as dt
from typing import Optional

from pydantic import BaseModel, HttpUrl, EmailStr


class WebsiteBase(BaseModel):
    name: str
    url: HttpUrl
    recipient_email: EmailStr
    active: bool = True


class WebsiteCreate(WebsiteBase):
    pass


class WebsiteUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    recipient_email: Optional[EmailStr] = None
    active: Optional[bool] = None


class WebsiteRead(WebsiteBase):
    id: int
    created_at: dt.datetime
    last_digest_sent: Optional[dt.datetime]

    class Config:
        orm_mode = True


class ScreenshotRead(BaseModel):
    id: int
    image_path: str
    captured_at: dt.datetime

    class Config:
        orm_mode = True
