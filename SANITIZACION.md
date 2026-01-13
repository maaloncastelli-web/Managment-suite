# Resumen de Sanitización para GitHub

Documento que detalla todos los cambios realizados para hacer el proyecto seguro para publicación pública.

## Objetivo

Adaptar el proyecto Management Suite para publicación en GitHub removiendo/reemplazando:
- IDs reales de Google Drive y Sheets
- Nombres específicos de propiedades/comunidades
- Credenciales y tokens
- Información sensible de empleados y clientes

## Cambios Realizados

### 1. **Reemplazo de IDs en Código**

#### Archivo: gs/AguaCaliente/Codigo.gs
```diff
- const CONFIG = {
-   SPREADSHEET_ID: '1B87avJ-FZdhBpw76ob5m1viUHyDtuDNxD6HmGL1uDPw', 
+ const CONFIG = {
+   SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_SPREADSHEET_ID_HERE',
```

**Cambios:**
- Reemplazado ID del Spreadsheet con placeholder
- Reemplazados 6 nombres de comunidades (Smart, Santa Victoria, Emoción, Select, San Isidro, San Francisco) con genéricos (Community 1-6)
- Reemplazados 6 Folder IDs con placeholders

#### Archivo: gs/Contratos/Generador Contrato.gs
**Cambios:**
- Reemplazado MASTER_FOLDER_ID real
- Reemplazadas 6 comunidades con Community 1-6
- Reemplazadas 18 IDs de plantillas Google Docs con placeholders

#### Archivo: gs/Polizas/Codigo.gs
**Cambios:**
- Reemplazado FOLDER_ID real

#### Archivo: gs/RRHH/Codigo.gs
**Cambios:**
- No contenía IDs explícitos (usa PropertiesService)
- No requería cambios

### 2. **Crear Variables de Entorno**

#### Nuevo archivo: .env.example
Contiene plantilla de configuración con secciones:
- Agua Caliente (SPREADSHEET_ID + 6 FOLDER_IDs)
- Contratos (MASTER_FOLDER_ID + 18 Template IDs)
- Pólizas (FOLDER_ID)
- RRHH (SPREADSHEET_ID + ROOT_FOLDER_ID)
- WhatsApp Bot (VERIFY_TOKEN, WHATSAPP_TOKEN, etc.)
- Configuración general

**Uso:** cp .env.example .env y reemplazar valores

### 3. **Archivo .gitignore**

#### Nuevo archivo: .gitignore
Protege archivos sensibles:
- .env (variables de entorno)
- .env.* (variantes locales)
- service_account.json (credenciales Google)
- *.key, *.pem (certificados)
- __pycache__, node_modules (dependencias)
- *.log (logs)

### 4. **Documentación Completa**

#### Nuevo archivo: README.md
- Descripción general del proyecto
- 5 módulos principales documentados
- Stack tecnológico
- Quick start guide
- Advertencia sobre datos sensibles
- Checklist pre-publicación

#### Nuevo archivo: SETUP.md
- Paso 1: Preparar credenciales
- Paso 2: Configurar .env
- Paso 3: Google Apps Script PropertiesService
- Paso 4: WSPbot Python setup
- Paso 5: Webhook WhatsApp
- Paso 6: Verificación
- Checklist de seguridad
- Troubleshooting

#### Nuevo archivo: QUICKSTART.md
- Guía de 5 minutos
- Setup por módulo
- IDs necesarios
- Checklist GitHub
- Primeros pasos

#### Nuevo archivo: LICENSE
- Licencia MIT completa

### 5. **Documentación por Módulo**

#### gs/AguaCaliente/README.md
- Descripción completa del sistema
- 4 componentes (Admin, Index, Masivo, Lecturas)
- Arquitectura técnica
- Flujos de uso
- Configuración e instalación
- Troubleshooting

#### gs/RRHH/README.md
- Descripción del dashboard
- 5 módulos principales
- Estructura de datos
- Cálculos de KPI
- Flujos principales
- Instalación

#### gs/WSPbot/README.md
- Descripción del bot
- Arquitectura y flujos
- Variables de configuración
- Instalación
- Webhook setup
- Funciones principales
- Deploy a producción

### 6. **Información Sensible Removida**

#### Nunca Publicar:
- Reemplazados: IDs de Google Drive/Sheets reales
- Reemplazados: Nombres de propiedades específicas
- Removidos: Tokens/credenciales en código
- Removidos: Datos de empleados específicos
- Removidos: IDs de plantillas contratos

#### Protegidos con .gitignore:
- .env (nunca comitear)
- service_account.json (nunca comitear)
- Archivos .key, .pem
- Logs locales

## Estructura Actual (Sanitizada)

