"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Vehiculo } from "@/lib/api"
import { Calendar, Car, FileText, MapPin, Package } from "lucide-react"
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
  const tieneSuministros = !!(vehiculo.Suministros && vehiculo.Suministros.trim() !== "");

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border-muted/60 bg-card"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Foto del vehículo - Ajustada para móvil */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border/50">
              {vehiculo.Foto_URL && vehiculo.Foto_URL.startsWith('http') ? (
                <Image
                  src={vehiculo.Foto_URL}
                  alt={`Vehículo ${vehiculo.Patente}`}
                  fill
                  className="object-cover"
                  crossOrigin="anonymous"
                  sizes="(max-width: 640px) 80px, 128px"
                />
              ) : (
                <Car className="h-8 w-8 sm:h-12 sm:h-12 text-muted-foreground/60" />
              )}
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg leading-tight truncate text-card-foreground">
                    {vehiculo["Marca Modelo"]}
                  </h3>
                  <p className="text-[11px] sm:text-sm font-medium text-muted-foreground mt-0.5">
                    {vehiculo.Patente} <span className="mx-1 opacity-50">•</span> RI: {vehiculo.RI}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <Badge 
                    variant={ESTADO_COLORS[vehiculo.Estado] || "default"}
                    className="text-[9px] sm:text-xs px-1.5 py-0 h-5 sm:h-6"
                  >
                    {vehiculo.Estado}
                  </Badge>
                  
                  {tieneSuministros && (
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50 text-[9px] font-bold animate-pulse shadow-sm">
                      <Package className="h-3 w-3" />
                      <span className="hidden sm:inline">SUMINISTROS</span>
                      <span className="sm:hidden">PEDIDO</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Iconos de info - Más compactos en móvil */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary/70" />
                  <span className="text-[11px] sm:text-sm truncate font-medium">{vehiculo.Dependencia}</span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary/70" />
                  <span className="text-[11px] sm:text-sm truncate font-medium">{vehiculo["Area Taller"]}</span>
                </div>
              </div>
            </div>

            {/* Motivo - Solo se ve si existe, limitado a 1 línea en móvil */}
            {vehiculo.Motivo && (
              <p className="text-[10px] sm:text-sm text-muted-foreground/80 line-clamp-1 italic mt-1 border-l-2 border-primary/20 pl-2">
                {vehiculo.Motivo}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}