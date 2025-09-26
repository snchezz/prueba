import asyncio
import datetime as dt
from pathlib import Path
from typing import Optional

from playwright.async_api import async_playwright

from ..config import SCREENSHOT_DIR


async def capture_screenshot(url: str, output_path: Path, viewport_width: int = 1280, viewport_height: int = 720) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": viewport_width, "height": viewport_height})
        await page.goto(url, wait_until="networkidle")
        await page.screenshot(path=str(output_path), full_page=True)
        await browser.close()

    return output_path


def build_screenshot_path(website_id: int, timestamp: Optional[dt.datetime] = None) -> Path:
    timestamp = timestamp or dt.datetime.utcnow()
    filename = timestamp.strftime("%Y%m%d_%H%M%S.png")
    return SCREENSHOT_DIR / str(website_id) / filename


def capture_screenshot_sync(url: str, output_path: Path) -> Path:
    return asyncio.get_event_loop().run_until_complete(capture_screenshot(url, output_path))
