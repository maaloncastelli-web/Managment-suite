from fastapi import FastAPI, Request, HTTPException
from flow import ChatFlow
import os

VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")

app = FastAPI()
flow = ChatFlow()


@app.get("/webhook")
def verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return int(challenge)

    raise HTTPException(status_code=403)


@app.post("/webhook")
async def webhook(request: Request):
    body = await request.json()

    try:
        entry = body["entry"][0]["changes"][0]["value"]
        messages = entry.get("messages", [])
        if not messages:
            return {"status": "ok"}

        msg = messages[0]
        wa_id = msg["from"]
        msg_type = msg["type"]

        text = ""
        media_info = None

        if msg_type == "text":
            text = msg["text"]["body"]

        elif msg_type == "interactive":
            inter = msg["interactive"]
            if inter["type"] == "list_reply":
                text = inter["list_reply"]["id"]
            elif inter["type"] == "button_reply":
                text = inter["button_reply"]["id"]

        elif msg_type in ("image", "document"):
            media_info = msg[msg_type]
            text = "[media]"

        flow.handle_message(wa_id, msg_type, text, media_info)

    except Exception as e:
        print("[WEBHOOK ERROR]", e)

    return {"status": "ok"}
