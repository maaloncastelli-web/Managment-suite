/**
 * ==========================================
 * SISTEMA DE GESTIÓN v13.5 (Masivo Inteligente)
 * ==========================================
 */

// IMPORTANTE: Reemplaza los valores con tus propios IDs de Google Drive y Sheets
// Copia el archivo .env.example a .env y configura los valores reales allí

const CONFIG = {
  SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_SPREADSHEET_ID_HERE', 
  TIMEZONE: 'America/Santiago',
  DB_SHEET_NAME: 'DB_HISTORICO',
  CONFIG_UNIDADES_SHEET: 'CONFIG_UNIDADES',
  CONFIG_ESTADO_SHEET: 'CONFIG_ESTADO',
  DB_HASHES_SHEET: 'DB_HASHES',

  BLOCK_WIDTH: 9, 
  BLOCK_GAP_CELLS: 2,
  TITLE_ROW: 1,
  HEADER_ROW: 2,
  DATA_START_ROW: 3
};

const COMMUNITIES = {
  community1:  { name: 'Community 1', sheetTab: 'Community_1', folderId: 'YOUR_FOLDER_ID_1' },
  community2:  { name: 'Community 2', sheetTab: 'Community_2', folderId: 'YOUR_FOLDER_ID_2' },
  community3:  { name: 'Community 3', sheetTab: 'Community_3', folderId: 'YOUR_FOLDER_ID_3' },
  community4:  { name: 'Community 4', sheetTab: 'Community_4', folderId: 'YOUR_FOLDER_ID_4' },
  community5:  { name: 'Community 5', sheetTab: 'Community_5', folderId: 'YOUR_FOLDER_ID_5' },
  community6:  { name: 'Community 6', sheetTab: 'Community_6', folderId: 'YOUR_FOLDER_ID_6' }
};

