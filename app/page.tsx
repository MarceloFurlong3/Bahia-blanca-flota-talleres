"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { VehiculosList } from "@/components/vehiculos-list"
import { VehiculoDetail } from "@/components/vehiculo-detail"
import { VehiculoEditForm } from "@/components/vehiculo-edit-form"
import { fetchVehiculos, updateVehiculo, type Vehiculo } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, login, isAuthenticated } = useAuth()
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadVehiculos()
    }
  }, [isAuthenticated])

  const loadVehiculos = () => {
    setLoading(true)
    fetchVehiculos()
      .then(setVehiculos)
      .finally(() => setLoading(false))
  }

  const handleVehiculoClick = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setDetailOpen(true)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo)
    setEditOpen(true)
  }

  const handleSave = async (ri: string, updates: Partial<Vehiculo>) => {
    const success = await updateVehiculo(ri, updates)
    if (success) {
      // Recargar la lista de vehículos
      loadVehiculos()
      // Actualizar el vehículo seleccionado
      if (selectedVehiculo) {
        setSelectedVehiculo({ ...selectedVehiculo, ...updates })
      }
    }
    return success
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-6 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <VehiculosList vehiculos={vehiculos} onVehiculoClick={handleVehiculoClick} />
        )}
      </main>

      <VehiculoDetail vehiculo={selectedVehiculo} open={detailOpen} onOpenChange={setDetailOpen} onEdit={handleEdit} />

      <VehiculoEditForm vehiculo={selectedVehiculo} open={editOpen} onOpenChange={setEditOpen} onSave={handleSave} />
    </div>
  )
}
