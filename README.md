# Sistema de Gestión de Vehículos Municipales

Aplicación web responsive para gestionar y visualizar el listado de vehículos municipales con Google Sheets como base de datos.

## Características

- **Autenticación por email** con roles de usuario y administrador
- **Listado de vehículos** con búsqueda y filtros
- **Vista detalle** con información completa y código QR
- **Edición administrativa** de estado, motivo, área taller y fotos
- **Sistema de finalización** con registro de resultado, responsable y fecha
- **Historial de vehículo** almacenado en hoja separada de Google Sheets
- **Validación de suministros** con control de estados antes de finalizar
- **Diseño responsive** optimizado para uso móvil
- **Google Sheets como base de datos** con Google Apps Script como API

## Instalación

### Opción 1: Configuración con Google Sheets (Recomendado)

Para una guía completa paso a paso, consulta el archivo **[INSTALACION_GOOGLE_SHEETS.md](./INSTALACION_GOOGLE_SHEETS.md)**.

**Resumen rápido:**

1. Crea una hoja de Google Sheets con dos pestañas:
   - **VEHICULOS**: Datos actuales de cada vehículo
   - **HISTORIAL**: Registro de todas las acciones

2. Despliega el código de `google-apps-script/Code.gs` como aplicación web

3. Configura las variables de entorno en `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_SCRIPT_ID/exec
NEXT_PUBLIC_ADMIN_EMAILS=admin@municipalidad.gov.ar,taller@municipalidad.gov.ar
```

4. Instala e inicia la aplicación:
```bash
npm install
npm run dev
```

### Opción 2: API Personalizada

Si preferís usar tu propia API REST en lugar de Google Sheets, configurá la URL en `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://api.municipalidad.gov.ar/vehiculos
```

## Estructura de Datos

### Hoja VEHICULOS (Google Sheets)

Columnas requeridas:

```
RI | Tipo | Marca Modelo | Año | Patente | Dependencia | Area Taller | Motivo | Estado | Suministros | Final_Resultado | Finalizado_Por | Finalizado_Fecha | Foto_URL | QR_URL
```

### Hoja HISTORIAL (Google Sheets)

Columnas requeridas:

```
RI | Fecha | Usuario | Accion | Detalles
```

Cada acción importante (ingreso, cambios, finalización) agrega automáticamente una fila en esta hoja.

### Estructura JSON (para API personalizada)

Cada vehículo debe tener la siguiente estructura:

```json
{
  "RI": "string",
  "Tipo": "string",
  "Marca Modelo": "string",
  "Año": number,
  "Patente": "string",
  "Dependencia": "string",
  "Area Taller": "string",
  "Motivo": "string",
  "Estado": "string",
  "Suministros": "string",
  "Final_Resultado": "string",
  "Finalizado_Por": "string",
  "Finalizado_Fecha": "string",
  "Historial": "string",
  "Foto_URL": "string",
  "QR_URL": "string"
}
```

### Campos de Finalización

- **Final_Resultado**: Texto con el resultado o resolución final del vehículo
- **Finalizado_Por**: Email del administrador que finalizó el vehículo
- **Finalizado_Fecha**: Fecha de finalización en formato YYYY-MM-DD

Cuando un administrador finaliza un vehículo:
1. Se actualizan estos tres campos en la hoja VEHICULOS
2. Se agrega automáticamente una fila en la hoja HISTORIAL
3. El historial se consulta desde la hoja separada (no se guarda como texto)

### Campo Historial

**IMPORTANTE:** En la implementación con Google Sheets, el historial NO se guarda como campo de texto en VEHICULOS, sino que se consulta dinámicamente desde la hoja HISTORIAL.

La hoja HISTORIAL registra:
- **Ingresos** al taller
- **Actualizaciones** de estado, área o motivo
- **Finalizaciones** de vehículos
- **Cambios en suministros** (si se implementa)

Ejemplo de registros en la hoja HISTORIAL:

```
RI  | Fecha               | Usuario                        | Accion        | Detalles
001 | 2026-01-05 10:30:00 | taller@municipalidad.gov.ar   | Ingreso       | Mantenimiento preventivo
001 | 2026-01-08 14:20:00 | taller@municipalidad.gov.ar   | Actualización | Estado: Taller | Área: Mecánica General
001 | 2026-01-10 09:00:00 | admin@municipalidad.gov.ar    | Finalización  | Revisión completa realizada
```

