/***** CONFIGURACIÓN ***************************************/
// IMPORTANTE: Reemplaza estos IDs con tus propios valores
// Ver .env.example para la configuración completa

// 1) Carpeta maestra donde deben quedar todos los documentos creados
const MASTER_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('MASTER_FOLDER_ID') || 'YOUR_MASTER_FOLDER_ID';

// 2) Mapeo de Plantillas por Comunidad + Cargo
//    Usa minúsculas para las llaves de comunidades
//    Reemplaza cada 'YOUR_...' por el ID real de la plantilla Google Docs correspondiente
const TEMPLATE_MAP = {
  'community1': {
    'mayordomo': 'YOUR_COMMUNITY1_MAYORDOMO_TEMPLATE_ID',
    'conserje': 'YOUR_COMMUNITY1_CONSERJE_TEMPLATE_ID',
    'auxiliar de aseo': 'YOUR_COMMUNITY1_AUX_ASEO_TEMPLATE_ID',
  },
  'community2': {
    'mayordomo': 'YOUR_COMMUNITY2_MAYORDOMO_TEMPLATE_ID',
    'conserje': 'YOUR_COMMUNITY2_CONSERJE_TEMPLATE_ID',
    'auxiliar de aseo': 'YOUR_COMMUNITY2_AUX_ASEO_TEMPLATE_ID',
  },
  'community3': {
    'mayordomo': 'YOUR_COMMUNITY3_MAYORDOMO_TEMPLATE_ID',
    'conserje': 'YOUR_COMMUNITY3_CONSERJE_TEMPLATE_ID',
    'auxiliar de aseo': 'YOUR_COMMUNITY3_AUX_ASEO_TEMPLATE_ID',
  },
  'community4': {
    'mayordomo': 'YOUR_COMMUNITY4_MAYORDOMO_TEMPLATE_ID',
    'conserje': 'YOUR_COMMUNITY4_CONSERJE_TEMPLATE_ID',
    'auxiliar de aseo': 'YOUR_COMMUNITY4_AUX_ASEO_TEMPLATE_ID',
  },
  'community5': {
    'mayordomo': 'YOUR_COMMUNITY5_MAYORDOMO_TEMPLATE_ID',
    'conserje': 'YOUR_COMMUNITY5_CONSERJE_TEMPLATE_ID',
    'auxiliar de aseo': 'YOUR_COMMUNITY5_AUX_ASEO_TEMPLATE_ID',
  },
  'community6': {
    'mayordomo': 'YOUR_COMMUNITY6_MAYORDOMO_TEMPLATE_ID',
    'conserje': 'YOUR_COMMUNITY6_CONSERJE_TEMPLATE_ID',
    'auxiliar de aseo': 'YOUR_COMMUNITY6_AUX_ASEO_TEMPLATE_ID',
  },
};
/************************************************************/

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Contratos')
    .addItem('Generar Contrato (DOC + PDF)', 'generarContrato')
    .addToUi();
}

/**
 * Función principal (asignar al botón).
 */
