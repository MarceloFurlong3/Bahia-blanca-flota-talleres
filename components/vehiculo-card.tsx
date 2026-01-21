"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Vehiculo } from "@/lib/api"
import { Calendar, Car, FileText, MapPin, Package } from "lucide-react" // Importamos Package
import Image from "next/image"

interface VehiculoCardProps {
  vehiculo: Vehiculo
  onClick: () => void
}

const ESTADO_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  reparado: "default",
  Mantenimiento: "secondary",
  "Fuera de Servicio": "destructive",
  Taller: "outline",
}

export function VehiculoCard({ vehiculo, onClick }: VehiculoCardProps) {
  // Verificamos si tiene suministros cargados
  const tieneSuministros = !!(vehiculo.Suministros && vehiculo.Suministros.trim() !== "");

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Foto del vehículo */}
          <div className="flex-shrink-0">
            {vehiculo.Foto_URL ? (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {vehiculo.Foto_URL && vehiculo.Foto_URL.startsWith('http') ? (
                  <Image
                    src={vehiculo.Foto_URL}
                    alt={`Vehículo ${vehiculo.Patente}`}
                    fill
                    className="object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Car className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-muted flex items-center justify-center">
                <Car className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Información del vehículo */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate">{vehiculo["Marca Modelo"]}</h3>
                <p className="text-sm text-muted-foreground">
                  {vehiculo.Patente} • RI: {vehiculo.RI}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={ESTADO_COLORS[vehiculo.Estado] || "default"}>{vehiculo.Estado}</Badge>
                
                {/* INDICADOR VISUAL DE SUMINISTROS */}
                {tieneSuministros && (
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px] font-bold animate-pulse shadow-sm">
                    <Package className="h-3.5 w-3.5" />
                    SUMINISTROS
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{vehiculo.Dependencia}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{vehiculo["Area Taller"]}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {vehiculo.Año} • {vehiculo.Tipo}
                </span>
              </div>
            </div>

            {vehiculo.Motivo && <p className="text-sm text-muted-foreground line-clamp-2 italic">{vehiculo.Motivo}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}