### Campo Suministros

El campo `Suministros` es de **solo lectura** en la interfaz y debe contener un listado de suministros con su estado. El formato esperado es:

```
NUMERO: DESCRIPCION (ESTADO)
```

Estados válidos:
- **Terminado** / **Completado**: Suministro recibido y aplicado (muestra badge verde)
- **Pendiente** / **En proceso**: Suministro solicitado pero no recibido (muestra badge rojo)
- **Cancelado**: Suministro cancelado (muestra badge gris)

Ejemplo:
```
4123: Filtro de aceite (Terminado)
4124: Filtro de aire (Terminado)
4125: Aceite 15W40 x 20L (Pendiente)
```

**IMPORTANTE:** Los suministros se editan directamente en Google Sheets. La aplicación solo los visualiza y valida.

## API de Google Apps Script

### Endpoints Disponibles

#### GET - Obtener Vehículos
```
GET ?action=getVehiculos
Respuesta: Array de objetos Vehiculo
```

#### GET - Obtener Historial
```
GET ?action=getHistorial&ri=001
Respuesta: Array de entradas de historial para el vehículo
```

#### POST - Actualizar Vehículo
```
POST ?action=updateVehiculo
Body: { ri: string, updates: Partial<Vehiculo>, usuario: string }
Respuesta: { success: boolean, message: string }
```

#### POST - Finalizar Vehículo
```
POST ?action=finalizarVehiculo
Body: { ri: string, resultado: string, usuario: string, updates?: Partial<Vehiculo> }
Respuesta: { success: boolean, message: string }
Efecto: Actualiza campos de finalización Y agrega fila en HISTORIAL
```

#### POST - Subir Imagen
```
POST ?action=uploadImage
Body: { data: string (base64), filename: string, type: string }
Respuesta: { success: boolean, url: string }
```

## Funcionalidades

### Para todos los usuarios
- Ver listado de vehículos
- Buscar por RI y Marca/Modelo
- Filtrar por Estado y Área Taller
- Ver detalles completos del vehículo
- Visualizar código QR
- Ver historial de eventos del vehículo (desde hoja HISTORIAL)
- Ver estado de suministros con códigos de color

### Solo para administradores
- Editar Estado del vehículo
- Modificar Motivo y observaciones
- Cambiar Área Taller
- Subir o cambiar foto del vehículo
- **Finalizar vehículo** con resultado, que automáticamente:
  - Registra el resultado en la columna `Final_Resultado` de VEHICULOS
  - Guarda el email del administrador en `Finalizado_Por`
  - Registra la fecha actual en `Finalizado_Fecha`
  - **Agrega una fila nueva en la hoja HISTORIAL** con la acción "Finalización"

### Sistema de Validación de Suministros

La aplicación incluye un sistema de validación que:
- Parsea el campo `Suministros` desde la hoja VEHICULOS
- Busca el formato `NUMERO: DESCRIPCION (ESTADO)`
- Muestra badges de colores según el estado de cada suministro
- **Bloquea la finalización** si hay suministros en estado "Pendiente"
- Muestra una alerta explicativa cuando hay suministros pendientes

Un vehículo solo puede ser finalizado cuando:
- NO tenga suministros pendientes, O
- Todos los suministros estén en estado "Terminado" o "Cancelado"

## Configuración de Administradores

Los emails de administradores se configuran en la variable de entorno:

```env
NEXT_PUBLIC_ADMIN_EMAILS=admin@municipalidad.gov.ar,taller@municipalidad.gov.ar,otro@municipalidad.gov.ar
```

Separá múltiples emails con comas. Los usuarios con estos emails tendrán permisos para editar y finalizar vehículos.

## Subida de Imágenes

### Implementación Actual (Básica)
La implementación actual incluye la estructura pero requiere configuración adicional para producción.

### Para Producción (Recomendado)
Implementar subida a Google Drive:

1. Habilitar Google Drive API en el proyecto de Apps Script
2. Crear una carpeta en Drive para almacenar las fotos
3. Modificar la función `uploadImage()` en Code.gs:

