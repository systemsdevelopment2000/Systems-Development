import { supabase } from '@/core/supabase/client'
import { env } from '@/core/config/env'
import { DEV_SESSION_KEY, DEV_LOGGED_OUT_KEY } from '@/core/hooks/useSession'
import type { Credentials, SignUpData } from '../types'
import type { User } from '@supabase/supabase-js'

/** Operaciones de autenticación (compatibles con Supabase Auth y bypass de desarrollo). */
export const authService = {
  async signInWithPassword({ email, password }: Credentials) {
    if (env.authBypass) {
      const emailNormalizado = email.trim().toLowerCase()
      let nombre = email.split('@')[0]
      let rol = 'Colaborador'
      let id = 'usr_' + Math.random().toString(36).slice(2, 9)
      let fotoPerfil: string | undefined = undefined

      try {
        const sdDatos = localStorage.getItem('sd:datos')
        if (sdDatos) {
          const parsed = JSON.parse(sdDatos)
          const colabs = parsed?.datos?.colaboradores || {}
          const colab = Object.values(colabs).find(
            (c: unknown) => {
              const co = c as { contacto?: { correo?: string } }
              return co.contacto?.correo?.toLowerCase() === emailNormalizado
            }
          ) as { id: string; nombre: string; rol?: string; titulo?: string; fotoPerfil?: string; rolSistema?: string } | undefined
          if (colab) {
            id = colab.id
            nombre = colab.nombre
            rol = colab.rol || colab.titulo || (colab.rolSistema === 'admin' ? 'Administrador' : 'Colaborador')
            fotoPerfil = colab.fotoPerfil
          }
        }
      } catch {
        /* sin almacenamiento */
      }

      const devUser = {
        id,
        email: email.trim(),
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {
          nombre,
          rol,
          fotoPerfil,
        },
        created_at: new Date().toISOString(),
      } as unknown as User

      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(devUser))
      localStorage.removeItem(DEV_LOGGED_OUT_KEY)
      window.dispatchEvent(new Event('sd:auth-change'))
      return { user: devUser, session: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUp({ email, password, nombre, cargo }: SignUpData) {
    if (env.authBypass) {
      const id = 'usr_' + Math.random().toString(36).slice(2, 9)
      const devUser = {
        id,
        email: email.trim(),
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {
          nombre,
          rol: cargo || 'Colaborador',
        },
        created_at: new Date().toISOString(),
      } as unknown as User

      try {
        const sdDatos = localStorage.getItem('sd:datos')
        if (sdDatos) {
          const parsed = JSON.parse(sdDatos)
          parsed.datos = parsed.datos || {}
          parsed.datos.colaboradores = parsed.datos.colaboradores || {}
          parsed.datos.colaboradores[id] = {
            id,
            nombre: nombre.trim(),
            rol: cargo || 'Colaborador',
            contacto: { correo: email.trim(), medio: 'whatsapp' },
            activo: true,
            esUsuario: true,
            rolSistema: 'editor',
            creadoEn: new Date().toISOString().slice(0, 10),
          }
          localStorage.setItem('sd:datos', JSON.stringify(parsed))
        }
      } catch {
        /* sin almacenamiento */
      }

      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(devUser))
      localStorage.removeItem(DEV_LOGGED_OUT_KEY)
      window.dispatchEvent(new Event('sd:auth-change'))
      return { user: devUser, session: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          cargo,
        },
      },
    })
    if (error) throw error
    return data
  },

  async resetPassword(email: string) {
    if (env.authBypass) {
      return { data: { message: 'Enlace enviado correctamente en modo desarrollo' } }
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
    })
    if (error) throw error
    return data
  },

  async updatePassword(password: string) {
    if (env.authBypass) {
      return { data: { message: 'Contraseña actualizada en modo desarrollo' } }
    }
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return data
  },

  async updateProfile(metadata: {
    nombre?: string
    cargo?: string
    fotoPerfil?: string
    telefono?: string
    cedula?: string
    titulo?: string
    [key: string]: unknown
  }) {
    if (env.authBypass) {
      try {
        const stored = localStorage.getItem(DEV_SESSION_KEY)
        if (stored) {
          const u = JSON.parse(stored) as User
          const updated = {
            ...u,
            user_metadata: { ...u.user_metadata, ...metadata },
          }
          localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(updated))
          window.dispatchEvent(new Event('sd:auth-change'))
          return { user: updated }
        }
      } catch {
        /* sin almacenamiento */
      }
      return { user: null }
    }

    const { data, error } = await supabase.auth.updateUser({ data: metadata })
    if (error) throw error
    return data
  },

  async signOut() {
    localStorage.removeItem(DEV_SESSION_KEY)
    localStorage.setItem(DEV_LOGGED_OUT_KEY, '1')
    window.dispatchEvent(new Event('sd:auth-change'))

    try {
      await supabase.auth.signOut()
    } catch {
      /* ignore client errors if offline / placeholder */
    }
  },

  async getUser() {
    if (env.authBypass) {
      try {
        const stored = localStorage.getItem(DEV_SESSION_KEY)
        return stored ? (JSON.parse(stored) as User) : null
      } catch {
        return null
      }
    }
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },
}
