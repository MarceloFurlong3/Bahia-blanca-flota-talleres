"use client"

import type { Vehiculo } from "@/lib/api"
import { parseSuministros, type SuministroInfo } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Car, FileText, MapPin, Wrench, AlertCircle, CheckCircle, Edit, Package, QrCode, History } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

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

const SUMINISTRO_ESTADO_COLORS: Record<SuministroInfo["estado"], "default" | "secondary" | "destructive" | "outline"> =
  {
    Terminado: "default",
    Cancelado: "secondary",
    Pendiente: "destructive",
    Desconocido: "outline",
  }

export function VehiculoDetail({ vehiculo, open, onOpenChange, onEdit }: VehiculoDetailProps) {
  const { user } = useAuth()

  if (!vehiculo) return null

  const EstadoIcon = ESTADO_ICONS[vehiculo.Estado] || AlertCircle
  const suministros = parseSuministros(vehiculo.Suministros || "")

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
          {/* Foto principal del vehículo */}
          {vehiculo.Foto_URL && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
              <Image
                src={vehiculo.Foto_URL || "/placeholder.svg"}
                alt={`Vehículo ${vehiculo.Patente}`}
                fill
                className="object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RI</p>
                  <p className="text-base font-semibold">{vehiculo.RI}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Patente</p>
                  <p className="text-base font-semibold">{vehiculo.Patente}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-base">{vehiculo.Tipo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Año</p>
                  <p className="text-base">{vehiculo.Año}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <EstadoIcon className="h-4 w-4" />
                  <Badge variant={ESTADO_COLORS[vehiculo.Estado] || "default"}>{vehiculo.Estado}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ubicación y Área */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Área
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dependencia</p>
                <p className="text-base">{vehiculo.Dependencia}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Área Taller</p>
                <p className="text-base">{vehiculo["Area Taller"]}</p>
              </div>
            </CardContent>
          </Card>

          {/* Motivo */}
          {vehiculo.Motivo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motivo</p>
                  <p className="text-base">{vehiculo.Motivo}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Finalización */}
          {vehiculo.Final_Resultado && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <CheckCircle className="h-5 w-5" />
                  Vehículo Finalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resultado</p>
                  <p className="text-base">{vehiculo.Final_Resultado}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Finalizado Por</p>
                    <p className="text-sm">{vehiculo.Finalizado_Por}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Finalización</p>
                    <p className="text-sm">{new Date(vehiculo.Finalizado_Fecha).toLocaleDateString("es-AR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial del Vehículo */}
          {vehiculo.Historial && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm whitespace-pre-line font-mono leading-relaxed">{vehiculo.Historial}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {vehiculo.Suministros && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Suministros (Solo lectura)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suministros.length > 0 ? (
                  <div className="space-y-3">
                    {suministros.map((suministro, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-md border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            <span className="text-muted-foreground">#{suministro.numero}</span> {suministro.descripcion}
                          </p>
                        </div>
                        <Badge variant={SUMINISTRO_ESTADO_COLORS[suministro.estado]} className="shrink-0">
                          {suministro.estado}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm whitespace-pre-line text-muted-foreground">{vehiculo.Suministros}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Código QR */}
          {vehiculo.QR_URL && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Código QR del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-white p-2">
                  <Image
                    src={vehiculo.QR_URL || "/placeholder.svg"}
                    alt={`QR del vehículo ${vehiculo.Patente}`}
                    fill
                    className="object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