```javascript
function uploadImageToDrive(base64Data, filename) {
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64Data.split(',')[1]), 
    'image/jpeg', 
    filename
  )
  const folder = DriveApp.getFolderById('TU_FOLDER_ID')
  const file = folder.createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  return file.getDownloadUrl()
}
```

## Generación de Códigos QR

Los códigos QR se pueden generar de dos formas:

### Opción 1: QR con el RI
```typescript
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${vehiculo.RI}`
```

### Opción 2: QR con URL del detalle (Recomendado)
```typescript
const detailUrl = `${window.location.origin}/vehiculo/${vehiculo.RI}`
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(detailUrl)}`
```

Guardá la URL generada en la columna `QR_URL` de la hoja VEHICULOS.

## Desarrollo Local

La aplicación incluye datos de demostración que se cargan automáticamente si Google Sheets no está configurado o no está disponible.

Para probar con datos de demostración:
1. Iniciá la aplicación sin configurar el `.env.local`
2. La app cargará 6 vehículos de ejemplo
3. Podrás navegar y probar todas las funcionalidades

Para conectar con Google Sheets:
1. Seguí la guía en [INSTALACION_GOOGLE_SHEETS.md](./INSTALACION_GOOGLE_SHEETS.md)
2. Configurá correctamente las variables de entorno
3. Verificá la conexión en la consola del navegador

## Seguridad

### Nivel Actual
- La API de Google Apps Script está configurada como pública
- Cualquiera con el link puede acceder
- No requiere autenticación adicional

### Mejoras Recomendadas para Producción

1. **Agregar autenticación por token:**
   - Ver sección "Permisos y Seguridad" en INSTALACION_GOOGLE_SHEETS.md

2. **Restricción por dominio:**
   - Limitar el acceso solo a usuarios de @municipalidad.gov.ar

3. **Auditoría:**
   - Todos los cambios ya se registran en HISTORIAL con usuario y fecha

## Límites y Consideraciones

### Límites de Google Apps Script (Cuenta Gratuita)
- **20,000 llamadas por día**
- **6 minutos** de tiempo de ejecución por ejecución
- **50 MB** de almacenamiento de properties

Si necesitás más capacidad, considerá:
- Migrar a Google Cloud Functions
- Usar Google Workspace con cuotas mayores
- Implementar caché en el frontend

## Tecnologías

- **Frontend:** Next.js 16, React 19, TypeScript
- **Estilos:** Tailwind CSS v4, shadcn/ui
- **Backend:** Google Apps Script
- **Base de datos:** Google Sheets
- **Almacenamiento de imágenes:** Google Drive (opcional)

## Estructura del Proyecto

```
/
├── app/                    # Páginas de Next.js
├── components/             # Componentes de React
│   ├── ui/                # Componentes de shadcn/ui
│   ├── header.tsx         # Header con login/logout
│   ├── login-form.tsx     # Formulario de login
│   ├── vehiculo-card.tsx  # Tarjeta de vehículo en listado
│   ├── vehiculo-detail.tsx # Vista detalle de vehículo
│   ├── vehiculo-edit-form.tsx # Formulario de edición
│   ├── vehiculos-filters.tsx # Filtros de búsqueda
│   └── vehiculos-list.tsx # Listado principal
├── contexts/              # Contextos de React
│   └── auth-context.tsx   # Contexto de autenticación
├── lib/                   # Utilidades
│   ├── api.ts            # Cliente de API (Google Sheets)
│   └── auth.ts           # Lógica de autenticación
├── google-apps-script/    # Backend de Google Apps Script
│   └── Code.gs           # API completa
├── public/               # Imágenes y assets estáticos
├── .env.local.example    # Ejemplo de variables de entorno
├── INSTALACION_GOOGLE_SHEETS.md # Guía de instalación completa
└── README.md            # Este archivo
```

## Soporte

Para problemas o consultas:
1. Revisá la [guía de instalación](./INSTALACION_GOOGLE_SHEETS.md)
2. Verificá la configuración de variables de entorno
3. Consultá los registros de Google Apps Script (Ver > Registros)
4. Contactá al equipo de desarrollo

## Licencia

Este proyecto es de uso interno de la Municipalidad.
