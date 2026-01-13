import time
from whatsapp import send_text, send_list
from sheets import save_payment, save_report
from emailer import send_email
from drive import download_whatsapp_file, upload_file
from communities import load_communities
import os

WA_VERSION = os.getenv("WA_VERSION", "v20.0")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
MEET_FORM_URL = os.getenv("MEET_FORM_URL", "")


def build_community_rows(communities):
    """Convierte comunidades en formato para WhatsApp list."""
    return [{"id": name, "title": name} for name in communities.keys()]


class ChatFlow:

    def __init__(self):
        self.sessions = {}
        self.communities = load_communities()
        self.timeout_seconds = 300  # 5 minutos


    # ============================================================
    # MENSAJE DE BIENVENIDA
    # ============================================================
    def welcome(self, wa_id):
        rows = build_community_rows(self.communities)
        send_list(
            wa_id,
            header="ADMINISTRACION",
            body="Hola Selecciona tu comunidad:",
            button="Ver lista",
            rows=rows
        )
        self.sessions[wa_id] = {"state": "wait_community"}

    # ============================================================
    # 🌐 MANEJO PRINCIPAL DE MENSAJES
    # ============================================================
    def handle_message(self, wa_id, msg_type, text, media_obj=None):
        sess = self.sessions.get(wa_id, {"state": "start"})
        # Verificar expiración por inactividad
            current_time = time.time()
            last = sess.get("last_seen", current_time)

        if current_time - last > self.timeout_seconds:
            self.sessions.pop(wa_id, None)
            send_text(wa_id, "⏳ Tu sesión expiró por inactividad.\nEscribe *inicio* para comenzar.")
        return

        # Actualizar "last_seen"
            sess["last_seen"] = current_time
            self.sessions[wa_id] = sess

        
    # Atajo global para volver al menú