/* --- RUTAS --- */
function doGet(e) {
  const page = (e && e.parameter && e.parameter.page) ? String(e.parameter.page).trim().toLowerCase() : 'index';

  if (page === 'admin') {
    return HtmlService.createTemplateFromFile('Admin').evaluate().setTitle('Panel de Control').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (page === 'masivo') {
    const key = (e && e.parameter && e.parameter.comunidad) ? String(e.parameter.comunidad).trim() : '';
    if (!key || !COMMUNITIES[key]) return HtmlService.createHtmlOutput('Comunidad no válida para carga masiva');
    const t = HtmlService.createTemplateFromFile('Masivo');
    t.COMMUNITY_KEY  = key;
    t.COMMUNITY_NAME = COMMUNITIES[key].name;
    return t.evaluate().setTitle(`Carga Masiva - ${COMMUNITIES[key].name}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (page === 'lecturas') {
    const key = (e && e.parameter && e.parameter.comunidad) ? String(e.parameter.comunidad).trim() : '';
    if (!key || !COMMUNITIES[key]) return HtmlService.createHtmlOutput('Comunidad no válida');
    const t = HtmlService.createTemplateFromFile('Lecturas');
    t.COMMUNITY_KEY  = key;
    t.COMMUNITY_NAME = COMMUNITIES[key].name;
    return t.evaluate().setTitle('Historial').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  const key = (e && e.parameter && e.parameter.comunidad) ? String(e.parameter.comunidad).trim() : '';
  if (!key || !COMMUNITIES[key]) return HtmlService.createHtmlOutput(`<h2>Comunidad inválida</h2>`);
  const t = HtmlService.createTemplateFromFile('Index');
  t.COMMUNITY_KEY  = key;
  t.COMMUNITY_NAME = COMMUNITIES[key].name;
  return t.evaluate().setTitle(`Lectura - ${COMMUNITIES[key].name}`).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* --- API CARGA MASIVA --- */
// Retorna unidades pendientes REALES (Total Config - Registradas en el mes)
function getPublicUnitList(key, mesInput) {
  return getUnidadesPendientes(key, mesInput);
}

function procesarLoteFotos(filesData, comunidadKey) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const processedHashes = getProcessedHashes_(ss);
  const results = [];
  
  filesData.forEach(fileObj => {
    const { filename, base64 } = fileObj;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64.split(',')[1]));
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, blob.getBytes())
      .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');

    const isDuplicate = processedHashes.has(hash);
    results.push({
      filename: filename, 
      hash: hash, 
      isDuplicate: isDuplicate, 
      base64Preview: base64 
    });
  });
  return results;
}

function guardarLoteFinal(lecturasArray, comunidadKey) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let hashSheet = ss.getSheetByName(CONFIG.DB_HASHES_SHEET);
  if (!hashSheet) {
    hashSheet = ss.insertSheet(CONFIG.DB_HASHES_SHEET);
    hashSheet.appendRow(['Timestamp', 'Comunidad', 'Unidad', 'FileHash', 'Filename']);
  }

  const errors = [];
  const successUnits = []; // Lista de unidades guardadas con éxito

  lecturasArray.forEach(item => {
    try {
      const res = guardarLectura({
        comunidad: comunidadKey, mes: item.mes, unidad: item.unidad,
        medida: item.medida, fotoDataUrl: item.fotoDataUrl,
        estado: item.estado, comentario: item.comentario
      });
      if (res.ok) {
        hashSheet.appendRow([new Date(), comunidadKey, item.unidad, item.hash, item.filename]);
        successUnits.push(item.unidad);
      } else {
        throw new Error(res.message);
      }
    } catch (e) { errors.push(`Unidad ${item.unidad}: ${e.message}`); }
  });

  return { ok: errors.length === 0, processedCount: successUnits.length, successUnits: successUnits, errors: errors };
}

/* --- API ADMIN --- */
function getAdminDashboardData(mesInput) {
  const mes = toMonthName_(mesInput);
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const configMap = getCommunityConfigMap_(ss);
  const result = [];
  
  for (const key in COMMUNITIES) {
    const total = getAllUnitsFromConfig_(ss, key).length;
    const lecturas = getLecturasBlockData_(ss, key, mes);
    const malos = lecturas.filter(l => String(l.estado).toLowerCase() === 'malo')
                          .map(m => ({ unit: m.unidad, comment: m.comentario || '-' }));
    const conf = configMap[key] || { isLocked: false, allowUpload: false };
    
    result.push({
      key: key, name: COMMUNITIES[key].name, total: total,
      recorded: lecturas.length, percent: total > 0 ? Math.round((lecturas.length/total)*100) : 0,
      isLocked: conf.isLocked, allowUpload: conf.allowUpload,
      badCount: malos.length, badUnits: malos
    });
  }
  return result;
}

function toggleCommunityStatus(key, type, value) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.CONFIG_ESTADO_SHEET);
  if (!sheet) { sheet = ss.insertSheet(CONFIG.CONFIG_ESTADO_SHEET); sheet.appendRow(['Comunidad','Estado_Bloqueo','Permitir_Subida']); }
  if (sheet.getLastRow() < 1) sheet.appendRow(['Comunidad','Estado_Bloqueo','Permitir_Subida']);

  const data = sheet.getDataRange().getValues();
  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) { if (String(data[i][0]).trim() === key) { rowIdx = i + 1; break; } }
  if (rowIdx === -1) { sheet.appendRow([key, false, false]); rowIdx = sheet.getLastRow(); }
  sheet.getRange(rowIdx, (type === 'lock') ? 2 : 3).setValue(value);
  return { ok: true };
}

/* --- API GUARDADO --- */
function guardarLectura(payload) {
  try {
    let { comunidad, medida, unidad, mes, fotoDataUrl, lat, lng, estado, comentario } = payload || {};
    if (!comunidad || !COMMUNITIES[comunidad]) throw new Error('Comunidad inválida.');
    
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const conf = getCommunityConfigMap_(ss)[comunidad] || {};
    if (conf.isLocked) throw new Error('PERIODO CERRADO.');

    const medidaNum = parseFloat(String(medida).replace(',', '.'));
    mes = toMonthName_(mes);
    const now = new Date();
    const ts = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    
    const { sheetTab, folderId } = COMMUNITIES[comunidad];
    const sheet = getOrCreateSheetTab_(ss, sheetTab);
    const startCol = getOrCreateMonthBlock_(sheet, mes);
    const { url } = savePhoto_(folderId, fotoDataUrl, mes, unidad, now);
    
    const rowValues = [ts, mes, "", unidad, medidaNum, url, lat?`http://maps.google.com/?q=${lat},${lng}`:"", estado||'Bueno', comentario||""];
    
    let targetRow = findExistingRowInBlock_(sheet, startCol, unidad);
    if (targetRow === 0) targetRow = getFirstEmptyRowInBlock_(sheet, startCol);
    
    sheet.getRange(targetRow, startCol, 1, CONFIG.BLOCK_WIDTH).setValues([rowValues]);
    const cell = sheet.getRange(targetRow, startCol + 3);
    if(comentario) cell.setNote(`${ts}: ${comentario}`); else cell.clearNote();
    cell.setBackground((estado==='Malo') ? '#fecaca' : null);

    appendToDatabaseFlat_(ss, { ts, comunidad: COMMUNITIES[comunidad].name, mes, torre: "-", unidad, medida: medidaNum, fotoUrl: url, ubicacionLink: rowValues[6], estado, comentario });
    return { ok: true };
  } catch (err) { return { ok: false, message: err.message }; }
}

function actualizarLectura(payload) {
  try {
    const { comunidad, mes, oldUnidad, newUnidad, medida } = payload;
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = getOrCreateSheetTab_(ss, COMMUNITIES[comunidad].sheetTab);
    const startCol = findMonthBlockStart_(sheet, toMonthName_(mes));
    const rowIdx = findExistingRowInBlock_(sheet, startCol, oldUnidad);
    if (rowIdx === 0) throw new Error('No encontrado');
    
    const current = sheet.getRange(rowIdx, startCol, 1, CONFIG.BLOCK_WIDTH).getValues()[0];
    const newVals = [...current]; 
    newVals[3] = newUnidad; newVals[4] = parseFloat(medida); newVals[0] = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    
    sheet.getRange(rowIdx, startCol, 1, CONFIG.BLOCK_WIDTH).setValues([newVals]);
    return { ok: true };
  } catch(e) { return { ok: false, message: e.message }; }
}

function getLecturasDelMes(comunidad, mesInput) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    return getLecturasBlockData_(ss, comunidad, toMonthName_(mesInput)).map(l => ({
      timestamp: '-', unidad: l.unidad, medida: l.medida, fotoUrl: '', link: '', estado: l.estado, comentario: l.comentario
    })); 
  } catch (e) { return []; }
}

