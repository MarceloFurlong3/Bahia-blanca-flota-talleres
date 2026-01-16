"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Car, LogOut, ShieldCheck } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Vehículos Municipales</h1>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground hidden sm:inline">{user.email}</span>
                {user.isAdmin && <ShieldCheck className="h-4 w-4 text-primary" />}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Salir</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
