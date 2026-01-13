import os
import gspread
from google.oauth2.service_account import Credentials


REPORTES_SPREADSHEET_ID = os.getenv("REPORTES_SPREADSHEET_ID")
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE", "service_account.json")


def get_sheet():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.readonly"
    ]
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=scopes)
    client = gspread.authorize(creds)
    return client.open_by_key(REPORTES_SPREADSHEET_ID)


def save_payment(fecha, comunidad, depto, link):
    try:
        sh = get_sheet()
        ws = sh.worksheet("Pagos")
        ws.append_row([fecha, comunidad, depto, link])
    except Exception as e:
        print("[SHEETS PAGO ERROR]", e)


def save_report(fecha, comunidad, depto, descripcion):
    try:
        sh = get_sheet()
        ws = sh.worksheet("Reportes")
        ws.append_row([fecha, comunidad, depto, descripcion])
    except Exception as e:
        print("[SHEETS REPORTE ERROR]", e)

