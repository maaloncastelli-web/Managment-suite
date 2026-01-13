# Guía de Configuración - Management Suite

Esta guía te ayudará a configurar el proyecto correctamente en tu entorno de Google Workspace.

## Paso 1: Preparar Credenciales

### Para Google Apps Script (AguaCaliente, Contratos, Polizas, RRHH)

1. **Crea tus Google Sheets y Drive:**
   - Crea las hojas de cálculo necesarias en Google Sheets
   - Crea las carpetas en Google Drive
   - Obtén los IDs:
     - Sheets ID: De la URL `docs.google.com/spreadsheets/d/{SPREADSHEET_ID}`
     - Folder ID: De la URL `drive.google.com/drive/folders/{FOLDER_ID}`

2. **Configura Google Apps Script:**
   - Ve a [script.google.com](https://script.google.com)
   - Crea un nuevo proyecto
   - Copia el código de cada módulo
   - Habilita APIs necesarias:
     - Google Sheets API
     - Google Drive API
     - Google Docs API

### Para WSPbot (Python)

1. **Crear cuenta de servicio de Google:**
   ```bash
   # Consigue las credenciales JSON desde Google Cloud Console
   # Ve a Google Cloud Console → Service Accounts
   # Descarga la clave JSON
   # Nómbrala: service_account.json
   ```

2. **Obtener credenciales de WhatsApp:**
   - Accede a [Meta Business Manager](https://business.facebook.com)
   - Crea app de WhatsApp Business
   - Obtén:
     - `VERIFY_TOKEN` (generado por ti)
     - `WHATSAPP_TOKEN` (desde settings)
     - `WHATSAPP_PHONE_ID`
     - `WHATSAPP_BUSINESS_ACCOUNT_ID`

## Paso 2: Configurar Archivo .env

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Abre .env en tu editor favorito
nano .env  # o tu editor preferido
```

Completa cada sección según tu configuración:

### Sección AguaCaliente
```
SPREADSHEET_ID_AGUA=YOUR_ACTUAL_SPREADSHEET_ID
FOLDER_ID_AGUA_1=YOUR_ACTUAL_FOLDER_ID
# ... más carpetas
```

**Cómo obtener IDs:**
- Abre tu Google Sheet → copia de la URL
- Abre tu Google Drive Folder → copia de la URL

### Sección Contratos
```
MASTER_FOLDER_ID=YOUR_ACTUAL_MASTER_FOLDER_ID
COMMUNITY1_MAYORDOMO_TEMPLATE_ID=ID_DEL_GOOGLE_DOC_PLANTILLA
# ... más comunidades y roles
```

**Plantillas:**
- Cada rol (mayordomo, conserje, auxiliar) necesita su plantilla Google Docs
- Copia el ID de cada documento plantilla

### Sección RRHH
```
SPREADSHEET_ID_RRHH=YOUR_ACTUAL_SPREADSHEET_ID
ROOT_FOLDER_ID_RRHH=YOUR_ACTUAL_ROOT_FOLDER_ID
```

### Sección WSPbot
```
VERIFY_TOKEN=tu_token_secreto_generado
WHATSAPP_TOKEN=desde_meta_business_manager
WHATSAPP_PHONE_ID=desde_meta_business_manager
REPORTES_SPREADSHEET_ID=YOUR_ACTUAL_SPREADSHEET_ID
```

## Paso 3: Google Apps Script Configuration

Cada módulo GAS necesita acceso a sus propias variables. Opción recomendada:

### Opción A: PropertiesService (Recomendado para producción)

En el script editor, ejecuta una vez:

```javascript
function setupProperties() {
  const props = PropertiesService.getScriptProperties();
  
  // AguaCaliente
  props.setProperty('SPREADSHEET_ID', 'YOUR_ID');
  props.setProperty('FOLDER_ID_1', 'YOUR_ID');
  // ... más
  
  Logger.log('Properties configuradas correctamente');
}
```

Luego ejecuta desde el menú: `Funciones > setupProperties`

### Opción B: Hardcoded (Solo desarrollo)

Reemplaza directamente en el código (NO RECOMENDADO para producción).

## Paso 4: Configurar WSPbot (Python)

### Instalar dependencias

```bash
cd gs/WSPbot
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Verificar servicio de Google

```bash
# Coloca tu service_account.json en la carpeta WSPbot
# Asegúrate que el archivo NO esté commiteado (ya está en .gitignore)
ls service_account.json  # Verifica que existe
```

### Ejecutar el bot

```bash
python main.py
```

El servidor estará disponible en `http://localhost:8000`

## Paso 5: Webhook de WhatsApp

1. **Obtén tu URL pública:** (necesitas servidor público)
   ```
   https://tu-servidor.com/webhook
   ```

2. **Configura en Meta Business:**
   - Ve a App Settings → Webhooks
   - Callback URL: `https://tu-servidor.com/webhook`
   - Verify Token: El valor de `VERIFY_TOKEN` en tu .env

3. **Suscribirse a eventos:**
   - Messages
   - Message_status

## Paso 6: Verificación

### AguaCaliente
```bash
# Abre en navegador:
https://script.google.com/macros/s/{DEPLOYMENT_ID}/userweb?page=index&comunidad=community1
```

### RRHH
```bash
# Panel principal:
https://script.google.com/macros/s/{DEPLOYMENT_ID}/userweb
```

### WSPbot
```bash
# Test endpoint:
curl -X GET "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=tu_token&hub.challenge=test"
```

## Troubleshooting

Antes de pasar a producción:

- [ ] No hay .env en el repositorio (está en .gitignore)
- [ ] No hay service_account.json en commits
- [ ] Todos los IDs en código son placeholders (YOUR_ID_HERE)
- [ ] Las credenciales están en variables de entorno
- [ ] PropertiesService en GAS está configurado
- [ ] Token de verificación es único y seguro
- [ ] Solo usuarios autorizados tienen acceso a Drive/Sheets
- [ ] Has rotado cualquier token/credencial expuesto

## Troubleshooting de Errores

### Error: "Invalid SPREADSHEET_ID"
- Verifica que el ID está correcto en `.env`
- Asegúrate que PropertiesService está configurado en GAS

### Error: "Permission denied" en Google Drive
- Verifica que la cuenta tiene acceso a las carpetas
- Comprueba que la cuenta de servicio está autorizada

### Error: "Token inválido" en WhatsApp
- Verifica VERIFY_TOKEN en .env
- Confirma el token en Meta Business Manager

### WSPbot no recibe mensajes
- Confirma que el webhook está públicamente accesible
- Verifica logs en Meta Business Manager
- Asegúrate que VERIFY_TOKEN es correcto

---

**Próximo paso:** Lee la documentación específica de cada módulo en sus archivos `.md`