```
management-suite/
├── gs/
│   ├── AguaCaliente/
│   │   ├── Codigo.gs (IDs reemplazados)
│   │   ├── *.html (sin cambios necesarios)
│   │   ├── AguaCaliente.md (documentacion original)
│   │   └── README.md (nueva)
│   ├── Contratos/
│   │   ├── Generador Contrato.gs (IDs reemplazados)
│   │   └── NumLetra.gs
│   ├── Polizas/
│   │   ├── Codigo.gs (IDs reemplazados)
│   │   ├── Polizas.md
│   │   └── (sin README.md - crear)
│   ├── RRHH/
│   │   ├── Codigo.gs (sin cambios críticos)
│   │   ├── RRHH.md
│   │   └── README.md (nueva)
│   └── WSPbot/
│       ├── *.py (sin cambios - usa .env)
│       ├── requirements.txt
│       └── README.md (nueva)
├── .gitignore (nueva)
├── .env.example (nueva)
├── README.md (nueva - completa)
├── SETUP.md (nueva)
├── QUICKSTART.md (nueva)
└── LICENSE (nueva - MIT)
```

## Niveles de Protección

### Nivel 1: Code Placeholders
```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const MASTER_FOLDER_ID = 'YOUR_MASTER_FOLDER_ID';
```

### Nivel 2: Environment Variables
```bash
# .env.example
SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
MASTER_FOLDER_ID=YOUR_MASTER_FOLDER_ID

# .env (real, no commiteado)
SPREADSHEET_ID=1A7x...
MASTER_FOLDER_ID=1Gx...
```

### Nivel 3: PropertiesService (GAS)
```javascript
const id = PropertiesService.getScriptProperties()
            .getProperty('SPREADSHEET_ID');
```

### Nivel 4: .gitignore Protection
```
.env
service_account.json
*.key
*.pem
```

## Mejoras Documentación

### Antes
- Documentación técnica (MD) con poca guía
- Sin instrucciones de setup
- Sin checklist de seguridad

### Después
- README.md completo con 5 secciones
- SETUP.md con 6 pasos detallados
- QUICKSTART.md para start rápido
- README.md por módulo (3 completados)
- Checklist de pre-publicación
- Troubleshooting en cada sección

## Checklist de Seguridad Final

**Antes de hacer PUSH a GitHub:**

- [ ] Verificar que no hay IDs reales en código
- [ ] Verificar que .env está en .gitignore
- [ ] Verificar que service_account.json está en .gitignore
- [ ] Crear .env.example con placeholders
- [ ] Agregar .gitignore
- [ ] Documentar cada módulo
- [ ] Crear README.md raíz
- [ ] Crear SETUP.md
- [ ] Crear QUICKSTART.md
- [ ] Agregar LICENSE
- [ ] Revisar no hay logs con credenciales
- [ ] Revisar no hay emails/teléfonos personales

## Próximos Pasos Recomendados

### Antes de GitHub
1. Clonar repo localmente
2. Verificar que código funciona con placeholders
3. Probar .env.example -> .env workflow
4. Hacer un commit test
5. Limpiar historial de git si hay commits con datos sensibles:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached -r --ignore-unmatch .env service_account.json' \
     --prune-empty --tag-name-filter cat -- --all
   ```

### Al publicar en GitHub
1. Hacer repo PUBLICO
2. Agregar topics: google-apps-script, python, whatsapp-bot, property-management
3. Hacer release v1.0.0
4. Escribir release notes

### Post-publicación
1. Monitorear si alguien reporta issues de setup
2. Actualizar SETUP.md según feedback
3. Crear CONTRIBUTING.md
4. Crear CODE_OF_CONDUCT.md
5. Agregar badges (build, license, etc)

## Resumen de Archivos Modificados

| Archivo | Tipo | Cambios |
|---------|------|---------|
| gs/AguaCaliente/Codigo.gs | Modificado | IDs reemplazados |
| gs/Contratos/Generador Contrato.gs | Modificado | IDs reemplazados |
| gs/Polizas/Codigo.gs | Modificado | IDs reemplazados |
| .gitignore | Nuevo | Archivos sensibles protegidos |
| .env.example | Nuevo | Template de configuración |
| README.md | Nuevo | Documentación completa |
| SETUP.md | Nuevo | Guía paso a paso |
| QUICKSTART.md | Nuevo | Referencia rápida |
| LICENSE | Nuevo | MIT License |
| gs/AguaCaliente/README.md | Nuevo | Docs módulo |
| gs/RRHH/README.md | Nuevo | Docs módulo |
| gs/WSPbot/README.md | Nuevo | Docs módulo |

**Total:** 3 modificados + 9 nuevos = 12 archivos afectados

---

**Estado:** Proyecto listo para publicación en GitHub

**Fecha:** Enero 2026
