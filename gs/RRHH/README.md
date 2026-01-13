# RRHH Intelligence Dashboard v7.0

Dashboard integral de gestión de personal con documentación, importación masiva y KPIs dinámicos en tiempo real.

## Características Principales

### 1. **Gestión de Personal (Core CRUD)**
- Crear, editar, eliminar trabajadores
- Indexación automática (01, 02, 03...)
- Buscador reactivo por Nombre, Apellido, RUT
- Filtro por comunidad
- Sincronización automática con carpetas en Drive

### 2. **Gestión Documental Avanzada**
- Estructura jerárquica automática:
  ```
  Google Drive:
  └── ROOT_FOLDER
      └── Comunidad_1/
          ├── Trabajador_01/
          │   ├── FICHA/ (documentos personales)
          │   └── LABORALES/ (contratos, vacaciones, etc)
          ├── Trabajador_02/
          ...
  ```

- 15 tipos de documentos:
  - **Laborales (8):** Contrato, Anexo, Formulario ingreso, Entregas, Vacaciones, Aviso, Finiquito, Aceptación
  - **Ficha Personal (7):** CV, Cédula, Antecedentes, Residencia, AFP, Salud, Extranjería

- Carga de PDF con renombrado automático:
  ```
  01.- Contrato.pdf
  02.- Anexo.pdf
  ...
  ```

### 3. **Importación Masiva (Bulk Import)**
- Pega datos directamente desde Excel
- Carga decenas de trabajadores en un paso
- Creación automática de estructura de carpetas
- Procesamiento atómico (todo o nada)

### 4. **Dashboard de Inteligencia de Negocios**
- Población Total: Contador y distribución por comunidad
- Cumplimiento de Documentos: Gráfico de dona global
- Fichas Críticas: Porcentaje completado
- Alertas: Muestra trabajadores con documentos faltantes
- Configuración Dinámica: Define qué documentos son obligatorios

### 5. **Configuración y Escalabilidad**
- Definir documentos "críticos" sin tocar código
- Agregar nuevas comunidades dinámicamente
- KPIs actualizan automáticamente

## Arquitectura Técnica

### Stack Tecnológico
```
Frontend:     HTML5 + CSS3 + JavaScript (ES6+)
UI Kit:       Bootstrap 5.3 + Bootstrap Icons
Gráficos:     Chart.js (donuts, barras)
Excel Export: SheetJS
Backend:      Google Apps Script
Database:     Google Sheets
File Storage: Google Drive
Font:         Inter (profesional)
```

### Estructura de Datos

```
Google Sheets:
├── Trabajadores      # CRUD principal
│   ├── Código (01)
│   ├── Nombre
│   ├── Apellido
│   ├── RUT
│   ├── Comunidad
│   ├── Fecha Ingreso
│   ├── Cargo
│   └── [Documentos 1-15]  # Checkboxes o links
├── Comunidades       # Lista de comunidades (dinámicas)
└── Config           # Configuración (Root Folder ID, docs obligatorios)

Google Drive:
└── ROOT_FOLDER
    ├── Comunidad_1/
    │   ├── 01_Trabajador_Nombre/
    │   │   ├── LABORALES/
    │   │   │   ├── 01.- Contrato.pdf
    │   │   │   ├── 02.- Anexo.pdf
    │   │   │   ...
    │   │   └── FICHA/
    │   │       ├── 01.- Curriculum Vitae.pdf
    │   │       └── 02.- Cedula de Identidad.pdf
    │   └── 02_Trabajador_Nombre/
    ...
```

## 🔑 Variables Clave

### Configuración

