# Instalación y Configuración con Google Sheets

Esta guía te ayudará a configurar la aplicación de gestión de vehículos municipales usando Google Sheets como base de datos.

## Requisitos Previos

- Una cuenta de Google
- Acceso a Google Sheets y Google Apps Script
- Node.js instalado (para el frontend)

## Paso 1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva hoja de cálculo
2. Nómbrala "Gestión de Vehículos Municipales"

### Hoja VEHICULOS

3. Renombra la primera hoja como **VEHICULOS**
4. En la primera fila, agrega los siguientes encabezados (exactamente como se muestran):

```
RI | Tipo | Marca Modelo | Año | Patente | Dependencia | Area Taller | Motivo | Estado | Suministros | Final_Resultado | Finalizado_Por | Finalizado_Fecha | Foto_URL | QR_URL
```

5. Puedes agregar algunos datos de ejemplo en las filas siguientes

### Hoja HISTORIAL

6. Crea una segunda hoja llamada **HISTORIAL**
7. En la primera fila, agrega estos encabezados:

```
RI | Fecha | Usuario | Accion | Detalles
```

### Obtener el ID de la Hoja

8. Copia el ID de tu hoja de cálculo desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/TU_SPREADSHEET_ID/edit
   ```
   El ID es la parte entre `/d/` y `/edit`

## Paso 2: Configurar Google Apps Script

1. En tu hoja de Google Sheets, ve a **Extensiones > Apps Script**
2. Elimina cualquier código existente
3. Copia y pega el contenido del archivo `google-apps-script/Code.gs`
4. Guarda el proyecto (Ctrl+S o Cmd+S)

### Configurar el Spreadsheet ID

5. En el editor de Apps Script, busca la función `configurarSpreadsheet()`
6. Reemplaza `'TU_SPREADSHEET_ID_AQUI'` con el ID que copiaste anteriormente
7. Ejecuta la función `configurarSpreadsheet()`:
   - Selecciona `configurarSpreadsheet` en el menú desplegable de funciones
   - Haz clic en el botón "Ejecutar" (▶️)
   - Autoriza la aplicación cuando se te solicite
   - Verifica en los registros (Ver > Registros) que se configuró correctamente

## Paso 3: Desplegar la API

1. En el editor de Apps Script, haz clic en **Implementar > Nueva implementación**
2. Configura la implementación:
   - **Tipo:** Aplicación web
   - **Descripción:** API de Vehículos Municipales v1
   - **Ejecutar como:** Yo (tu email)
   - **Quién tiene acceso:** Cualquier persona
3. Haz clic en **Implementar**
4. **Importante:** Copia la **URL de la aplicación web** que aparece. Tiene este formato:
   ```
   https://script.google.com/macros/s/SCRIPT_ID/exec
   ```

### Actualizar Implementaciones

Si modificas el código más adelante:
1. Ve a **Implementar > Administrar implementaciones**
2. Haz clic en el ícono de editar (✏️) de tu implementación
3. Cambia la versión a "Nueva versión"
4. Guarda los cambios

## Paso 4: Configurar el Frontend

1. En el directorio raíz del proyecto frontend, crea un archivo `.env.local`
2. Agrega la URL del script que copiaste:

```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
NEXT_PUBLIC_ADMIN_EMAILS=admin@municipalidad.gov.ar,taller@municipalidad.gov.ar
```

3. Instala las dependencias:
```bash
npm install
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en `http://localhost:3000`

## Paso 5: Probar la Integración

1. Inicia sesión en la aplicación con cualquier email
2. Si usas un email de administrador (del .env.local), podrás editar vehículos
3. Prueba las siguientes funciones:
   - Ver listado de vehículos
   - Buscar y filtrar
   - Ver detalle de un vehículo
   - Editar un vehículo (como admin)
   - Finalizar un vehículo (como admin)
4. Verifica en Google Sheets que:
   - Los cambios se reflejan en la hoja VEHICULOS
   - Las acciones se registran en la hoja HISTORIAL

## Formato de Suministros

Los suministros se guardan como texto con el siguiente formato:

```
4123: Filtro de aceite (Terminado)
4124: Filtro de aire (Pendiente)
4125: Aceite 15W40 x 20L (Cancelado)
```

