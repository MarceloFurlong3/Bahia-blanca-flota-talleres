/**
 * APLICACIÓN DE GESTIÓN DE VEHÍCULOS MUNICIPALES
 * Google Apps Script - Backend API
 * 
 * CONFIGURACIÓN:
 * 1. Crear una hoja de Google Sheets llamada "VEHICULOS" con las siguientes columnas:
 *    RI | Tipo | Marca Modelo | Año | Patente | Dependencia | Area Taller | Motivo | Estado | 
 *    Suministros | Final_Resultado | Finalizado_Por | Finalizado_Fecha | Foto_URL | QR_URL
 * 
 * 2. Crear una hoja llamada "HISTORIAL" con las columnas:
 *    RI | Fecha | Usuario | Accion | Detalles
 * 
 * 3. Desplegar como aplicación web:
 *    - Extensiones > Apps Script
 *    - Pegar este código
 *    - Implementar > Nueva implementación
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 *    - Copiar la URL de la aplicación web
 */

// ID de la hoja de cálculo (obtenerlo de la URL de tu Google Sheet)
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')

// Nombres de las hojas
const SHEET_VEHICULOS = 'VEHICULOS'
const SHEET_HISTORIAL = 'HISTORIAL'

/**
 * Función principal que maneja todas las peticiones HTTP
 */
function doGet(e) {
  const action = e.parameter.action
  
  try {
    switch(action) {
      case 'getVehiculos':
        return getVehiculos()
      case 'getVehiculo':
        return getVehiculo(e.parameter.ri)
      default:
        return createResponse({ error: 'Acción no válida' }, 400)
    }
  } catch (error) {
    Logger.log('Error en doGet: ' + error.toString())
    return createResponse({ error: error.toString() }, 500)
  }
}

/**
 * Función que maneja peticiones POST (actualizaciones)
 */
function doPost(e) {
  const action = e.parameter.action
  
  try {
    const data = JSON.parse(e.postData.contents)
    
    switch(action) {
      case 'updateVehiculo':
        return updateVehiculo(data)
      case 'finalizarVehiculo':
        return finalizarVehiculo(data)
      case 'uploadImage':
        return uploadImage(data)
      default:
        return createResponse({ error: 'Acción no válida' }, 400)
    }
  } catch (error) {
    Logger.log('Error en doPost: ' + error.toString())
    return createResponse({ error: error.toString() }, 500)
  }
}

/**
 * Obtener todos los vehículos
 */
function getVehiculos() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(SHEET_VEHICULOS)
  
  if (!sheet) {
    return createResponse({ error: 'Hoja VEHICULOS no encontrada' }, 404)
  }
  
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const vehiculos = []
  
  // Convertir filas a objetos
  for (let i = 1; i < data.length; i++) {
    const vehiculo = {}
    for (let j = 0; j < headers.length; j++) {
      vehiculo[headers[j]] = data[i][j]
    }
    vehiculos.push(vehiculo)
  }
  
  return createResponse(vehiculos)
}

/**
 * Obtener un vehículo específico por RI
 */
function getVehiculo(ri) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(SHEET_VEHICULOS)
  
  if (!sheet) {
    return createResponse({ error: 'Hoja VEHICULOS no encontrada' }, 404)
  }
  
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const riIndex = headers.indexOf('RI')
  
  // Buscar el vehículo por RI
  for (let i = 1; i < data.length; i++) {
    if (data[i][riIndex] == ri) {
      const vehiculo = {}
      for (let j = 0; j < headers.length; j++) {
        vehiculo[headers[j]] = data[i][j]
      }
      return createResponse(vehiculo)
    }
  }
  
  return createResponse({ error: 'Vehículo no encontrado' }, 404)
}

/**
 * Actualizar un vehículo
 */
function updateVehiculo(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(SHEET_VEHICULOS)
  
  if (!sheet) {
    return createResponse({ error: 'Hoja VEHICULOS no encontrada' }, 404)
  }
  
  const sheetData = sheet.getDataRange().getValues()
  const headers = sheetData[0]
  const riIndex = headers.indexOf('RI')
  
  // Buscar la fila del vehículo
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][riIndex] == data.ri) {
      // Actualizar solo los campos enviados
      for (let key in data.updates) {
        const colIndex = headers.indexOf(key)
        if (colIndex !== -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(data.updates[key])
        }
      }
      
      // Registrar en historial si hay cambios importantes
      if (data.updates.Estado || data.updates['Area Taller'] || data.updates.Motivo) {
        const detalles = []
        if (data.updates.Estado) detalles.push('Estado: ' + data.updates.Estado)
        if (data.updates['Area Taller']) detalles.push('Área: ' + data.updates['Area Taller'])
        if (data.updates.Motivo) detalles.push('Motivo: ' + data.updates.Motivo)
        
        agregarHistorial(
          data.ri,
          data.usuario || 'Sistema',
          'Actualización',
          detalles.join(' | ')
        )
      }
      
      return createResponse({ success: true, message: 'Vehículo actualizado correctamente' })
    }
  }
  
  return createResponse({ error: 'Vehículo no encontrado' }, 404)
}

