"use client"

import type React from "react"
import { useState } from "react"
import type { Vehiculo } from "@/lib/api"
import { uploadImage, parseSuministros, puedeFinalizarVehiculo, type SuministroInfo } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, CheckCircle, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VehiculoEditFormProps {
  vehiculo: Vehiculo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (ri: string, updates: Partial<Vehiculo>) => Promise<boolean>
}

// ESTADOS CORREGIDOS: Deben coincidir con la validación de datos de tu Google Sheets
const ESTADOS_DISPONIBLES = ["reparado", "pendiente", "en proceso"]

// ÁREAS TALLER: Asegúrate que estos valores también existan en tus listas desplegables de Sheets
const AREAS_TALLER = [
  "viales",
  "torneria",
  "liviana",
  "engrase",
  "carpinteria",
  "gomeria",
  "electromecanica",
  "pesada",
  "patio",
  "soldadura",
  "proveedor",
  "En funcionamiento",
  "Fuera de servicio"
]

const SUMINISTRO_ESTADO_COLORS: Record<SuministroInfo["estado"], "default" | "secondary" | "destructive" | "outline"> =
  {
    Terminado: "default",
    Cancelado: "secondary",
    Pendiente: "destructive",
    Desconocido: "outline",
  }

export function VehiculoEditForm({ vehiculo, open, onOpenChange, onSave }: VehiculoEditFormProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Vehiculo>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [finalResultado, setFinalResultado] = useState("")

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && vehiculo) {
      setFormData({
        Estado: vehiculo.Estado,
        Motivo: vehiculo.Motivo,
        "Area Taller": vehiculo["Area Taller"],
        Foto_URL: vehiculo.Foto_URL,
      })
      setPreviewImage(vehiculo.Foto_URL || null)
      setSelectedFile(null)
      setShowFinalizeDialog(false)
      setFinalResultado("")
    } else {
      setFormData({})
      setPreviewImage(null)
      setSelectedFile(null)
      setShowFinalizeDialog(false)
      setFinalResultado("")
    }
    onOpenChange(isOpen)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Por favor seleccioná un archivo de imagen válido",
          variant: "destructive",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no puede superar los 5MB",
          variant: "destructive",
        })
        return
      }

      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)
      setSelectedFile(file)

      toast({
        title: "Imagen seleccionada",
        description: "La imagen se subirá al guardar los cambios",
      })
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setSelectedFile(null)
    setFormData((prev) => ({ ...prev, Foto_URL: "" }))
  }

  const handleFinalize = async () => {
    if (!vehiculo || !finalResultado.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un resultado para finalizar el vehículo",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const userEmail = user?.email || "usuario@municipalidad.gov.ar"
      let uploadedUrl: string | null = null

      if (selectedFile) {
        uploadedUrl = await uploadImage(selectedFile)
      }

      const additionalUpdates: Partial<Vehiculo> = { ...formData }
      if (uploadedUrl) {
        additionalUpdates.Foto_URL = uploadedUrl
      }

      const { finalizarVehiculo } = await import("@/lib/api")
      const success = await finalizarVehiculo(vehiculo.RI, finalResultado, userEmail, additionalUpdates)

      if (success) {
        toast({
          title: "Vehículo finalizado",
          description: "El vehículo se finalizó correctamente",
        })
        handleOpen(false)
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: "No se pudo finalizar el vehículo. Verificá los datos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error finalizing vehiculo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al finalizar el vehículo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowFinalizeDialog(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehiculo) return

    setLoading(true)

    try {
      const finalFormData = { ...formData }

      if (selectedFile) {
        toast({
          title: "Subiendo imagen...",
          description: "Por favor esperá mientras se sube la imagen",
        })

        const uploadedUrl = await uploadImage(selectedFile)

        if (uploadedUrl) {
          finalFormData.Foto_URL = uploadedUrl
        }
      }

      const success = await onSave(vehiculo.RI, finalFormData)

      if (success) {
        toast({
          title: "Cambios guardados",
          description: "El vehículo se actualizó correctamente",
        })
        handleOpen(false)
      } else {
        toast({
          title: "Error de validación",
          description: "Google Sheets rechazó el cambio. Verificá que el Estado y Área sean válidos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!vehiculo) return null

  const suministros = parseSuministros(vehiculo.Suministros || "")
  const validacionFinalizacion = puedeFinalizarVehiculo(vehiculo.Suministros || "")
  const puedeFinalizarPorSuministros = validacionFinalizacion.puede

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Vehículo - {vehiculo["Marca Modelo"]} ({vehiculo.Patente})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {vehiculo.Final_Resultado && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-primary">Vehículo Finalizado</p>
                    <p className="text-sm mt-1">{vehiculo.Final_Resultado}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Por: {vehiculo.Finalizado_Por} | Fecha:{" "}
                      {new Date(vehiculo.Finalizado_Fecha).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Foto del Vehículo</Label>
              {previewImage ? (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Subir foto del vehículo</p>
                  <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("photo")?.click()}
                  >
                    Seleccionar imagen
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.Estado || vehiculo.Estado}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, Estado: value }))}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_DISPONIBLES.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área Taller *</Label>
              <Select
                value={formData["Area Taller"] ?? vehiculo["Area Taller"]}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, "Area Taller": value }))}
              >
                <SelectTrigger id="area">
                  <SelectValue placeholder="Seleccione un área..." />
                </SelectTrigger>
                <SelectContent>
                  {AREAS_TALLER.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                rows={3}
                value={formData.Motivo ?? vehiculo.Motivo}
                onChange={(e) => setFormData((prev) => ({ ...prev, Motivo: e.target.value }))}
                placeholder="Describe el motivo o la situación del vehículo..."
              />
            </div>

            {vehiculo.Suministros && (
              <div className="space-y-2">
                <Label>Suministros (Solo lectura)</Label>
                {suministros.length > 0 ? (
                  <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                    {suministros.map((suministro, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 p-2 bg-background rounded-md border"
                      >
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium text-muted-foreground">#{suministro.numero}</span>{" "}
                            {suministro.descripcion}
                          </p>
                        </div>
                        <Badge variant={SUMINISTRO_ESTADO_COLORS[suministro.estado]} className="shrink-0">
                          {suministro.estado}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted p-3 rounded-md border">
                    <p className="text-sm whitespace-pre-line text-muted-foreground">{vehiculo.Suministros}</p>
                  </div>
                )}
              </div>
            )}

            {!puedeFinalizarPorSuministros && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>No se puede finalizar:</strong> {validacionFinalizacion.motivo}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => setShowFinalizeDialog(true)}
                disabled={loading || !!vehiculo.Final_Resultado || !puedeFinalizarPorSuministros}
                className="bg-primary"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar Vehículo
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Vehículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Estás por finalizar el vehículo{" "}
              <strong>
                {vehiculo["Marca Modelo"]} ({vehiculo.Patente})
              </strong>
              . Esta acción agregará una entrada en el historial del vehículo.
            </p>
            <div className="space-y-2">
              <Label htmlFor="final-resultado">Resultado de la Finalización *</Label>
              <Textarea
                id="final-resultado"
                rows={4}
                value={finalResultado}
                onChange={(e) => setFinalResultado(e.target.value)}
                placeholder="Describe el resultado final del trabajo realizado..."
                className="resize-none"
              />
            </div>
            <div className="bg-muted p-3 rounded-md text-xs space-y-1">
              <p><strong>Usuario:</strong> {user?.email || "usuario@municipalidad.gov.ar"}</p>
              <p><strong>Fecha:</strong> {new Date().toLocaleDateString("es-AR")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowFinalizeDialog(false)
                setFinalResultado("")
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleFinalize} disabled={loading || !finalResultado.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Finalización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}