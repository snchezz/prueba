import mimetypes
import smtplib
from email.message import EmailMessage
from pathlib import Path
from typing import Iterable, Optional

from ..config import SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME, SMTP_USE_TLS


def send_email(
    *,
    subject: str,
    body: str,
    to: str,
    attachments: Optional[Iterable[Path]] = None,
    from_email: Optional[str] = None,
) -> None:
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_email or SMTP_USERNAME or "no-reply@example.com"
    message["To"] = to
    message.set_content(body)

    for attachment in attachments or []:
        attachment_path = Path(attachment)
        if not attachment_path.exists():
            continue
        mime_type, _ = mimetypes.guess_type(str(attachment_path))
        maintype, subtype = (mime_type or "application/octet-stream").split("/", 1)
        with attachment_path.open("rb") as fp:
            message.add_attachment(
                fp.read(),
                maintype=maintype,
                subtype=subtype,
                filename=attachment_path.name,
            )

    smtp = smtplib.SMTP(host=SMTP_HOST, port=SMTP_PORT)
    try:
        if SMTP_USE_TLS:
            smtp.starttls()
        if SMTP_USERNAME:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)
    finally:
        smtp.quit()
