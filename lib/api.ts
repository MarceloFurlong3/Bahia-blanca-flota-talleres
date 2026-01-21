// Configuración de la API - Ahora apunta a la ruta local de Next.js
export const API_URL = "/api/google-script";

export interface Vehiculo {
  RI: string;
  Tipo: string;
  "Marca Modelo": string;
  Año: number;
  Patente: string;
  Dependencia: string;
  "Area Taller": string;
  Motivo: string;
  Estado: string;
  Suministros: string;
  Final_Resultado: string;
  Finalizado_Por: string;
  Finalizado_Fecha: string;
  Historial: string;
  Foto_URL: string;
  QR_URL: string;
}

export interface SuministroInfo {
  numero: string;
  descripcion: string;
  estado: "Terminado" | "Pendiente" | "Cancelado" | "Desconocido";
}

/**
 * Obtiene la lista completa de vehículos
 */
export async function fetchVehiculos(): Promise<Vehiculo[]> {
  try {
    const response = await fetch(`${API_URL}?action=getVehiculos`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map(v => ({
        ...v,
        Patente: v.Patente || "", 
        Historial: v.Historial || "" 
      }));
    }

    return [];
  } catch (error) {
    console.error("[v0] Error fetching vehiculos:", error);
    return getDemoData(); 
  }
}

/**
 * Obtiene el historial específico de un vehículo por su RI
 */
export async function fetchHistorialVehiculo(ri: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}?action=getHistorial&ri=${encodeURIComponent(ri)}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return "";

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return "";

    return data.map((entrada: any) => `${entrada.Fecha}: ${entrada.Accion} - ${entrada.Detalles}`).join("\n");
  } catch (error) {
    console.error("[v0] Error fetching historial:", error);
    return "";
  }
}

/**
 * Actualiza los datos de un vehículo (Estado, Área, Motivo, etc.)
 */
export async function updateVehiculo(ri: string, updates: Partial<Vehiculo>, usuario?: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      action: "updateVehiculo",
      ri: ri.trim(),
      usuario: usuario || "Sistema",
    });

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data && data.success === true;

  } catch (error) {
    console.error("ERROR CRÍTICO EN API.TS:", error);
    return false;
  }
}

/**
 * ACTUALIZA EL ESTADO EN LA PLANILLA DE TALLERES (Columna AB)
 */
export async function updateEstadoSuministro(ri: string, nroSuministro: string, nuevoEstado: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      action: "updateSuministroEstado",
      ri: ri,
      nroSuministro: nroSuministro,
      estado: nuevoEstado,
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);
    
    if (!response.ok) return false;

    const data = await response.json();
    return data && data.success === true;
  } catch (error) {
    console.error("Error actualizando suministro:", error);
    return false;
  }
}

/**
 * Finaliza el trabajo de un vehículo y lo marca como Operativo
 */
export async function finalizarVehiculo(
  ri: string,
  resultado: string,
  usuario: string,
  updates?: Partial<Vehiculo>,
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      action: "finalizarVehiculo",
      ri: ri,
      resultado: resultado,
      usuario: usuario,
    })

    if (updates) {
      Object.entries(updates).forEach(([key, value]) => {
        params.append(key, String(value))
      })
    }

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow",
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("[v0] Error finalizando vehiculo:", error)
    return false
  }
}

/**
 * Sube la imagen convirtiéndola a Base64 para el Script de Google
 */
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });

    const params = new URLSearchParams({
      action: "uploadImage",
      filename: file.name,
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify({ base64: base64 }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return data.success ? data.url : null;
  } catch (error) {
    console.error("💥 ERROR CRÍTICO en la subida:", error);
    return null;
  }
}

// --- UTILIDADES ---

export function parseSuministros(suministrosText: string): SuministroInfo[] {
  if (!suministrosText || suministrosText.trim() === "") return [];
  
  // Separamos por el divisor de pedidos "---" que pusimos en el script
  const bloques = suministrosText.split('\n---\n').filter(b => b.trim() !== "");
  const suministros: SuministroInfo[] = [];

  for (const bloque of bloques) {
    // Buscamos el formato "ID: Detalle (Estado)"
    // El detalle ahora puede contener saltos de línea (\s\S hace que el punto incluya saltos)
    const match = bloque.trim().match(/^(.+?):\s*([\s\S]+?)\s*\((.+?)\)$/);
    
    if (match) {
      const [, id, desc, est] = match;
      let estado: SuministroInfo["estado"] = "Pendiente";
      if (est.toLowerCase().includes("terminado")) estado = "Terminado";
      if (est.toLowerCase().includes("cancelado")) estado = "Cancelado";

      suministros.push({
        numero: id.trim(),
        descripcion: desc.trim(), // Aquí vendrá la lista: "5 filtros AL 65\n5 FILTROS rk90..."
        estado
      });
    }
  }
  return suministros;
}

export function puedeFinalizarVehiculo(suministrosText: string): { puede: boolean; requiereNota: boolean; motivo?: string } {
  const suministros = parseSuministros(suministrosText)
  if (suministros.length === 0) return { puede: true, requiereNota: false }
  
  const pendientes = suministros.filter((s) => s.estado === "Pendiente")
  if (pendientes.length > 0) {
    return {
      puede: true, 
      requiereNota: true, 
      motivo: `Hay suministros pendientes de finalizar. Se requerirá una nota de cierre.`,
    }
  }
  return { puede: true, requiereNota: false }
}

function getDemoData(): Vehiculo[] {
  return [
    {
      RI: "001",
      Tipo: "Camión",
      "Marca Modelo": "Mercedes-Benz Atego 1726",
      Año: 2019,
      Patente: "AB123CD",
      Dependencia: "Obras Públicas",
      "Area Taller": "viales",
      Motivo: "Mantenimiento preventivo",
      Estado: "en proceso",
      Suministros: "",
      Final_Resultado: "",
      Finalizado_Por: "",
      Finalizado_Fecha: "",
      Historial: "",
      Foto_URL: "",
      QR_URL: "",
    }
  ]
}