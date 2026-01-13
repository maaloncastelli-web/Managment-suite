import io
import os
import time
import requests
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload


OAUTH_TOKEN = os.getenv("OAUTH_TOKEN", "token.json")
DRIVE_FOLDER_ID = os.getenv("DRIVE_FOLDER_ID")


def get_drive():
    creds = Credentials.from_authorized_user_file(OAUTH_TOKEN)
    return build("drive", "v3", credentials=creds)


def download_whatsapp_file(media_id, token, version):
    meta = requests.get(
        f"https://graph.facebook.com/{version}/{media_id}",
        headers={"Authorization": f"Bearer {token}"}
    ).json()

    url = meta["url"]
    mime = meta.get("mime_type", "image/jpeg")

    file_data = requests.get(url, headers={"Authorization": f"Bearer {token}"}).content
    ext = mime.split("/")[-1]

    return file_data, ext, mime


def upload_file(data, ext, mime, comunidad, depto):
    drive = get_drive()
    timestamp = time.strftime("%Y-%m-%d_%H-%M-%S")
    name = f"{comunidad}_{depto}_{timestamp}.{ext}"

    metadata = {"name": name, "parents": [DRIVE_FOLDER_ID]}
    media = MediaIoBaseUpload(io.BytesIO(data), mimetype=mime, resumable=True)

    result = drive.files().create(
        body=metadata,
        media_body=media,
        fields="id, webViewLink"
    ).execute()

    return result.get("webViewLink")
