import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/core/supabase/client'
import { env } from '@/core/config/env'

export const DEV_SESSION_KEY = 'sd:dev-auth-user'
export const DEV_LOGGED_OUT_KEY = 'sd:dev-logged-out'

// Usuario ficticio inicial para desarrollo local (Carlos G. · Arquitecto)
const DEV_DEFAULT_USER = {
  id: 'cg',
  email: 'carlos@sd.dev',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: { nombre: 'Carlos G.', rol: 'Arquitecto' },
  created_at: new Date().toISOString(),
} as unknown as User

interface UseSessionResult {
  session: Session | null
  user: User | null
  loading: boolean
}

/**
 * Observa la sesión de autenticación en tiempo real.
 * Soporta tanto Supabase Auth real como la sesión interactiva en modo desarrollo.
 */
export function useSession(): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null)
  const [devUser, setDevUser] = useState<User | null>(() => {
    if (!env.authBypass || typeof window === 'undefined') return null
    if (localStorage.getItem(DEV_LOGGED_OUT_KEY) === '1') return null
    try {
      const stored = localStorage.getItem(DEV_SESSION_KEY)
      if (stored) return JSON.parse(stored) as User
    } catch {
      /* sin almacenamiento */
    }
    // Sesión inicial por defecto al arrancar el entorno de desarrollo
    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(DEV_DEFAULT_USER))
    return DEV_DEFAULT_USER
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    const onDevAuthChange = () => {
      if (localStorage.getItem(DEV_LOGGED_OUT_KEY) === '1') {
        setDevUser(null)
      } else {
        try {
          const stored = localStorage.getItem(DEV_SESSION_KEY)
          setDevUser(stored ? (JSON.parse(stored) as User) : null)
        } catch {
          setDevUser(null)
        }
      }
    }
    window.addEventListener('sd:auth-change', onDevAuthChange)

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
      window.removeEventListener('sd:auth-change', onDevAuthChange)
    }
  }, [])

  const user = session?.user ?? (env.authBypass ? devUser : null)
  return { session, user, loading }
}