if text.lower() in ("menu", "volver", "atrás", "menu principal"):
    sess["state"] = "menu_main"
    self.sessions[wa_id] = sess

    send_list(
        wa_id,
        header="Menú Principal",
        body="Selecciona una opción:",
        button="Opciones",
        rows=[
            {"id": "GGCC", "title": "Ver Gasto Común"},
            {"id": "MEDIDOR", "title": "Último medidor"},
            {"id": "PAGO", "title": "Enviar comprobante"},
            {"id": "REPORTE", "title": "Reportar problema"},
            {"id": "AGENDAR", "title": "Agendar atención"},
            {"id": "SALIR", "title": "Salir"}
        ]
    )
    return


        # Comandos globales
        if text.lower() in ("inicio", "start"):
            self.welcome(wa_id)
            return
        if text.lower() in ("fin", "salir"):
            send_text(wa_id, "Has finalizado la conversación.\nEscribe *inicio* si deseas volver.")
            self.sessions.pop(wa_id, None)
            return

        state = sess["state"]

        # ============================================================
        # 1️⃣ START
        # ============================================================
        if state == "start":
            self.welcome(wa_id)
            return

        # ============================================================
        # 2️⃣ SELECCIÓN DE COMUNIDAD
        # ============================================================
        if state == "wait_community":
            if text not in self.communities:
                send_text(wa_id, "Por favor selecciona una comunidad válida.")
                self.welcome(wa_id)
                return

            sess["community"] = text
            sess["portal"] = self.communities[text]["portal"]
            sess["email"] = self.communities[text]["email"]
            sess["state"] = "wait_depto"

            send_text(wa_id, "Escribe tu número de departamento (ej: 1504)")
            self.sessions[wa_id] = sess
            return

        # ============================================================
        # 3️⃣ NÚMERO DE DEPTO
        # ============================================================
        if state == "wait_depto":
            sess["depto"] = text
            sess["state"] = "menu_main"

            send_list(
                wa_id,
                header="Menú Principal",
                body="Selecciona una opción:",
                button="Opciones",
                rows=[
                    {"id": "GGCC", "title": "Ver Gasto Común"},
                    {"id": "MEDIDOR", "title": "Último medidor"},
                    {"id": "PAGO", "title": "Enviar comprobante"},
                    {"id": "REPORTE", "title": "Reportar problema"},
                    {"id": "AGENDAR", "title": "Agendar atención"},
                    {"id": "SALIR", "title": "Salir"}
                ]
            )
            return

        # ============================================================
        # 4️⃣ MENÚ PRINCIPAL
        # ============================================================
        if state == "menu_main":

            # --- GGCC ---
            if text == "GGCC":
                sess["state"] = "ggcc_menu"
                send_list(
                    wa_id,
                    header="Gasto Común",
                    body="Selecciona:",
                    button="Opciones",
                    rows=[
                        {"id": "GG_YA", "title": "Ya tengo cuenta"},
                        {"id": "GG_NO", "title": "No registrado"},
                        {"id": "GG_BACK", "title": "Volver"}
                    ]
                )
                return

            # --- MEDIDOR ---
            if text == "MEDIDOR":
                self.send_last_reading(wa_id, sess)
                return

            # --- PAGO ---
            if text == "PAGO":
                sess["state"] = "pago_menu"
                send_list(
                    wa_id,
                    header="Pagos",
                    body="Selecciona:",
                    button="Opciones",
                    rows=[
                        {"id": "P_ENVIAR", "title": "Enviar comprobante"},
                        {"id": "P_NOREF", "title": "Pago no reflejado"},
                        {"id": "P_BACK", "title": "Volver"}
                    ]
                )
                return

            # --- REPORTE ---
            if text == "REPORTE":
                sess["state"] = "wait_reporte"
                send_text(wa_id, "Describe el problema o envía foto/video.")
                return

            # --- AGENDAR ---
            if text == "AGENDAR":
                send_text(
                    wa_id,
                    f"Agenda tu atención aquí:\n{MEET_FORM_URL}\nHorario: 12:00–18:00 hrs."
                )
                return

            # --- SALIR ---
            if text == "SALIR":
                sess["state"] = "exit_menu"
                send_list(
                    wa_id,
                    header="Salir",
                    body="¿Qué deseas hacer?",
                    button="Opciones",
                    rows=[
                        {"id": "VOLVER_INICIO", "title": "Volver al inicio"},
                        {"id": "FINALIZAR", "title": "Finalizar chat"}
                    ]
                )
                return

        # ============================================================
        # 5️⃣ SUBMENÚ GGCC
        # ============================================================
        if state == "ggcc_menu":
            portal = sess["portal"]

            if text == "GG_YA":
                if portal == "ComunidadFeliz":
                    send_text(
                        wa_id,
                        "1. Instala ComunidadFeliz\n"
                        "2. Inicia sesión con tu correo\n"
                        "3. Usa 'Olvidé mi clave' si es necesario\n"
                        "4. Ve a 'Mis Pagos'"
                    )
                else:
                    send_text(
                        wa_id,
                        "1. Instala Edifito\n"
                        "2. Ingresa con tu correo\n"
                        "3. Recupera clave si la olvidaste\n"
                        "4. Revisa 'Gastos Comunes'"
                    )
                sess["state"] = "menu_main"
                return

            if text == "GG_NO":
                comun = sess["community"]
                depto = sess["depto"]

                send_email(
                    to=sess["email"],
                    subject=f"Registro – {comun} – Dpto {depto}",
                    body="El residente solicita registro en plataforma."
                )

                send_text(wa_id, "Solicitud enviada. Recibirás confirmación.")
                sess["state"] = "menu_main"
                return

            if text == "GG_BACK":
                sess["state"] = "menu_main"
                self.handle_message(wa_id, None, "GGCC")
                return

        # ============================================================
        # 6️⃣ SUBMENÚ PAGOS
        # ============================================================
        if state == "pago_menu":
            if text == "P_ENVIAR":
                sess["state"] = "wait_pago_file"
                send_text(wa_id, "Envía la imagen o PDF del comprobante.")
                return

            if text == "P_NOREF":
                send_text(
                    wa_id,
                    "Los pagos pueden demorar 24–48h.\n"
                    "Si no aparece después, reenvía el comprobante."
                )
                sess["state"] = "menu_main"
                return

            if text == "P_BACK":
                sess["state"] = "menu_main"
                self.handle_message(wa_id, None, "PAGO")
                return

        # ============================================================
        # 7️⃣ ESPERA DE COMPROBANTE
        # ============================================================
        if state == "wait_pago_file":
            if media_obj and media_obj.get("id"):
                media_id = media_obj["id"]

                # Descargar archivo de WhatsApp
                file_data, ext, mime = download_whatsapp_file(
                    media_id, WHATSAPP_TOKEN, WA_VERSION
                )

                # Subir a Drive
                link = upload_file(
                    file_data, ext, mime, sess["community"], sess["depto"]
                )

                # Guardar en Sheet
                save_payment(
                    time.strftime("%Y-%m-%d %H:%M:%S"),
                    sess["community"],
                    sess["depto"],
                    link
                )

                # Enviar correo
                send_email(
                    to=sess["email"],
                    subject=f"Comprobante – {sess['community']} – Dpto {sess['depto']}",
                    body="El residente envió un comprobante de pago."
                )

                send_text(wa_id, "Comprobante recibido. Se procesará en 24–48h.")
                sess["state"] = "menu_main"
                return

            send_text(wa_id, "Por favor envía un archivo válido.")
            return

        # ============================================================
        # 8️⃣ REPORTES
        # ============================================================
        if state == "wait_reporte":
            descripcion = text
            fecha = time.strftime("%Y-%m-%d %H:%M:%S")

            save_report(
                fecha,
                sess["community"],
                sess["depto"],
                descripcion
            )

            send_email(
                to=sess["email"],
                subject=f"Reporte – {sess['community']} – Dpto {sess['depto']}",
                body=f"Nuevo reporte:\n\n{descripcion}"
            )

            send_text(wa_id, "Tu reporte fue enviado. Gracias.")
            sess["state"] = "menu_main"
            return

        # ============================================================
        # 9️⃣ SALIR
        # ============================================================
        if state == "exit_menu":
            if text == "VOLVER_INICIO":
                self.welcome(wa_id)
                return

            if text == "FINALIZAR":
                send_text(wa_id, "Gracias por comunicarte con ADMINISTRACION")
                self.sessions.pop(wa_id, None)
                return

    # ============================================================
    # CONSULTA DE MEDIDOR
    # ============================================================
    def send_last_reading(self, wa_id, sess):
        # En el futuro conectarás tu API de medidores
        send_text(
            wa_id,
            "Consultando tu última lectura...\n\n"
            "💧 Lectura: 12345\n"
            "📅 Fecha: 2025-01-01\n"
            "📷 Imagen: (pendiente integración)"
        )
