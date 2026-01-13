# Management Suite

Suite completa de herramientas para la gestión empresarial integrada con Google Workspace. Incluye módulos de medidores de agua, gestión de contratos, pólizas de seguros, RRHH y chatbot de WhatsApp.

> IMPORTANTE: Este repositorio contiene código personalizado. Las referencias específicas a propiedades, empleados y configuraciones reales han sido reemplazadas con placeholders. Consulta [SETUP.md](./SETUP.md) para instrucciones de configuración.

## Módulos Principales

### 1. **Sistema de Gestión de Medidores** (`/gs/AguaCaliente`)
PWA (Progressive Web App) para la lectura y gestión de consumo de agua en múltiples comunidades.

**Características:**
- Interfaz mobile-first para campo
- Sincronización offline
- Captura de evidencia fotográfica con compresión automática
- Geolocalización GPS
- Carga masiva inteligente con detector de duplicados (Hash MD5)
- Historial y reportes

**Stack:** Google Apps Script, Google Sheets, Google Drive, HTML5/Bootstrap

---

### 2. **Generador de Contratos Laborales** (`/gs/Contratos`)
Automatización de generación de contratos con templating dinámico.

**Características:**
- Plantillas por comunidad y cargo
- Generación de PDF automática
- Estructura jerárquica en Drive
- Integración con Google Docs

**Stack:** Google Apps Script, Google Docs, Google Drive

---

### 3. **Gestión de Pólizas de Seguros** (`/gs/Polizas`)
Sistema para registro y seguimiento de pólizas con alertas de vencimiento.

**Características:**
- Formulario web responsivo
- Almacenamiento automático en Drive
- Base de datos en Sheets con fórmulas inteligentes
- Alertas visuales por vencimiento (Rojo/Amarillo/Verde)
- Notificaciones por email

**Stack:** Google Apps Script, Google Sheets, Google Drive, HTML5/Bootstrap

---

### 4. **Dashboard de RRHH Intelligence** (`/gs/RRHH`)
Sistema integral de gestión de personal con documentación y KPIs dinámicos.

**Características:**
- CRUD de personal con indexación automática
- Gestión jerárquica de documentos
- Dashboard con KPIs en tiempo real
- Búsqueda reactiva por nombre/RUT
- Gráficos de cumplimiento documentario
- Configuración dinámica de documentos obligatorios

**Stack:** Google Apps Script, Google Sheets, Google Drive, Chart.js, Bootstrap 5

---

### 5. **WhatsApp Bot** (`/gs/WSPbot`)
Chatbot inteligente para gestión de pagos y reportes vía WhatsApp.

**Características:**
- Conversación con flujos de estado
- Procesamiento de archivos multimedia
- Generación de links de pago
- Integración con Google Sheets para reportes
- Notificaciones por email
- Carga automática a Google Drive

**Stack:** FastAPI, Python, WhatsApp Cloud API, Google Sheets/Drive

---

## Inicio Rápido

### Prerrequisitos

- **Google Workspace** (cuenta empresarial)
- **Python 3.9+** (solo para WSPbot)
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/management-suite.git
   cd management-suite
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus valores reales (ver [SETUP.md](./SETUP.md))

