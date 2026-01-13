# Quick Start Guide

Referencia rápida para configurar Management Suite.

## 5 Minutos Setup

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/management-suite.git
cd management-suite
```

### 2. Copiar Configuración
```bash
cp .env.example .env
# Edita .env con tus valores reales
```

### 3. Para Google Apps Script (4 módulos)
- Ve a [script.google.com](https://script.google.com)
- Crea 4 proyectos (uno por módulo)
- Copia código de `Codigo.gs` a cada proyecto
- Copia archivos HTML correspondientes
- Habilita APIs: Sheets, Drive, Docs
- Copia IDs reales a .env o PropertiesService
- Deploy cada proyecto como webapp

### 4. Para WSPbot (Python)
```bash
cd gs/WSPbot
pip install -r requirements.txt
# Coloca service_account.json aquí
# Configura .env con credenciales WhatsApp
python main.py
```

## Módulos en 30 Segundos

| Módulo | Propósito | Acceso |
|--------|-----------|--------|
| **AguaCaliente** | Lecturas de medidores | `?page=index&comunidad=community1` |
| **Contratos** | Generador de documentos | Script.google.com (deploy) |
| **Polizas** | Seguros y vencimientos | Webapp pública |
| **RRHH** | Gestión de personal | Webapp con KPIs |
| **WSPbot** | Bot de WhatsApp | `http://localhost:8000` |

## 🔑 IDs Necesarios

Obtén y coloca en `.env`:

```bash
# Google Drive Folder IDs
FOLDER_ID_AGUA_1=ID_AQUI
MASTER_FOLDER_ID=ID_AQUI
ROOT_FOLDER_ID_RRHH=ID_AQUI
FOLDER_ID_POLIZAS=ID_AQUI

# Google Sheets IDs
SPREADSHEET_ID_AGUA=ID_AQUI
SPREADSHEET_ID_RRHH=ID_AQUI
REPORTES_SPREADSHEET_ID=ID_AQUI

# WhatsApp (solo si usas WSPbot)
WHATSAPP_TOKEN=TOKEN_AQUI
VERIFY_TOKEN=GENERA_UNO
```

**Cómo obtener IDs:**
- Folder: `drive.google.com/drive/folders/`**{AQUI}**
- Sheet: `docs.google.com/spreadsheets/d/`**{AQUI}**

## NO HAGAS PUSH DE:

```bash
.env                    (usa .env.example)
service_account.json    (está en .gitignore)
IDs reales en código    (usa placeholders)
Nombres de propiedades  (usa Community_1, etc)
```

## Antes de GitHub

```
□ Reemplazé IDs con "YOUR_ID_HERE"
□ Nombres de propiedades → "Community_1", etc
□ .env está en .gitignore
□ No hay service_account.json
□ Variables sensibles en .env.example
□ README.md describe el proyecto
□ LICENSE agregada
```

## 📞 Checklist por Módulo

### AguaCaliente
```
□ SPREADSHEET_ID configurado
□ 6 FOLDER_ID configurados
□ Hojas creadas en Sheets
□ Carpetas creadas en Drive
```

### RRHH
```
□ SPREADSHEET_ID_RRHH configurado
□ ROOT_FOLDER_ID_RRHH configurado
□ Hojas: Trabajadores, Comunidades, Config
```

### WSPbot (Python)
```
□ WHATSAPP_TOKEN agregado
□ VERIFY_TOKEN generado
□ service_account.json (NO commiteado)
□ requirements.txt actualizado
```

## Primeros Pasos Post-Setup

### Probar AguaCaliente
```
1. Deploy en Google Apps Script
2. Abre: script.google.com/macros/s/{ID}/userweb?page=admin
3. Bloquea/desbloquea mes
4. Abre: ?page=index&comunidad=community1
5. Intenta registrar una lectura
```

### Probar RRHH
```
1. Deploy en Google Apps Script
2. Abre: script.google.com/macros/s/{ID}/userweb
3. Agrega un trabajador de prueba
4. Verifica que se creó carpeta en Drive
5. Carga un PDF (documento)
6. Revisa el KPI
```

### Probar WSPbot
```
1. python main.py
2. curl http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=tu_token&hub.challenge=test
3. Suscribe webhook en Meta Business
4. Envía un mensaje desde WhatsApp
5. Revisa logs
```

## Documentación Completa

- [SETUP.md](./SETUP.md) - Configuración detallada
- [README.md](./README.md) - Descripción completa del proyecto
- `gs/*/README.md` - Documentación por módulo

---

**Dudas?** Lee [SETUP.md](./SETUP.md) para instrucciones paso a paso.
