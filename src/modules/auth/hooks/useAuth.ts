import { useCallback } from 'react'
import { useSession } from '@/core/hooks/useSession'
import { authService } from '../services/auth.service'
import type { Credentials, SignUpData } from '../types'

/** API de autenticación para la UI: estado de sesión + acciones. */
export function useAuth() {
  const { session, user, loading } = useSession()

  const signIn = useCallback(
    (credentials: Credentials) => authService.signInWithPassword(credentials),
    [],
  )
  const signUp = useCallback(
    (datos: SignUpData) => authService.signUp(datos),
    [],
  )
  const resetPassword = useCallback(
    (email: string) => authService.resetPassword(email),
    [],
  )
  const updatePassword = useCallback(
    (password: string) => authService.updatePassword(password),
    [],
  )
  const updateProfile = useCallback(
    (metadata: {
      nombre?: string
      cargo?: string
      fotoPerfil?: string
      telefono?: string
      cedula?: string
      titulo?: string
      [key: string]: unknown
    }) => authService.updateProfile(metadata),
    [],
  )
  const signOut = useCallback(() => authService.signOut(), [])

  return {
    session,
    user,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    updateProfile,
    signOut,
  }
}