function getUnidadesPendientes(comunidad, mesInput) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const mes = toMonthName_(mesInput);
  const todas = getAllUnitsFromConfig_(ss, comunidad);
  const reg = getLecturasBlockData_(ss, comunidad, mes).map(l=>l.unidad);
  const regSet = new Set(reg.map(u=>String(u).trim().toLowerCase()));
  return todas.filter(u=>!regSet.has(String(u).trim().toLowerCase()));
}

function getLecturaAnterior(comunidad, unidad) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.DB_SHEET_NAME);
  if(!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for(let i=data.length-1; i>=1; i--) {
    if(String(data[i][1]).toLowerCase()===comunidad.toLowerCase() && String(data[i][4]).toLowerCase()===String(unidad).toLowerCase())
      return { fecha: '-', medida: data[i][5], mes: data[i][2] };
  }
  return null;
}

function getCommunityStatus(key) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const c = getCommunityConfigMap_(ss)[key] || {};
  return { locked: !!c.isLocked, allowUpload: !!c.allowUpload };
}

/* --- HELPERS --- */
function getAllUnitsFromConfig_(ss, keyComunidad) {
  const sheet = ss.getSheetByName(CONFIG.CONFIG_UNIDADES_SHEET);
  if (!sheet) return [];
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let colIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim().toLowerCase() === keyComunidad.toLowerCase()) { colIndex = i + 1; break; }
  }
  if (colIndex === -1) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues();
  return values.map(r => r[0]).filter(v => v !== '' && v != null);
}

function getCommunityConfigMap_(ss) {
  const sheet = ss.getSheetByName(CONFIG.CONFIG_ESTADO_SHEET);
  const map = {};
  if (!sheet || sheet.getLastRow() < 2) return map; 
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    map[String(data[i][0]).trim()] = { isLocked: String(data[i][1]).toLowerCase() === 'true', allowUpload: String(data[i][2]).toLowerCase() === 'true' };
  }
  return map;
}

function getProcessedHashes_(ss) {
  const s = ss.getSheetByName(CONFIG.DB_HASHES_SHEET);
  const set = new Set();
  if (!s || s.getLastRow() < 2) return set;
  const d = s.getDataRange().getValues();
  for (let i = 1; i < d.length; i++) if (d[i][3]) set.add(String(d[i][3]));
  return set;
}

