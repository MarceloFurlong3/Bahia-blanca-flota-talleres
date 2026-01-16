"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, createUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedEmail = localStorage.getItem("userEmail")
    if (savedEmail) {
      setUser(createUser(savedEmail))
    }
  }, [])

  const login = (email: string) => {
    const newUser = createUser(email)
    setUser(newUser)
    localStorage.setItem("userEmail", email)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("userEmail")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
