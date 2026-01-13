Arquitectura del Sistema: "Gestor de Pólizas AGT"
1. Interfaz de Usuario (Frontend - index.html)

Tecnología: HTML5 + Bootstrap 5 (Responsivo para móviles y escritorio).

Carga Dinámica: Al abrirse, la web consulta la hoja "Configuracion" para llenar automáticamente la lista desplegable de Comunidades. Esto permite agregar edificios sin tocar el código.

Envío Optimizado: El formulario captura el archivo PDF y lo envía como un objeto nativo (Blob) directamente al servidor de Google, evitando conversiones a texto (Base64) que ralentizaban la carga.

2. Procesamiento Lógico (Backend - Code.gs)

Recepción: El script recibe el objeto del formulario.

Estandarización: Renombra el archivo PDF automáticamente siguiendo el patrón: [Depto]_[FechaExpiracion]_[Comunidad].pdf (Esto asegura orden en tu carpeta de Drive).

Cálculo de Fila: Antes de guardar en Excel, el script escanea la Columna A para encontrar la primera fila verdaderamente vacía, ignorando la columna de fórmulas (Columna I) para evitar escribir en la fila 50.000.

3. Almacenamiento y Base de Datos

Google Drive: El archivo físico (PDF) se guarda en la carpeta protegida definida por el FOLDER_ID.

Google Sheets: Se registra la metadata (Fecha, Email, Links, etc.) en las columnas A hasta H.

Cálculo Automático (Columna I): La ARRAYFORMULA insertada en la celda I1 detecta el nuevo dato y calcula automáticamente los "Días Restantes" para la expiración, aplicando el formato condicional (Verde/Amarillo/Rojo).

4. Notificación y Cierre

Correo Transaccional: El sistema usa MailApp para enviar un correo HTML con la identidad "Administracion AGT" al usuario, confirmando la recepción exitosa.

Feedback: La pantalla del usuario se limpia y muestra un mensaje de éxito en verde.

Diagrama de Flujo de Datos
Plaintext

[USUARIO] 
    │
    ├── (1) Rellena Formulario (Web)
    │
    ▼
[GOOGLE APPS SCRIPT] (Cerebro)
    │
    ├── (2) Renombra PDF ───────────────────────────┐
    │                                               ▼
    ├── (3) Guarda PDF con nuevo nombre ───> [GOOGLE DRIVE]
    │
    ├── (4) Calcula fila vacía real
    │
    ├── (5) Inserta datos (Col A-H) ───────> [GOOGLE SHEETS]
    │                                          └── (6) ARRAYFORMULA calcula Columna I
    │
    └── (7) Envía confirmación ────────────> [EMAIL DEL USUARIO]
