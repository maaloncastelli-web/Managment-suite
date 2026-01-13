# WhatsApp Business Bot

Bot inteligente para gestión de pagos y reportes vía WhatsApp integrado con Google Sheets y Drive.

## Características

### 1. **Flujos Conversacionales**
- Bienvenida con selección de comunidad
- Menús interactivos (list replies)
- Estados de sesión persistentes
- Timeout automático (5 minutos de inactividad)

### 2. **Gestión de Pagos**
- Generación de links de pago
- Registro de transacciones
- Confirmación automática

### 3. **Reportes**
- Envío de reportes de problemas
- Captura de fotos/evidencia
- Carga automática a Google Drive
- Registro en Google Sheets

### 4. **Procesamiento Multimedia**
- Descarga de imágenes
- Manejo de documentos
- Soporte para videos
- Links automáticos

### 5. **Notificaciones**
- Emails transaccionales
- Alertas de estado
- Respuestas automáticas

## Arquitectura

### Flujo General
```
WhatsApp Message
    |
FastAPI Webhook (/webhook)
    |
ChatFlow (Máquina de estados)
    |
├── Identifica comunidad
├── Procesa solicitud
├── Descarga media (si aplica)
├── Sube a Google Drive
├── Registra en Sheets
└── Envía respuesta
```

### Stack Tecnológico
```
Framework:   FastAPI (async)
Server:      Uvicorn
Language:    Python 3.9+
APIs:        WhatsApp Cloud API
Integration: Google Sheets, Google Drive, Email
Auth:        Service Account (Google)
Async:       asyncio, requests
```

## Estructura de Archivos

```
WSPbot/
├── main.py              # Servidor FastAPI + rutas
├── flow.py              # Lógica de flujo conversacional
├── whatsapp.py          # Integración WhatsApp
├── sheets.py            # Integración Google Sheets
├── drive.py             # Integración Google Drive
├── emailer.py           # Notificaciones por email
├── communities.py       # Carga de comunidades
├── requirements.txt     # Dependencias Python
└── README.md           # Este archivo
```

## Variables de Configuración

### Requeridas en `.env`

```env
# WhatsApp Cloud API
VERIFY_TOKEN=tu_token_secreto_aleatorio
WHATSAPP_TOKEN=waba_......
WHATSAPP_PHONE_ID=120..........
WHATSAPP_BUSINESS_ACCOUNT_ID=......

# Google Sheets
REPORTES_SPREADSHEET_ID=1A7x......
SERVICE_ACCOUNT_FILE=service_account.json

# Configuración opcional
WA_VERSION=v20.0
MEET_FORM_URL=https://example.com/form
TIMEZONE=America/Santiago
```

### Archivos Necesarios

```
service_account.json      # Credenciales de Google Service Account
communities.json          # Lista de comunidades (estructura)
```

## Instalación

### Paso 1: Dependencias
```bash
cd gs/WSPbot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Paso 2: Credenciales Google
```bash
# 1. Ve a Google Cloud Console
# 2. Crea Service Account
# 3. Descarga JSON
# 4. Coloca aquí como service_account.json

# NO COMITEES ESTE ARCHIVO (está en .gitignore)
```

### Paso 3: Configurar WhatsApp
```
1. Meta Business Manager → Apps → WhatsApp
2. Copia Token → WHATSAPP_TOKEN en .env
3. Copia Phone ID → WHATSAPP_PHONE_ID
4. Copia Business Account ID → WHATSAPP_BUSINESS_ACCOUNT_ID
5. Genera tu VERIFY_TOKEN (cualquier string aleatorio)
```

### Paso 4: Ejecutar
```bash
python main.py
# Server estará en http://localhost:8000
```

## Webhook Configuration

### URL del Webhook
```
https://tu-dominio.com/webhook
```

### En Meta Business Manager:

1. **App Settings → Webhooks**
   - Callback URL: `https://tu-dominio.com/webhook`
   - Verify Token: Tu `VERIFY_TOKEN` secreto

2. **Suscribir a eventos:**
   - messages
   - message_status

3. **Test:**
   ```bash
   curl "https://tu-servidor.com/webhook?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=test"
   # Debería responder: test
   ```

## Flujos Conversacionales

