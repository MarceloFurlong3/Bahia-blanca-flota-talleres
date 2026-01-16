// Configuración de la API - Ahora apunta a la ruta local de Next.js
export const API_URL = "/api/google-script";

console.log("Conectando a API vía Proxy:", API_URL);

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

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "uploadImage",
      filename: file.name,
    })
    const response = await fetch(`${API_URL}?${params.toString()}`)
    const data = await response.json()
    return data.url || null
  } catch (error) {
    return null
  }
}

export interface SuministroInfo {
  numero: string
  descripcion: string
  estado: "Terminado" | "Pendiente" | "Cancelado" | "Desconocido"
}

export function parseSuministros(suministrosText: string): SuministroInfo[] {
  if (!suministrosText || suministrosText.trim() === "") return []
  const lineas = suministrosText.split("\n").filter((linea) => linea.trim() !== "")
  const suministros: SuministroInfo[] = []

  for (const linea of lineas) {
    const match = linea.match(/^(\d+):\s*(.+?)\s*\((.+?)\)\s*$/)
    if (match) {
      const [, numero, descripcion, estadoText] = match
      let estado: SuministroInfo["estado"] = "Desconocido"
      const estadoLower = estadoText.toLowerCase().trim()
      if (estadoLower === "terminado" || estadoLower === "completado") estado = "Terminado"
      else if (estadoLower === "pendiente" || estadoLower === "en proceso") estado = "Pendiente"
      else if (estadoLower === "cancelado") estado = "Cancelado"

      suministros.push({ numero, descripcion: descripcion.trim(), estado })
    }
  }
  return suministros
}

export function puedeFinalizarVehiculo(suministrosText: string): { puede: boolean; motivo?: string } {
  const suministros = parseSuministros(suministrosText)
  if (suministros.length === 0) return { puede: true }
  const pendientes = suministros.filter((s) => s.estado === "Pendiente")
  if (pendientes.length > 0) {
    return {
      puede: false,
      motivo: `Hay ${pendientes.length} ${pendientes.length === 1 ? "suministro pendiente" : "suministros pendientes"}`,
    }
  }
  return { puede: true }
}

// Función que faltaba
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