**Estados válidos:**
- `Terminado` / `Completado` - Suministro recibido y aplicado
- `Pendiente` / `En proceso` - Suministro solicitado pero no recibido
- `Cancelado` - Suministro cancelado

**Importante:** No se puede finalizar un vehículo si tiene suministros en estado Pendiente.

## Subida de Imágenes

**Nota:** La implementación actual de subida de imágenes es básica. Para producción, se recomienda:

1. Usar Google Drive API para almacenar las imágenes
2. Configurar permisos públicos de lectura para las imágenes
3. Guardar las URLs de Google Drive en el campo Foto_URL

### Implementar subida a Google Drive (Opcional)

1. Habilita la API de Google Drive en el proyecto de Apps Script
2. Modifica la función `uploadImage()` en Code.gs para subir a Drive
3. Retorna la URL pública de la imagen

Ejemplo básico:
```javascript
function uploadImageToDrive(base64Data, filename) {
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', filename)
  const folder = DriveApp.getFolderById('TU_FOLDER_ID')
  const file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  return file.getDownloadUrl()
}
```

## Generación de Códigos QR

Los códigos QR pueden generarse de dos formas:

### Opción 1: QR con el RI del vehículo
```typescript
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${vehiculo.RI}`
```

### Opción 2: QR con la URL del detalle
```typescript
const detailUrl = `${window.location.origin}/vehiculo/${vehiculo.RI}`
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(detailUrl)}`
```

## Permisos y Seguridad

### Nivel de Acceso Actual
- **Cualquier persona con el link:** La API está configurada para ser accesible públicamente
- **No requiere autenticación:** Cualquiera puede consultar y modificar datos

### Mejorar la Seguridad (Recomendado para Producción)

1. **Agregar autenticación con token:**
```javascript
function doPost(e) {
  const token = e.parameter.token
  const expectedToken = PropertiesService.getScriptProperties().getProperty('API_TOKEN')
  
  if (token !== expectedToken) {
    return createResponse({ error: 'No autorizado' }, 401)
  }
  
  // ... resto del código
}
```

2. **Configurar el token:**
```javascript
function configurarToken() {
  const token = 'TU_TOKEN_SEGURO_AQUI'
  PropertiesService.getScriptProperties().setProperty('API_TOKEN', token)
}
```

3. **Actualizar el frontend:**
```typescript
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

fetch(`${API_URL}?action=getVehiculos&token=${API_TOKEN}`)
```

## Troubleshooting

### Error: "Hoja VEHICULOS no encontrada"
- Verifica que la hoja se llame exactamente "VEHICULOS" (mayúsculas)
- Confirma que ejecutaste la función `configurarSpreadsheet()`

### Error: "No se pueden cargar los vehículos"
- Verifica que la URL del script en `.env.local` sea correcta
- Confirma que desplegaste el script como aplicación web
- Revisa que el acceso esté configurado como "Cualquier persona"

### Los cambios no se guardan
- Revisa los registros en Apps Script (Ver > Registros)
- Verifica que los nombres de columnas coincidan exactamente
- Confirma que el usuario tiene permisos de edición en la hoja

### El historial no se muestra
- Verifica que existe la hoja "HISTORIAL"
- Confirma que la hoja tiene los encabezados correctos
- Revisa los registros de Apps Script para ver si hay errores

## Mantenimiento

### Respaldo de Datos
Configura respaldos automáticos de tu Google Sheet:
1. Ve a Archivo > Historial de versiones
2. O crea copias periódicas manualmente

### Monitoreo
- Revisa periódicamente los registros de Apps Script
- Configura alertas de error si es posible
- Monitorea el uso de cuotas de Google Apps Script

### Límites de Google Apps Script
- 20,000 llamadas por día (cuota gratuita)
- 6 minutos de tiempo de ejecución por ejecución
- Si necesitas más, considera migrar a Google Cloud Functions

## Recursos Adicionales

- [Documentación de Google Apps Script](https://developers.google.com/apps-script)
- [Referencia de Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [Google Drive API](https://developers.google.com/drive)

## Soporte

Si tienes problemas:
1. Revisa esta guía completa
2. Consulta los registros de Apps Script
3. Verifica la configuración paso por paso
4. Contacta al equipo de desarrollo