3. **Para módulos de Google Apps Script (AguaCaliente, Contratos, Polizas, RRHH)**
   - Abre [Google Apps Script](https://script.google.com)
   - Copia el código de `/gs/{modulo}/Codigo.gs` a tu proyecto
   - Copia los archivos HTML correspondientes
   - Habilita las APIs necesarias (Sheets, Drive, Docs)

4. **Para WSPbot (Python)**
   ```bash
   cd gs/WSPbot
   pip install -r requirements.txt
   python main.py
   ```

---

## Documentación Detallada

Consulta los archivos markdown específicos de cada módulo:

- [AguaCaliente - Sistema de Medidores](./gs/AguaCaliente/AguaCaliente.md)
- [RRHH Intelligence](./gs/RRHH/RRHH.md)
- [Gestión de Pólizas](./gs/Polizas/Polizas.md)
- [WSPbot - WhatsApp Bot](./gs/WSPbot/README.md) (crear)

---

## Seguridad y Configuración

### NUNCA Publicar:
- IDs reales de Google Drive/Sheets
- Credenciales de servicio
- Tokens de API
- Nombres específicos de propiedades/empleados
- Información sensible de configuración

### Prácticas Recomendadas:
- Usar variables de entorno (.env)
- Usar PropertiesService en Google Apps Script
- Mantener .env en .gitignore
- Rotar tokens regularmente
- Usar cuentas de servicio con permisos mínimos

Ver [SETUP.md](./SETUP.md) para instrucciones detalladas de configuración.

---

## 📁 Estructura del Proyecto

```
management-suite/
├── gs/
│   ├── AguaCaliente/
│   │   ├── Codigo.gs              # Backend Google Apps Script
│   │   ├── Index.html             # App móvil principal
│   │   ├── Admin.html             # Panel administrativo
│   │   ├── Masivo.html            # Carga masiva
│   │   ├── Lecturas.html          # Historial/reportes
│   │   └── AguaCaliente.md        # Documentación técnica
│   ├── Contratos/
│   │   ├── Generador Contrato.gs  # Automatización de contratos
│   │   ├── NumLetra.gs            # Utilidades de números a letras
│   │   └── README.md
│   ├── Polizas/
│   │   ├── Codigo.gs              # Gestión de pólizas
│   │   ├── Index.html             # Formulario web
│   │   ├── Polizas.md             # Documentación
│   │   └── README.md
│   ├── RRHH/
│   │   ├── Codigo.gs              # Dashboard RRHH
│   │   ├── Index.html             # Interfaz principal
│   │   ├── RRHH.md                # Documentación técnica
│   │   └── README.md
│   └── WSPbot/
│       ├── main.py                # Servidor FastAPI
│       ├── flow.py                # Lógica conversacional
│       ├── whatsapp.py            # Integración WhatsApp
│       ├── sheets.py              # Integración Sheets
│       ├── drive.py               # Integración Drive
│       ├── emailer.py             # Notificaciones
│       ├── communities.py         # Gestión de comunidades
│       ├── requirements.txt       # Dependencias Python
│       └── README.md
├── .env.example                    # Plantilla de configuración
├── .gitignore                      # Archivos ignorados en Git
├── SETUP.md                        # Guía de instalación
└── README.md                       # Este archivo
```

---

## Flujos de Trabajo Principales

### Sistema de Medidores (AguaCaliente)
```
Conserje (móvil)
    | 
Captura lectura + foto
    | 
Sincronización offline → Reconexión
    | 
Google Apps Script valida
    | 
Guarda en Sheets + Drive
    | 
Admin revisa en panel
```

### Generador de Contratos
```
Admin selecciona empleado/rol
    | 
Script carga plantilla
    | 
Reemplaza variables
    | 
Genera PDF + Google Doc
    | 
Guarda en estructura Drive
```

### Dashboard RRHH
```
Importación masiva Excel
    | 
Validación de datos
    | 
Creación de carpetas/fichas
    | 
KPI calcula automáticamente
    | 
Alertas de documentos faltantes
```

### WhatsApp Bot
```
Usuario envía mensaje
    | 
Bot identifica comunidad/estado
    | 
Procesa solicitud (pago/reporte)
    | 
Genera link de pago / registra reporte
    | 
Sube evidencia a Drive
    | 
Notifica por email
```

---

## 🛠️ Tecnologías Utilizadas

- **Backend:** Google Apps Script, FastAPI, Python
- **Frontend:** HTML5, CSS3, JavaScript (ES6), Bootstrap 5
- **Persistencia:** Google Sheets, Google Drive
- **Gráficos:** Chart.js, SheetJS
- **APIs Externas:** WhatsApp Cloud API, Google Workspace APIs
- **Autenticación:** Google OAuth 2.0, Service Accounts

---

## 📞 Soporte y Contribución

Para reportar bugs o sugerir mejoras:
1. Abre un issue describiendo el problema
2. Si es posible, adjunta logs y pasos para reproducir
3. Consulta la guía de contribución (CONTRIBUTING.md - por crear)

---

## Licencia

Este proyecto es de código abierto bajo la licencia MIT. Ver archivo [LICENSE](./LICENSE) para más detalles.

---

## 🙏 Agradecimientos

Desarrollado como solución empresarial integral para gestión de propiedades y personal.

**Última actualización:** Enero 2026
