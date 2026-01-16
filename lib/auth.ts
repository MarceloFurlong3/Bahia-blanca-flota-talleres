// Sistema de autenticación basado en email
// Los administradores se definen por su email

const ADMIN_EMAILS = [
  "admin@municipalidad.gov.ar",
  // Agregar más emails de administradores aquí
]

export interface User {
  email: string
  isAdmin: boolean
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export function createUser(email: string): User {
  return {
    email,
    isAdmin: isAdminEmail(email),
  }
}
