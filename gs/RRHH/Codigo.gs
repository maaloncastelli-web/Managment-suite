/** * DASHBOARD RRHH
 * Matias Castelli 
 */

const CONFIG = {
  SHEET_NAME: 'Trabajadores',
  COMM_SHEET: 'Comunidades',
  CONFIG_SHEET: 'Config',
  DOC_HEADERS: [
    "01.- Contrato", "02.- Anexo", "03.- Formulario de Ingreso", 
    "04.- Actas de entrega de uniformes", "05.- Comprobante de vacaciones", 
    "06.- Carta de aviso", "07.- Finiquito DT", "08- Comprobante de aceptacion Pago DT"
  ],
  FICHA_HEADERS: [
    "01.- Curriculum Vitae", "02.- Cedula de Identidad", "03.- Certificado de Antecedentes", 
    "04.- Cert. De Residencia", "05.- Certificado AFP", "06.- Certificado de Salud", 
    "07.0.- Certificado de ExtranJeria"
  ]
};

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('RRHH Intelligence Dashboard')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// --- GESTIÓN DE CONFIGURACIÓN DINÁMICA ---

function getMandatoryDocs() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('MANDATORY_DOCS');
  // Si no hay nada guardado, por defecto usamos una lista base
  return saved ? JSON.parse(saved) : ["01.- Contrato", "02.- Cedula de Identidad"];
}

function setMandatoryDocs(docsArray) {
  PropertiesService.getScriptProperties().setProperty('MANDATORY_DOCS', JSON.stringify(docsArray));
  return true;
}

// --- KPI DATA ENGINE (ACTUALIZADO) ---

function getKPIStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  if (rows.length === 0) return null;

  const mandatoryList = getMandatoryDocs();
  const allDocs = [...CONFIG.DOC_HEADERS, ...CONFIG.FICHA_HEADERS];
  
  let totalDocsPossible = allDocs.length * rows.length;
  let totalDocsUploaded = 0;
  let criticalCount = 0;
  let alerts = [];
  
  let totalWorkers = rows.length;
  let communitiesCount = {};

  rows.forEach(row => {
    let comm = row[7];
    communitiesCount[comm] = (communitiesCount[comm] || 0) + 1;

    let missingMandatory = [];
    headers.forEach((h, colIdx) => {
      if (colIdx < 8) return;
      if (row[colIdx]) totalDocsUploaded++;
      
      // Lógica dinámica de obligatoriedad
      if (mandatoryList.includes(h) && !row[colIdx]) {
        missingMandatory.push(h);
        alerts.push({worker: `${row[1]}. ${row[2]}`, doc: h});
      }
    });
    
    // Un trabajador es "Crítico al día" solo si tiene todos sus obligatorios
    if (missingMandatory.length === 0) criticalCount++;
  });

  return {
    totalWorkers: totalWorkers,
    communitiesCount: communitiesCount,
    globalCompliance: [totalDocsUploaded, totalDocsPossible - totalDocsUploaded],
    criticalCompliance: [criticalCount, totalWorkers - criticalCount],
    alerts: alerts.slice(0, 15),
    mandatoryList: mandatoryList
  };
}

// --- RESTO DE FUNCIONES CORE ---

function saveWorkersBulk(workersArray) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  const rootId = ss.getSheetByName(CONFIG.CONFIG_SHEET).getRange("A2").getValue();
  const rootFolder = DriveApp.getFolderById(rootId);
  let lastIdx = sheet.getLastRow();
  
  workersArray.forEach(data => {
    const nextCode = (lastIdx).toString().padStart(2, '0');
    const commFolder = getOrCreateFolder(rootFolder, data.comunidad);
    const workerFolder = commFolder.createFolder(`${nextCode}. ${data.apellido} ${data.nombre}`);
    workerFolder.createFolder('FICHA');
    const row = [workerFolder.getId(), nextCode, data.apellido.toUpperCase(), data.nombre.toUpperCase(), data.rut, data.cargo || "OPERARIO", "Activo", data.comunidad];
    sheet.appendRow(row);
    lastIdx++;
  });
  return { status: 'success', count: workersArray.length };
}

function getInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) setupDatabase();
  return {
    trabajadores: ss.getSheetByName(CONFIG.SHEET_NAME).getDataRange().getValues(),
    comunidades: ss.getSheetByName(CONFIG.COMM_SHEET).getDataRange().getValues().flat().filter(String).slice(1),
    headers: { gen: CONFIG.DOC_HEADERS, ficha: CONFIG.FICHA_HEADERS },
    mandatory: getMandatoryDocs()
  };
}

function deleteWorker(folderId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  try { DriveApp.getFolderById(folderId).setTrashed(true); } catch(e) {}
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === folderId) { sheet.deleteRow(i + 1); break; }
  }
  reindexWorkers();
  return true;
}

function reindexWorkers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  for (let i = 0; i < data.length; i++) {
    const newCode = (i + 1).toString().padStart(2, '0');
    sheet.getRange(i + 2, 2).setValue(newCode);
    try {
      const folder = DriveApp.getFolderById(data[i][0]);
      folder.setName(folder.getName().replace(/^\d+\./, newCode + "."));
    } catch(e) {}
  }
}

function getMissingDocsData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    let missing = [];
    headers.forEach((h, colIdx) => { if (colIdx >= 8 && !row[colIdx]) missing.push(h); });
    return { 'Código': row[1], 'Trabajador': `${row[2]} ${row[3]}`, 'RUT': row[4], 'Comunidad': row[7], 'Documento Faltante': missing.join(", ") };
  }).filter(r => r['Documento Faltante'] !== "");
}

function uploadPDF(folderId, docType, base64Data, isFicha) {
  const folder = DriveApp.getFolderById(folderId);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const rowIndex = data.findIndex(r => r[0] === folderId);
  let targetFolder = folder;
  if (isFicha) {
    const sub = folder.getFoldersByName('FICHA');
    targetFolder = sub.hasNext() ? sub.next() : folder.createFolder('FICHA');
  }
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'application/pdf', `${docType}.pdf`);
  targetFolder.createFile(blob);
  sheet.getRange(rowIndex + 1, data[0].indexOf(docType) + 1).setValue("Cargado");
}

function getOrCreateFolder(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function addCommunity(name) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.COMM_SHEET).appendRow([name]);
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
  const allHeaders = ["ID_FOLDER", "Codigo", "APELLIDO", "NOMBRES", "RUT", "CARGO", "Estado", "Comunidad", ...CONFIG.DOC_HEADERS, ...CONFIG.FICHA_HEADERS];
  sheet.getRange(1, 1, 1, allHeaders.length).setValues([allHeaders]).setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold");
  sheet.setFrozenRows(1);
  if (!ss.getSheetByName(CONFIG.COMM_SHEET)) ss.insertSheet(CONFIG.COMM_SHEET).appendRow(["Comunidades"]);
  if (!ss.getSheetByName(CONFIG.CONFIG_SHEET)) ss.insertSheet(CONFIG.CONFIG_SHEET).appendRow(["ID_CARPETA_RAIZ"]);
}