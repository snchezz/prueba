from pathlib import Path
from typing import Iterable

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

from ..config import PDF_DIR


def build_pdf_path(website_id: int, suffix: str) -> Path:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    return PDF_DIR / f"website_{website_id}_{suffix}.pdf"


def create_pdf_from_images(images: Iterable[Path], output_path: Path) -> Path:
    images = list(images)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=A4)
    width, height = A4

    for image in images:
        image_reader = ImageReader(str(image))
        img_width, img_height = image_reader.getSize()
        scale = min(width / img_width, height / img_height)
        display_width = img_width * scale
        display_height = img_height * scale
        offset_x = (width - display_width) / 2
        offset_y = (height - display_height) / 2
        c.drawImage(image_reader, offset_x, offset_y, display_width, display_height)
        c.showPage()

    c.save()
    return output_path