/**
 * Finalizar un vehículo
 */
function finalizarVehiculo(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(SHEET_VEHICULOS)
  
  if (!sheet) {
    return createResponse({ error: 'Hoja VEHICULOS no encontrada' }, 404)
  }
  
  const sheetData = sheet.getDataRange().getValues()
  const headers = sheetData[0]
  const riIndex = headers.indexOf('RI')
  
  // Buscar la fila del vehículo
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][riIndex] == data.ri) {
      const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')
      
      // Actualizar campos de finalización
      const resultadoIndex = headers.indexOf('Final_Resultado')
      const finalizadoPorIndex = headers.indexOf('Finalizado_Por')
      const finalizadoFechaIndex = headers.indexOf('Finalizado_Fecha')
      
      if (resultadoIndex !== -1) sheet.getRange(i + 1, resultadoIndex + 1).setValue(data.resultado)
      if (finalizadoPorIndex !== -1) sheet.getRange(i + 1, finalizadoPorIndex + 1).setValue(data.usuario)
      if (finalizadoFechaIndex !== -1) sheet.getRange(i + 1, finalizadoFechaIndex + 1).setValue(fecha)
      
      // Actualizar otros campos si se enviaron
      if (data.updates) {
        for (let key in data.updates) {
          const colIndex = headers.indexOf(key)
          if (colIndex !== -1) {
            sheet.getRange(i + 1, colIndex + 1).setValue(data.updates[key])
          }
        }
      }
      
      // Agregar entrada en el historial
      agregarHistorial(
        data.ri,
        data.usuario,
        'Finalización',
        data.resultado
      )
      
      return createResponse({ success: true, message: 'Vehículo finalizado correctamente' })
    }
  }
  
  return createResponse({ error: 'Vehículo no encontrado' }, 404)
}

/**
 * Agregar una entrada al historial
 */
function agregarHistorial(ri, usuario, accion, detalles) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  let sheet = ss.getSheetByName(SHEET_HISTORIAL)
  
  // Crear la hoja HISTORIAL si no existe
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_HISTORIAL)
    sheet.appendRow(['RI', 'Fecha', 'Usuario', 'Accion', 'Detalles'])
  }
  
  const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
  sheet.appendRow([ri, fecha, usuario, accion, detalles])
}

/**
 * Obtener historial de un vehículo
 */
function getHistorial(ri) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID)
  const sheet = ss.getSheetByName(SHEET_HISTORIAL)
  
  if (!sheet) {
    return []
  }
  
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const riIndex = headers.indexOf('RI')
  const historial = []
  
  // Buscar todas las entradas del vehículo
  for (let i = 1; i < data.length; i++) {
    if (data[i][riIndex] == ri) {
      const entrada = {}
      for (let j = 0; j < headers.length; j++) {
        entrada[headers[j]] = data[i][j]
      }
      historial.push(entrada)
    }
  }
  
  return historial
}

/**
 * Subir imagen (simulado - Google Sheets no almacena binarios)
 * En producción, usar Google Drive API
 */
function uploadImage(data) {
  // Aquí deberías implementar la lógica para subir a Google Drive
  // Por ahora, retornamos una URL de ejemplo
  return createResponse({ 
    success: true, 
    url: data.url || '/placeholder.svg',
    message: 'Para implementar subida real, usar Google Drive API'
  })
}

/**
 * Crear respuesta JSON
 */
function createResponse(data, status = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data))
  response.setMimeType(ContentService.MimeType.JSON)
  
  if (status !== 200) {
    // Apps Script no permite cambiar el código de estado HTTP directamente
    // pero podemos incluir el status en la respuesta
    return response
  }
  
  return response
}

/**
 * Configurar el ID de la hoja de cálculo
 * Ejecutar esta función una sola vez desde el editor de scripts
 */
function configurarSpreadsheet() {
  // Reemplazar con el ID de tu Google Sheet
  const spreadsheetId = 'TU_SPREADSHEET_ID_AQUI'
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId)
  Logger.log('Spreadsheet ID configurado: ' + spreadsheetId)
}
