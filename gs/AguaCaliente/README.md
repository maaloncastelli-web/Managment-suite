# 💧 Sistema de Gestión de Medidores v14.0

PWA (Progressive Web App) para la lectura y gestión centralizada de consumo de agua en múltiples comunidades/propiedades.

## Características Principales

### 1. **Panel de Administración** (Admin.html)
- Dashboard con barras de progreso por comunidad
- Control de acceso (bloquear/desbloquear mes)
- Control de carga de evidencia fotográfica
- Monitor de anomalías (medidores reportados como averiados)
- Accesos directos a formularios por comunidad

### 2. **Ingreso Individual** (Index.html)
Diseñado para uso en campo (celulares)
- Interfaz mobile-first
- Modo offline - sincronización automática al reconectar
- Validación de historial (compara con lectura anterior)
- Captura de foto (cámara) o carga de archivo (si admin lo permite)
- Compresión automática de imágenes
- Geolocalización GPS (coordenadas + link a Google Maps)
- Lista inteligente (desaparece unidades ya registradas)

### 3. **Carga Masiva Inteligente** (Masivo.html)
Para procesamiento rápido de múltiples fotos
- Drag & Drop de 50+ fotos
- Detector de duplicados (Hash MD5)
- Buscador dinámico de unidades
- Descuento automático de unidades asignadas
- Carga parcial (solo envía filas completas)
- Barra de progreso en tiempo real

### 4. **Historial y Edición** (Lecturas.html)
Para revisión de datos ingresados
- Filtrado por mes y búsqueda por unidad
- Edición de registros
- Exportación de reportes

## Arquitectura Técnica

### Stack Tecnológico
```
Frontend:  HTML5 + CSS3 + JavaScript (ES6+)
UI Kit:    Bootstrap 5.3 + Bootstrap Icons
Backend:   Google Apps Script
DB:        Google Sheets (hojas específicas por comunidad)
Storage:   Google Drive (fotos + evidencia)
```

### Estructura de Datos

```
Google Sheets:
├── DB_HISTORICO          # Historial de todas las lecturas
├── CONFIG_UNIDADES       # Configuración de unidades por comunidad
├── CONFIG_ESTADO         # Estado del sistema (mes bloqueado, etc)
├── DB_HASHES             # Hash MD5 de fotos para detectar duplicados
└── [Community_1]         # Una hoja por comunidad
└── [Community_2]
    ...

Google Drive:
└── ROOT_FOLDER
    └── Community_1/
        └── Fotos/
            ├── 2024-12-Unidad_101.jpg
            ├── 2024-12-Unidad_102.jpg
            ...
    └── Community_2/
        ...
```

## 🔑 Variables Clave

### Configuración en Código

Actualiza en `.env` o PropertiesService:

```javascript
// ID de la hoja de cálculo principal
SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"

// IDs de carpetas de Google Drive (una por comunidad)
FOLDER_ID_COMMUNITY_1 = "YOUR_FOLDER_ID_1"
FOLDER_ID_COMMUNITY_2 = "YOUR_FOLDER_ID_2"
// ... etc

// Nombres de hojas (estos SÍ están fijos)
DB_SHEET_NAME = 'DB_HISTORICO'
CONFIG_UNIDADES_SHEET = 'CONFIG_UNIDADES'
CONFIG_ESTADO_SHEET = 'CONFIG_ESTADO'
DB_HASHES_SHEET = 'DB_HASHES'
```

### Comunidades Configuradas

Por defecto viene con 6 comunidades (reemplaza los nombres reales):

```javascript
const COMMUNITIES = {
  community1:  { name: 'Community 1', sheetTab: 'Community_1', folderId: 'YOUR_ID_1' },
  community2:  { name: 'Community 2', sheetTab: 'Community_2', folderId: 'YOUR_ID_2' },
  // ... más
};
```

## Flujo de Uso

### 1. Conserje en Terreno (Index.html)

```
1. Selecciona comunidad
2. Selecciona unidad/departamento
3. Lee lectura anterior (validación)
4. Ingresa lectura nueva
5. Adjunta foto (cámara o galería)
6. Aceptar ubicación GPS
7. Enviar
   └─ Si no hay internet → Se guarda localmente
   └─ Si hay internet → Se sincroniza automáticamente
```

### 2. Carga Masiva (Masivo.html)

```
1. Selecciona comunidad
2. Arrastra 50+ fotos
3. Sistema detecta duplicados automáticamente
4. Vincula cada foto a unidad
5. Revisa datos completos
6. Envía lote
   └─ Carga parcial: solo fila completas
   └─ Fallidas: se mantienen para reintentar
```

### 3. Revisión (Lecturas.html)

```
1. Selecciona comunidad
2. Filtra por mes
3. Busca por número de unidad
4. Visualiza/edita registro
5. Exporta reporte
```

### 4. Administración (Admin.html)

```
- Ve progreso en gráficos
- Bloquea el mes (nadie ingresa más datos)
- Habilita/deshabilita carga de fotos
- Ve medidores reportados como "Averiados"
- Accede directo a cada comunidad
```

## Características de Seguridad

### Control de Acceso
- Solo usuarios con acceso a Google Workspace pueden entrar
- Admin puede bloquear el mes para evitar cambios
- Las fotos se guardan en Google Drive (no en cliente)

### Validación de Datos
- Valida que lecturas no sean menores a mes anterior
- Detecta fotos duplicadas (Hash MD5)
- Captura GPS para auditoría de ubicación

## Reportes y Análisis

### Disponibles en Admin.html
- % de avance por comunidad
- Listado de anomalías
- Filtro por estado (Bueno/Malo/Averiado)
- Exportación a Excel

## Instalación y Configuración

### Paso 1: Preparar en Google Workspace

1. Crea Google Sheet con las hojas necesarias
2. Crea carpetas en Google Drive para fotos
3. Obtén los IDs (ver SETUP.md)

### Paso 2: Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea nuevo proyecto
3. Copia código de `Codigo.gs`
4. Agrega archivos HTML: `Index.html`, `Admin.html`, `Masivo.html`, `Lecturas.html`
5. Deploya como webapp

### Paso 3: Configurar Variables

En Script Editor → Archivo de propiedades:
```javascript
function setupConfig() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', 'TU_ID_AQUI');
  // ... más
}
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Error "Comunidad no válida" | Verifica que la URL tenga `?page=index&comunidad=community1` |
| Las fotos no se guardan | Comprueba que el FOLDER_ID tiene permisos de escritura |
| Detector de duplicados falla | Verifica que DB_HASHES_SHEET existe en Sheets |
| Offline no funciona | Necesita HTTPS (script.google.com es automáticamente HTTPS) |

## Compatibilidad

- Chrome/Edge (desktop y móvil)
- Firefox
- Safari (iOS)
- Instalable como app (PWA)

---

**Última actualización:** Enero 2026
