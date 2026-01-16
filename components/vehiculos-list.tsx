"use client"

import { useState, useMemo } from "react"
import type { Vehiculo } from "@/lib/api"
import { VehiculoCard } from "./vehiculo-card"
import { VehiculosFilters } from "./vehiculos-filters"
import { AlertCircle } from "lucide-react"

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

  // Filtrar vehículos con búsqueda por Patente y lógica de taller
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      // 1. Búsqueda por RI, Marca/Modelo y ahora PATENTE
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        vehiculo.RI.toLowerCase().includes(searchLower) ||
        vehiculo["Marca Modelo"].toLowerCase().includes(searchLower) ||
        // Agregamos búsqueda por patente (usamos ?. por seguridad si el campo está vacío)
        vehiculo.Patente?.toLowerCase().includes(searchLower)

      // 2. Filtro por estado
      const matchesEstado = estadoFilter === "all" || vehiculo.Estado === estadoFilter

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
      <VehiculosFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        estadoFilter={estadoFilter}
        onEstadoChange={setEstadoFilter}
        areaFilter={areaFilter}
        onAreaChange={setAreaFilter}
        estados={estados}
        areas={areas}
      />

      {/* Resultados */}
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Mostrando {filteredVehiculos.length} de {vehiculos.length} vehículos 
          {areaFilter === "all" && " en taller"}
        </p>

        {filteredVehiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron vehículos</h3>
            <p className="text-sm text-muted-foreground">Probá ajustando los filtros o la patente</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVehiculos.map((vehiculo) => (
              <VehiculoCard key={vehiculo.RI} vehiculo={vehiculo} onClick={() => onVehiculoClick(vehiculo)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}