### Flujo 1: Selección de Comunidad
```
Usuario envía cualquier mensaje
    |
Bot responde: "Hola! Selecciona tu comunidad"
    |
Lista con todas las comunidades disponibles
    |
Usuario selecciona una
    |
Guardado en sesión, siguiente paso
```

### Flujo 2: Reporte de Problema
```
Usuario selecciona: "Reportar problema"
    |
Bot: "¿Qué tipo de problema?"
    |
Usuario selecciona (avería, daño, etc)
    |
Bot: "Envía foto de evidencia"
    |
Usuario envía imagen
    |
Bot descarga, sube a Drive, registra en Sheets
    |
Confirmación: "Reporte #123 registrado"
```

### Flujo 3: Solicitar Pago
```
Usuario selecciona: "Realizar pago"
    |
Bot: "¿Depto? (ej: 101)"
    |
Usuario ingresa número
    |
Bot genera link de pago
    |
Guarda link en Sheets
    |
Usuario hace clic en link → Paga
```

## Seguridad

### Validación
- VERIFY_TOKEN en webhook
- Validación de IDs de teléfono
- Límite de sesión (timeout)
- No almacena datos sensibles en memoria

### Confidencialidad
- Credenciales solo en .env
- Service Account no commiteado
- Tokens rotados regularmente
- Logs no contienen datos personales

## Funciones Principales

### `flow.py`

```python
class ChatFlow:
    def welcome(wa_id)              # Saludo inicial
    def handle_message(wa_id, ...)  # Router principal
    def process_payment(...)         # Solicitar pago
    def process_report(...)          # Registrar reporte
    def handle_timeout(wa_id)       # Cerrar sesión vencida
```

### `whatsapp.py`

```python
send_text(wa_id, text)              # Enviar texto
send_list(wa_id, header, body, ...)  # Menú interactivo
send_media(wa_id, media_url)        # Enviar imagen/video
send_reaction(wa_id, msg_id, emoji) # Reacción emoji
```

### `sheets.py`

```python
save_payment(fecha, comunidad, depto, link)
save_report(fecha, comunidad, depto, desc)
get_communities()
```

### `drive.py`

```python
download_whatsapp_file(media_id)    # Descargar de WhatsApp
upload_file(folder_id, filename, blob)  # Subir a Drive
create_folder(parent_id, folder_name)   # Crear carpeta
```

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| "Invalid VERIFY_TOKEN" | Token no coincide | Verifica que VERIFY_TOKEN en .env === Meta |
| "Forbidden" en webhook | Credenciales inválidas | Verifica WHATSAPP_TOKEN |
| Media no descarga | Problema de permisos | Verifica service_account.json |
| Sheets no guarda | Sheet ID incorrecto | Verifica REPORTES_SPREADSHEET_ID |
| Timeout funciona mal | Timer no se crea | Revisa function setupProperties() |

## Comandos de Prueba

### Test webhook
```bash
curl -X GET "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=tu_token&hub.challenge=123"
```

### Test mensaje
```bash
curl -X POST "http://localhost:8000/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5491234567890",
            "type": "text",
            "text": {"body": "Hola"}
          }]
        }
      }]
    }]
  }'
```

## Deploy a Producción

### Opción 1: Render (Recomendado)
```bash
# 1. Crear cuenta en render.com
# 2. Conectar repo GitHub
# 3. Crear Web Service
# 4. Agregar variables de entorno
# 5. Deploy automático
```

### Opción 2: Heroku
```bash
heroku login
heroku create management-bot
heroku config:set WHATSAPP_TOKEN=...
git push heroku main
```

### Opción 3: Tu servidor
```bash
# SSH a tu servidor
scp -r gs/WSPbot usuario@servidor:/home/management/
ssh usuario@servidor
cd /home/management/WSPbot
pip install -r requirements.txt
nohup python main.py &
```

## Monitoreo

### Logs importantes
```python
# Ver en console:
print("[WEBHOOK RECEIVED]", wa_id)
print("[MESSAGE SAVED]", fecha, comunidad)
print("[SESSION TIMEOUT]", wa_id)
```

### Métricas
- Mensajes procesados: Ver en Sheets "Reportes"
- Pagos: Ver en Sheets "Pagos"
- Fotos: Ver en Drive
- Errores: Ver logs del servidor

---

**Última actualización:** Enero 2026