function getLecturasBlockData_(ss, key, mes) {
  const s = ss.getSheetByName(COMMUNITIES[key].sheetTab);
  if (!s) return [];
  const start = findMonthBlockStart_(s, mes);
  if (!start) return [];
  const lastRow = Math.max(s.getLastRow(), CONFIG.DATA_START_ROW);
  const numRows = lastRow - CONFIG.DATA_START_ROW + 1;
  if(numRows < 1) return [];
  const data = s.getRange(CONFIG.DATA_START_ROW, start, numRows, CONFIG.BLOCK_WIDTH).getValues();
  const res = [];
  for (let i=0; i<data.length; i++) {
    if (data[i][3] && data[i][4]!=='') res.push({ unidad: data[i][3], medida: data[i][4], estado: data[i][7]||'Bueno', comentario: data[i][8]||'' });
  }
  return res;
}

function appendToDatabaseFlat_(ss, d) {
  let s = ss.getSheetByName(CONFIG.DB_SHEET_NAME);
  if(!s) { s=ss.insertSheet(CONFIG.DB_SHEET_NAME); s.appendRow(['Ts','Com','Mes','T','U','M','Foto','Link','Est','Coment']); }
  s.appendRow([d.ts,d.comunidad,d.mes,d.torre,d.unidad,d.medida,d.fotoUrl,d.ubicacionLink,d.estado,d.comentario]);
}

function savePhoto_(fid, data, mes, uni, date) {
  const b = Utilities.base64Decode(data.split(',')[1]);
  const name = `${uni}-${mes}.jpg`;
  const root = DriveApp.getFolderById(fid);
  const yf = getFolder_(root, Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy'));
  const mf = getFolder_(yf, mes);
  const existing = mf.getFilesByName(name);
  while(existing.hasNext()) existing.next().setTrashed(true);
  const f = mf.createFile(Utilities.newBlob(b, 'image/jpeg', name));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { url: f.getUrl() };
}

function getFolder_(p, n) { const i = p.getFoldersByName(n); return i.hasNext() ? i.next() : p.createFolder(n); }
function toMonthName_(m) { const names=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']; const raw=String(m).toLowerCase(); if(names.includes(raw))return raw; const match=raw.match(/-(\d{2})$/); return match ? names[parseInt(match[1])-1] : raw; }
function findMonthBlockStart_(s, m) { 
  const lastCol = s.getLastColumn();
  if(lastCol < 1) return 0;
  const v=s.getRange(1,1,1,lastCol).getValues()[0]; 
  for(let i=0;i<v.length;i++) if(String(v[i]).trim().toLowerCase()===m) return i+1; 
  return 0; 
}
function getOrCreateMonthBlock_(s, m) { 
  let start=findMonthBlockStart_(s,m); if(start) {ensureHeaders_(s,start); return start;}
  let end=0; const lastCol=s.getLastColumn();
  if(lastCol>0){ const v=s.getRange(1,1,1,lastCol).getValues()[0]; for(let i=v.length-1; i>=0; i--) if(v[i]) { end=i+CONFIG.BLOCK_WIDTH; break; } }
  start = end>0 ? end+CONFIG.BLOCK_GAP_CELLS+1 : 1;
  s.getRange(1,start).setValue(m); ensureHeaders_(s,start); return start;
}
function ensureHeaders_(s, c) { s.getRange(CONFIG.HEADER_ROW,c,1,9).setValues([['timestamp','mes','torre','unidad','medida_actual','foto_url','ubicacion_link','estado','comentario']]); }
function getOrCreateSheetTab_(ss, n) { let s=ss.getSheetByName(n); if(!s)s=ss.insertSheet(n); return s; }
function findExistingRowInBlock_(s, c, u) { const d=s.getRange(3,c,s.getLastRow(),9).getValues(); for(let i=0;i<d.length;i++) if(String(d[i][3])===String(u)) return i+3; return 0; }
function getFirstEmptyRowInBlock_(s, c) { const d=s.getRange(3,c,s.getLastRow(),9).getValues(); for(let i=0;i<d.length;i++) if(!d[i][0]) return i+3; return s.getLastRow()+1; }