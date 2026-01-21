"use client"

import { useState } from "react"
import type { Vehiculo } from "@/lib/api"
import { parseSuministros, type SuministroInfo, updateEstadoSuministro } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Car, FileText, MapPin, Wrench, AlertCircle, CheckCircle, Edit, Package, QrCode, History, Loader2, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner" // Asumo que usas sonner o similar para avisos

interface VehiculoDetailProps {
  vehiculo: Vehiculo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (vehiculo: Vehiculo) => void
}

const ESTADO_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Operativo: "default",
  Mantenimiento: "secondary",
  "Fuera de Servicio": "destructive",
  Taller: "outline",
}

const ESTADO_ICONS: Record<string, typeof CheckCircle> = {
  Operativo: CheckCircle,
  Mantenimiento: Wrench,
  "Fuera de Servicio": AlertCircle,
  Taller: Wrench,
}

const SUMINISTRO_ESTADO_COLORS: Record<SuministroInfo["estado"], "default" | "secondary" | "destructive" | "outline"> = {
  Terminado: "default",
  Cancelado: "secondary",
  Pendiente: "destructive",
  Desconocido: "outline",
}

export function VehiculoDetail({ vehiculo, open, onOpenChange, onEdit }: VehiculoDetailProps) {
  const { user } = useAuth()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  if (!vehiculo) return null

  const EstadoIcon = ESTADO_ICONS[vehiculo.Estado] || AlertCircle
  const suministros = parseSuministros(vehiculo.Suministros || "")

  // Función para rotar el estado del suministro
  const handleToggleEstado = async (nroSuministro: string, estadoActual: string) => {
    // Definimos el orden de rotación: Pendiente -> Terminado -> (podés agregar más)
    const nuevoEstado = estadoActual === "Terminado" ? "Pendiente" : "Terminado";
    
    setUpdatingId(nroSuministro);
    
    try {
      const success = await updateEstadoSuministro(vehiculo.RI, nroSuministro, nuevoEstado);
      
      if (success) {
        toast.success(`Suministro #${nroSuministro} actualizado a ${nuevoEstado}`);
        // Nota: Aquí lo ideal sería refrescar los datos globales, 
        // pero por ahora el usuario verá el cambio al reabrir o sincronizar.
      } else {
        toast.error("No se pudo actualizar el suministro");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="text-xl font-bold">{vehiculo["Marca Modelo"]}</span>
            {user?.isAdmin && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(vehiculo)
                }}
                className="ml-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Foto principal */}
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {vehiculo.Foto_URL && vehiculo.Foto_URL.startsWith('http') ? (
              <Image
                src={vehiculo.Foto_URL}
                alt={`Vehículo ${vehiculo.Patente}`}
                fill
                className="object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <Car className="h-20 w-20 text-muted-foreground" />
            )}
          </div>

          {/* Info General */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Car className="h-5 w-5" /> Información General</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">RI</p><p className="text-base font-semibold">{vehiculo.RI}</p></div>
                <div><p className="text-sm text-muted-foreground">Patente</p><p className="text-base font-semibold">{vehiculo.Patente}</p></div>
              </div>
              <Separator />
              <div><Badge variant={ESTADO_COLORS[vehiculo.Estado] || "default"}>{vehiculo.Estado}</Badge></div>
            </CardContent>
          </Card>

          {/* SECCIÓN DE SUMINISTROS INTERACTIVA */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Suministros (Gestión AB)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suministros.length > 0 ? (
                <div className="space-y-3">
                  {suministros.map((suministro, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-md border shadow-sm"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          <span className="text-muted-foreground">#{suministro.numero}</span> {suministro.descripcion}
                        </p>
                      </div>
                      
                      {/* BOTÓN INTERACTIVO PARA CAMBIAR ESTADO */}
                      <Button
                        size="sm"
                        variant={suministro.estado === "Terminado" ? "default" : "outline"}
                        disabled={updatingId === suministro.numero}
                        onClick={() => handleToggleEstado(suministro.numero, suministro.estado)}
                        className="min-w-[110px]"
                      >
                        {updatingId === suministro.numero ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {suministro.estado === "Terminado" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            {suministro.estado}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Sin suministros registrados.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial */}
          {vehiculo.Historial && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Historial</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-line">{vehiculo.Historial}</div>
              </CardContent>
            </Card>
          )}

          {/* QR */}
          {vehiculo.QR_URL && (
            <Card>
              <CardContent className="flex justify-center p-6">
                <Image src={vehiculo.QR_URL} alt="QR" width={150} height={150} className="bg-white p-2 rounded-lg border" />
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}