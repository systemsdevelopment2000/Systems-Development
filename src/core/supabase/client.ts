import { createClient } from '@supabase/supabase-js'
import { env } from '@/core/config/env'
import type { Database } from '@/core/types/database.types'

/**
 * Cliente único de Supabase para toda la app (patrón singleton).
 * Usa la clave anon/publishable: es segura en el navegador siempre que
 * tengas políticas RLS activas en cada tabla.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
