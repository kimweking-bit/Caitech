"""WhatsApp outbound notifications (Meta Cloud API).

Requires env:
  WHATSAPP_ENABLED=true
  WHATSAPP_ACCESS_TOKEN=...
  WHATSAPP_PHONE_NUMBER_ID=...
  WHATSAPP_NOTIFY_TO=2547...   # institute staff number(s), comma-separated
  WHATSAPP_API_VERSION=v19.0   # optional
"""
from __future__ import annotations

import logging
from typing import Iterable

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _enabled() -> bool:
    return bool(getattr(settings, 'WHATSAPP_ENABLED', False)) and bool(
        getattr(settings, 'WHATSAPP_ACCESS_TOKEN', '')
    ) and bool(getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', ''))


def _recipients() -> list[str]:
    raw = getattr(settings, 'WHATSAPP_NOTIFY_TO', '') or ''
    return [p.strip() for p in raw.split(',') if p.strip()]


def send_whatsapp_text(to: str, body: str) -> bool:
    """Send a plain text message. Returns True on HTTP success. Never raises."""
    if not _enabled():
        logger.info('WhatsApp skipped (disabled or incomplete config)')
        return False
    version = getattr(settings, 'WHATSAPP_API_VERSION', 'v19.0') or 'v19.0'
    phone_id = settings.WHATSAPP_PHONE_NUMBER_ID
    url = f'https://graph.facebook.com/{version}/{phone_id}/messages'
    headers = {
        'Authorization': f'Bearer {settings.WHATSAPP_ACCESS_TOKEN}',
        'Content-Type': 'application/json',
    }
    payload = {
        'messaging_product': 'whatsapp',
        'to': to.lstrip('+'),
        'type': 'text',
        'text': {'preview_url': False, 'body': body[:4000]},
    }
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=15)
        if res.status_code >= 400:
            logger.warning('WhatsApp API %s: %s', res.status_code, res.text[:300])
            return False
        return True
    except requests.RequestException as exc:
        logger.warning('WhatsApp request failed: %s', exc)
        return False


def notify_staff(body: str, recipients: Iterable[str] | None = None) -> int:
    """Notify institute staff numbers. Returns count of successful sends."""
    targets = list(recipients) if recipients is not None else _recipients()
    ok = 0
    for to in targets:
        if send_whatsapp_text(to, body):
            ok += 1
    return ok
