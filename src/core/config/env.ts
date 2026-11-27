/**
 * Acceso centralizado y validado a las variables de entorno.
 * Importa SIEMPRE desde aquí en vez de usar import.meta.env directamente:
 * así un valor faltante falla rápido y en un solo lugar.
 */

export type AppEnvName = 'development' | 'staging' | 'production'

interface AppEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  appName: string
  appEnv: AppEnvName
  /** Bypass de auth para desarrollo local. Nunca se activa en producción. */
  authBypass: boolean
}

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `[env] Falta la variable ${name}. Copia .env.example a .env.local y rellénala.`,
    )
  }
  return value
}

export const env: AppEnv = {
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
  appName: import.meta.env.VITE_APP_NAME ?? 'Systems Development',
  appEnv: (import.meta.env.VITE_APP_ENV as AppEnvName | undefined) ?? 'development',
  authBypass: false,
}

export const isProd = env.appEnv === 'production'

// El bypass de auth solo puede activarse fuera de producción.
env.authBypass = import.meta.env.VITE_AUTH_BYPASS === 'true' && import.meta.env.DEV && !isProd
