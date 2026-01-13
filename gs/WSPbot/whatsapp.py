import os
import requests

WA_VERSION = os.getenv("WA_VERSION", "v20.0")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "")


def wa_endpoint():
    return f"https://graph.facebook.com/{WA_VERSION}/{PHONE_NUMBER_ID}/messages"


def wa_post(payload: dict):
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    r = requests.post(wa_endpoint(), headers=headers, json=payload)
    if r.status_code >= 300:
        print("[WA ERROR]", r.status_code, r.text)
    return r


def send_text(to: str, msg: str):
    wa_post({
        "messaging_product": "whatsapp",
        "to": to,
        "type": "text",
        "text": {"body": msg}
    })


def send_list(to: str, header: str, body: str, button: str, rows: list):
    wa_post({
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {"type": "text", "text": header},
            "body": {"text": body},
            "action": {"button": button, "sections": [{"title": header, "rows": rows}]}
        }
    })

