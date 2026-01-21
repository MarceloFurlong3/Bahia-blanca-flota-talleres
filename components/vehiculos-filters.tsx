"use client"

import { Search, Package } from "lucide-react" // Importamos Package
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VehiculosFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  estadoFilter: string
  onEstadoChange: (value: string) => void
  areaFilter: string
  onAreaChange: (value: string) => void
  estados: string[]
  areas: string[]
  isSuministrosFilterActive?: boolean // Agregamos la prop para evitar el error TS(2322)
}

export function VehiculosFilters({
  searchTerm,
  onSearchChange,
  estadoFilter,
  onEstadoChange,
  areaFilter,
  onAreaChange,
  estados,
  areas,
}: VehiculosFiltersProps) {
  
  // Filtramos para obtener solo las áreas de trabajo internas del taller
  const areasInternasTaller = areas.filter(
    (area) => 
      area.toLowerCase() !== "en funcionamiento" && 
      area.toLowerCase() !== "fuera de servicio"
  )

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Buscar
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar por RI, Marca o Patente..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estado" className="text-sm font-medium">
            Estado
          </Label>
          <Select value={estadoFilter} onValueChange={onEstadoChange}>
            <SelectTrigger id="estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              
              {/* --- OPCIÓN ESPECIAL DE SUMINISTROS --- */}
              <SelectItem value="con_suministros" className="font-medium text-amber-600">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  📦 Con Suministros
                </div>
              </SelectItem>
              
              <div className="h-px bg-muted my-1" />

              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="area" className="text-sm font-medium">
            Ubicación / Área Taller
          </Label>
          <Select value={areaFilter} onValueChange={onAreaChange}>
            <SelectTrigger id="area">
              <SelectValue placeholder="Todas las áreas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🏠 TODAS LAS ÁREAS (En Taller)</SelectItem>
              
              <SelectItem value="En funcionamiento">✅ En funcionamiento (Fuera de Taller)</SelectItem>
              
              <div className="h-px bg-muted my-1" />
              
              {areasInternasTaller.map((area) => (
                <SelectItem key={area} value={area}>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </SelectItem>
              ))}
              
              <SelectItem value="Fuera de servicio">⚠️ Fuera de servicio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}