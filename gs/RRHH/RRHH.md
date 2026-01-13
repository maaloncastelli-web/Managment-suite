1. Arquitectura y Stack Tecnológico
La aplicación es una SPA (Single Page Application) construida sobre el ecosistema de Google, diseñada con un enfoque mobile-first para ser operada con total fluidez desde teléfonos móviles.

Backend: Google Apps Script (GAS) con persistencia en Google Sheets (Base de Datos) y Google Drive (Almacenamiento de archivos).

Frontend: HTML5, CSS3 y JavaScript (ES6).

UI Framework: Bootstrap 5.3 con iconos de Bootstrap e Inter Font para una estética profesional.

Visualización: Chart.js para analítica dinámica y SheetJS para la generación de reportes en Excel nativo.

2. Módulos y Funcionalidades Principales
A. Gestión de Personal (Core CRUD)
Indexación Automática: Asignación de códigos correlativos (01, 02, 03...) de forma automática.

Buscador Inteligente: Filtro reactivo que procesa simultáneamente Nombre, Apellido y RUT.

Filtro por Comunidad: Capacidad de segmentar la vista del dashboard por centros de costo o comunidades específicas.

Sincronización Drive-Sheets: Al eliminar un trabajador, el sistema re-indexa al personal restante y envía automáticamente la carpeta física de Google Drive a la papelera (setTrashed).

B. Gestión Documental Avanzada
Estructura Jerárquica: Creación automatizada de carpetas: Comunidad > Código. Trabajador > FICHA.

Carga de PDF: Interfaz de carga directa para 15 tipos de documentos divididos en dos categorías:

Laborales (01-08): Contratos, anexos, vacaciones, finiquitos, etc.

Ficha Personal (01-07): CV, Cédula, Antecedentes, Salud, etc.

Normalización de Nombres: Renombrado automático de archivos en Drive (ej: 01.- Contrato.pdf) para auditorías limpias.

C. Importación Masiva (Bulk Import)
Integración con Excel: Área de pegado que reconoce tabulaciones de hojas de cálculo.

Procesamiento Atómico: Permite cargar decenas de trabajadores en un solo paso, creando sus registros y estructuras de carpetas en Drive de manera secuencial.

D. Inteligencia de Negocios (KPIs Dinámicos)
Dashboard de Población: Contador total de trabajadores y barras de progreso de distribución por comunidad.

Gráficos de Dona: Visualización de cumplimiento global de documentos y estado de "Fichas Críticas".

Sistema de Alertas: Notificación visual automática (⚠️) si existen brechas en documentos importantes.

E. Configuración y Escalabilidad
Definición de Obligatoriedad: El administrador puede decidir desde la interfaz qué documentos son "críticos" para el KPI, permitiendo ajustar el nivel de exigencia sin tocar el código.

Gestión de Comunidades: Función para añadir nuevas comunidades al sistema de forma dinámica.

F. Reportabilidad
Reporte Vertical Detallado: Generación de archivos Excel (.xlsx) y Texto (.txt) que listan a los trabajadores y sus documentos faltantes uno por uno (ideal para fiscalización).

3. Seguridad y Persistencia
Script Properties: Uso de almacenamiento interno del script para guardar configuraciones de obligatoriedad de forma segura.

Integridad de Datos: Bloqueo de duplicidad de nombres de carpetas y manejo de estados mediante initialData para evitar latencia innecesaria.