function generarContrato() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();

  // Leer exactamente las celdas que indicaste (como texto mostrado)
  const comunidad   = sh.getRange('C4').getDisplayValue().trim();
  const cargo       = sh.getRange('C5').getDisplayValue().trim();
  const modalidad   = sh.getRange('C6').getDisplayValue().trim();
  const nombre      = sh.getRange('C7').getDisplayValue().trim();
  const rut         = sh.getRange('C8').getDisplayValue().trim();
  const nacionalidad= sh.getRange('C9').getDisplayValue().trim();
  const correo      = sh.getRange('C10').getDisplayValue().trim();
  const domicilio   = sh.getRange('C11').getDisplayValue().trim();
  const comuna      = sh.getRange('C12').getDisplayValue().trim();
  const fechaIni    = sh.getRange('C13').getDisplayValue().trim();
  const fechaTer    = sh.getRange('C14').getDisplayValue().trim();

  const md          = sh.getRange('F6').getDisplayValue().trim();
  const sueldo      = sh.getRange('F7').getDisplayValue().trim();
  const sueldoL     = sh.getRange('G7').getDisplayValue().trim();
  const mov         = sh.getRange('F8').getDisplayValue().trim();
  const movL        = sh.getRange('G8').getDisplayValue().trim();
  const col         = sh.getRange('F9').getDisplayValue().trim();
  const colL        = sh.getRange('G9').getDisplayValue().trim();
  const afp         = sh.getRange('F10').getDisplayValue().trim();
  const salud       = sh.getRange('F11').getDisplayValue().trim();
  const horario1    = sh.getRange('F12').getDisplayValue().trim();
  const horario2    = sh.getRange('F13').getDisplayValue().trim();

  // Validar selección de plantilla
  const keyCom = comunidad.toLowerCase();
  const keyCar = cargo.toLowerCase();
  const plantillaId = (TEMPLATE_MAP[keyCom] && TEMPLATE_MAP[keyCom][keyCar]) ? TEMPLATE_MAP[keyCom][keyCar] : null;
  if (!plantillaId) {
    throw new Error('No se encontró plantilla para: Comunidad "' + comunidad + '" y Cargo "' + cargo + '". Verifica TEMPLATE_MAP.');
  }

  if (!MASTER_FOLDER_ID) {
    throw new Error('Debes configurar MASTER_FOLDER_ID con el ID de la carpeta maestra de destino.');
  }

  const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);

  // Nombre base solicitado: "01.- {Nombre} - {Cargo} - {Comunidad}"
  const baseNameRaw = `01.- ${nombre} - ${cargo} - ${comunidad}`;
  const baseName = sanitizeName(baseNameRaw);

  // Crear/usar subcarpeta con el mismo nombre dentro de la carpeta maestra
  const subFolder = ensureSubFolder(masterFolder, baseName);

  // Copiar plantilla a la subcarpeta con el nombre base (esto crea el DOC)
  const plantillaFile = DriveApp.getFileById(plantillaId);
  const docCopyFile = plantillaFile.makeCopy(baseName, subFolder);
  const docId = docCopyFile.getId();

  // Reemplazar marcadores en el DOC
  const dataMap = {
    'CARGO': cargo,
    'MODALIDAD': modalidad,
    'NOMBRE': nombre,
    'RUT': rut,
    'NACIONALIDAD': nacionalidad,
    'CORREO': correo,
    'DOMICILIO': domicilio,
    'COMUNA': comuna,
    'FECHA_INICIO': fechaIni,
    'FECHA_TERMINO': fechaTer,
    'MD': md,
    'SUELDO': sueldo,
    'SUELDO_LETRAS': sueldoL,
    'MOVILIZACION': mov,
    'MOVILIZACION_LETRAS': movL,
    'COLACION': col,
    'COLACION_LETRAS': colL,
    'AFP': afp,
    'SALUD': salud,
    'HORARIO_1': horario1,
    'HORARIO_2': horario2,
  };
  replacePlaceholdersInDoc(docId, dataMap);

  // Exportar a PDF dentro de la misma subcarpeta
  const pdfBlob = DriveApp.getFileById(docId).getAs(MimeType.PDF);
  pdfBlob.setName(baseName + '.pdf');
  const pdfFile = subFolder.createFile(pdfBlob);

  // URLs de los archivos
  const docUrl = DriveApp.getFileById(docId).getUrl(); // URL del Google Doc
  const pdfUrl = pdfFile.getUrl();                     // URL del PDF

  // Escribir ENLACES en la hoja (C16 = PDF, C17 = DOC)
  sh.getRange('C16').setValue(pdfUrl);
  sh.getRange('C17').setValue(docUrl);

  // Aviso rápido
  SpreadsheetApp.getActiveSpreadsheet().toast('Contrato generado (DOC + PDF con enlaces).', 'Listo', 5);

}

/** Utilidad: reemplaza {{CLAVE}} por su valor en el cuerpo del Doc */
function replacePlaceholdersInDoc(docId, map) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();

  Object.keys(map).forEach(key => {
    const pattern = '\\{\\{\\s*' + escapeForRegExp(key) + '\\s*\\}\\}';
    body.replaceText(pattern, map[key]);
  });

  doc.saveAndClose();
}

/** Crea o devuelve una subcarpeta por nombre dentro de parent */
function ensureSubFolder(parentFolder, name) {
  const it = parentFolder.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return parentFolder.createFolder(name);
}

/** Limpieza mínima para nombres de archivo/carpeta */
function sanitizeName(name) {
  // Quita caracteres problemáticos para nombres en Drive
  return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();
}

/** Escapar para usar en RegExp */
function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