```javascript
const CONFIG = {
  SHEET_NAME: 'Trabajadores',           // Hoja principal
  COMM_SHEET: 'Comunidades',            // Comunidades disponibles
  CONFIG_SHEET: 'Config',               // Configuración global
  
  DOC_HEADERS: [
    "01.- Contrato", "02.- Anexo", "03.- Formulario de Ingreso",
    "04.- Actas de entrega de uniformes", "05.- Comprobante de vacaciones",
    "06.- Carta de aviso", "07.- Finiquito DT", "08.- Comprobante aceptacion Pago DT"
  ],
  
  FICHA_HEADERS: [
    "01.- Curriculum Vitae", "02.- Cedula de Identidad", "03.- Certificado de Antecedentes",
    "04.- Cert. De Residencia", "05.- Certificado AFP", "06.- Certificado de Salud",
    "07.- Certificado de Extranjería"
  ]
};
```

## Flujos Principales

### 1. Crear Trabajador Individual

```
Formulario → Validación → 
Crear fila en Sheets → 
Crear carpeta en Drive (Comunidad/Código_Nombre) → 
Subcarpetas LABORALES + FICHA → 
Actualizar KPI
```

### 2. Importación Masiva

```
Copiar de Excel → 
Pegar en área de entrada →
Validar formato →
Crear múltiples trabajadores →
Crear estructura de carpetas →
KPI se actualiza automáticamente
```

### 3. Cargar Documentos

```
Seleccionar trabajador →
Seleccionar tipo de documento →
Subir PDF →
Auto-renombrar (01.- Contrato.pdf) →
Guardar en carpeta correspondiente →
Actualizar checkbox en Sheets →
Recalcular KPI
```

### 4. Visualizar KPIs

```
Dashboard carga datos →
Calcula total de trabajadores →
Calcula % de documentos →
Detecta documentos faltantes →
Genera gráficos en tiempo real →
Muestra alertas importantes
```

## Cálculos de KPI

### Cumplimiento de Documentos
```
Total Docs Posibles = Documentos × Trabajadores
Total Docs Guardados = Documentos cargados

% Compliance = (Total Docs Guardados / Total Posibles) × 100
```

### Fichas Críticas
```
Docs Obligatorios = ["01.- Contrato", "02.- Cedula", ...]
Un trabajador es "Crítico" si tiene TODOS los obligatorios

% Crítico = (Trabajadores al día / Total Trabajadores) × 100
```

## Seguridad

### Control de Acceso
- Solo usuarios autenticados en Google Workspace
- Permisos a nivel de Google Drive
- Auditoría de cambios en Sheets

### Validación
- Formato de RUT validado
- Códigos correlativos evitan duplicados
- Re-indexación automática al eliminar

## Instalación

### Paso 1: Preparar Google Sheets

1. Crea Google Sheet con hojas:
   - `Trabajadores`
   - `Comunidades`
   - `Config`

2. Agrega columnas en `Trabajadores`:
   ```
   Código | Nombre | Apellido | RUT | Comunidad | ... [Documentos]
   ```

3. Agrega comunidades en `Comunidades`:
   ```
   Community 1
   Community 2
   ...
   ```

4. En `Config`, celda A2 agrega Root Folder ID de Drive

### Paso 2: Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea nuevo proyecto
3. Copia código de `Codigo.gs`
4. Agrega archivo HTML: `Index.html`
5. Habilita APIs:
   - Google Sheets API
   - Google Drive API
6. Deploya como webapp

### Paso 3: Configurar Variables

```javascript
function setupRRHH() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', 'TU_ID');
  props.setProperty('ROOT_FOLDER_ID', 'TU_ID');
  
  const mandatoryDocs = ["01.- Contrato", "02.- Cedula de Identidad"];
  props.setProperty('MANDATORY_DOCS', JSON.stringify(mandatoryDocs));
}
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Cambiar documentos obligatorios | Ve a `setMandatoryDocs()` o interfaz |
| Agregar comunidad | Agrega fila en hoja `Comunidades` |
| Re-indexar códigos | Ejecuta `reindexWorkers()` |
| KPI no actualiza | Asegúrate que `getMandatoryDocs()` funciona |
| Fotos no se guardan | Verifica permisos en ROOT_FOLDER_ID |

## Compatibilidad

- Desktop (Chrome, Firefox, Safari)
- Tablet
- Mobile (responsivo)

---

**Última actualización:** Enero 2026
