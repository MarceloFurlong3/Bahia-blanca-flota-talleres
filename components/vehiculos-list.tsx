"use client"

import { useState, useMemo } from "react"
import type { Vehiculo } from "@/lib/api"
import { VehiculoCard } from "./vehiculo-card"
import { VehiculosFilters } from "./vehiculos-filters"
import { AlertCircle, Package } from "lucide-react" // Importamos Package para el indicador extra

interface VehiculosListProps {
  vehiculos: Vehiculo[]
  onVehiculoClick: (vehiculo: Vehiculo) => void
}

export function VehiculosList({ vehiculos, onVehiculoClick }: VehiculosListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")

  // Extraer valores únicos para filtros
  const estados = useMemo(() => {
    return Array.from(new Set(vehiculos.map((v) => v.Estado)))
      .filter(Boolean)
      .sort()
  }, [vehiculos])

  const areas = useMemo(() => {
    return Array.from(new Set(vehiculos.map((v) => v["Area Taller"])))
      .filter(Boolean)
      .sort()
  }, [vehiculos])

  // Filtrar vehículos
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      // 1. Búsqueda por RI, Marca/Modelo y Patente
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        vehiculo.RI.toLowerCase().includes(searchLower) ||
        vehiculo["Marca Modelo"].toLowerCase().includes(searchLower) ||
        vehiculo.Patente?.toLowerCase().includes(searchLower)

      // 2. Filtro por estado + NUEVA LÓGICA DE SUMINISTROS
      let matchesEstado = false
      if (estadoFilter === "all") {
        matchesEstado = true
      } else if (estadoFilter === "con_suministros") {
        // Verifica si tiene texto en la columna Suministros (Columna J)
        matchesEstado = !!(vehiculo.Suministros && vehiculo.Suministros.trim().length > 0)
      } else {
        matchesEstado = vehiculo.Estado === estadoFilter
      }

      // 3. Lógica de área: "all" excluye "En funcionamiento"
      let matchesArea = false
      if (areaFilter === "all") {
        matchesArea = vehiculo["Area Taller"].toLowerCase() !== "en funcionamiento"
      } else {
        matchesArea = vehiculo["Area Taller"] === areaFilter
      }

      return matchesSearch && matchesEstado && matchesArea
    })
  }, [vehiculos, searchTerm, estadoFilter, areaFilter])

  return (
    <div className="space-y-6">
      {/* Nota: Para que aparezca en el selector, debés agregar manualmente 
          <SelectItem value="con_suministros">📦 Con Suministros</SelectItem>
          dentro de tu componente VehiculosFilters.tsx
      */}
      <VehiculosFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
        areaFilter={areaFilter}
        onAreaChange={setAreaFilter}
        estados={estados}
        areas={areas}
        // Pasamos una flag si el filtro de suministros está activo para el mensaje
        isSuministrosFilterActive={estadoFilter === "con_suministros"} 
      />

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredVehiculos.length} de {vehiculos.length} vehículos 
            {areaFilter === "all" && " en taller"}
          </p>
          
          {/* Visual Extra: Indicador de filtro activo */}
          {estadoFilter === "con_suministros" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <Package className="h-3 w-3" />
              Filtrado por suministros
            </span>
          )}
        </div>

        {filteredVehiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron vehículos</h3>
            <p className="text-sm text-muted-foreground">
              {estadoFilter === "con_suministros" 
                ? "No hay vehículos con pedidos de suministros cargados." 
                : "Probá ajustando los filtros o la patente"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVehiculos.map((vehiculo) => (
              <VehiculoCard 
                key={vehiculo.RI} 
                vehiculo={vehiculo} 
                onClick={() => onVehiculoClick(vehiculo)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}