/**
 * Tipos del esquema de Supabase.
 *
 * Esto es un PLACEHOLDER. Genera los tipos reales desde tu base con:
 *
 *   npx supabase gen types typescript --project-id <TU_PROJECT_ID> \
 *     > src/core/types/database.types.ts
 *
 * o, usando el proyecto enlazado:
 *
 *   npx supabase gen types typescript --linked > src/core/types/database.types.ts
 */
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string | null
          rol: 'admin' | 'operador' | 'lectura'
          creado_en: string
        }
        Insert: {
          id?: string
          email: string
          nombre?: string | null
          rol?: 'admin' | 'operador' | 'lectura'
          creado_en?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string | null
          rol?: 'admin' | 'operador' | 'lectura'
          creado_en?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      rol_usuario: 'admin' | 'operador' | 'lectura'
    }
  }
}
