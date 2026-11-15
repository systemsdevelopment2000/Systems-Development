import { supabase } from '@/core/supabase/client'
import type { Usuario } from '../types'

/** Acceso a datos del dominio `usuarios` (tabla public.usuarios en Supabase). */
export const usuariosService = {
  async list(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, nombre, rol, creado_en')
      .order('creado_en', { ascending: false })

    if (error) throw error
    return (data ?? []) as Usuario[]
  },
}
