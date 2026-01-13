/**
 * ==========================================
 * CONFIGURACIÓN GLOBAL
 * ==========================================
 */

// IMPORTANTE: Reemplaza este ID con tu propia carpeta de Google Drive
// ID de la carpeta de Google Drive donde llegan los PDFs
const FOLDER_ID = PropertiesService.getScriptProperties().getProperty('FOLDER_ID') || 'YOUR_FOLDER_ID'; 

/**
 * ==========================================
 * FUNCIÓN GET (Carga la página web)
 * ==========================================
 */
function doGet() {
  const template = HtmlService.createTemplateFromFile('index');
  template.comunidades = obtenerComunidades();
  
  return template.evaluate()
      .setTitle('Registro de Pólizas de Seguro - AGT')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Obtiene la lista de comunidades desde la hoja 'Configuracion'.
 */
function obtenerComunidades() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Configuracion");
  
  if (!sheet) return ["Error: Falta hoja Configuracion"];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return ["Sin comunidades configuradas"];

  const valores = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return valores.flat().filter(String);
}

/**
 * ==========================================
 * PROCESAMIENTO DEL FORMULARIO (BACKEND)
 * ==========================================
 */
function procesarFormulario(formulario) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0]; // Usamos la primera hoja

    // 1. Verificamos si hay encabezados mirando la celda A1.
    // Usamos esta verificación en lugar de getLastRow() por seguridad.
    if (sheet.getRange("A1").getValue() === "") {
      const encabezados = [
        "Marca Temporal",    // A
        "Comunidad",         // B
        "Depto",             // C
        "Email",             // D
        "Fecha Emisión",     // E
        "Fecha Expiración",  // F
        "URL Póliza",        // G
        "Nombre Archivo"     // H
      ];
      // Insertamos encabezados
      sheet.getRange(1, 1, 1, 8).setValues([encabezados]);
      sheet.getRange("A1:H1").setFontWeight("bold");
    }

    // 2. Procesar el Archivo (Blob directo)
    const blob = formulario.pdfFile;
    const nombreLimpio = `${formulario.depto}_${formulario.fechaExpiracion}_${formulario.comunidad}`
                         .replace(/[^a-zA-Z0-9.\-_]/g, '_');
    blob.setName(nombreLimpio + ".pdf");
    
    // 3. Guardar en Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const file = folder.createFile(blob);
    const fileUrl = file.getUrl();

    // 4. Calcular la siguiente fila vacía CORRECTAMENTE
    // Leemos toda la columna A para ver cuántas filas tienen datos realmente.
    // Esto ignora la 'suciedad' o fórmulas vacías en otras columnas.
    const dataA = sheet.getRange("A:A").getValues();
    // Filtramos celdas vacías y obtenemos la longitud + 1 para la siguiente fila
    let nextRow = dataA.filter(String).length + 1;
    
    // Doble seguridad: si nextRow es 1 (solo pasaría si A1 está vacío, pero ya lo llenamos arriba), forzamos 2
    if (nextRow < 2) nextRow = 2;

    // 5. Escribir datos en la fila específica (Columnas A - H)
    // No usamos appendRow, usamos setValues apuntando a la fila exacta.
    sheet.getRange(nextRow, 1, 1, 8).setValues([[
      new Date(),                // A
      formulario.comunidad,      // B
      formulario.depto,          // C
      formulario.email,          // D
      formulario.fechaEmision,   // E
      formulario.fechaExpiracion,// F
      fileUrl,                   // G
      blob.getName()             // H
    ]]);

    // 6. Enviar correo
    enviarCorreoConfirmacion(formulario.email, formulario.comunidad, formulario.depto);

    return { success: true, message: "Póliza registrada correctamente." };

  } catch (error) {
    Logger.log(error);
    return { success: false, message: "Error técnico: " + error.toString() };
  }
}

/**
 * ==========================================
 * ENVÍO DE CORREO
 * ==========================================
 */
function enviarCorreoConfirmacion(destinatario, comunidad, depto) {
  if (!destinatario) return;

  const asunto = `Recepción Póliza - ${comunidad} - ${depto}`;
  
  const cuerpoHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h3 style="color: #0d6efd;">Documento Recibido - AGT</h3>
      <p>Estimado copropietario,</p>
      <p>Hemos recibido y archivado la póliza para:</p>
      <ul>
        <li><strong>Comunidad:</strong> ${comunidad}</li>
        <li><strong>Depto:</strong> ${depto}</li>
      </ul>
      <p style="font-size: 12px; color: #888;">Mensaje automático, no responder.</p>
    </div>
  `;

  MailApp.sendEmail({
    to: destinatario,
    subject: asunto,
    htmlBody: cuerpoHtml,
    name: "Administracion AGT"
  });
}