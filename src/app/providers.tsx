import { useEffect, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/core/api/queryClient'
import { DatosProvider, useDatos } from '@/core/datos'
import { VistaProvider } from '@/core/vista'
import { ConfirmarProvider } from '@/core/ui'
import { SonidoProvider } from '@/core/sonido'
import { ToastProvider } from '@/core/notificaciones'
import { aplicarPaleta } from '@/core/lib/paletas'
import { useSession } from '@/core/hooks/useSession'

/**
 * Envuelve el store pasándole quién opera, para que la auditoría pueda
 * asentarlo. En la fase front el actor es el correo de la sesión: cuando haya
 * Supabase y los usuarios estén mapeados a colaboradores, pasará a ser el id
 * del colaborador.
 */
function DatosConActor({ children }: { children: ReactNode }) {
  const { session, user } = useSession()
  return (
    <DatosProvider key={user?.id ?? 'publico'} usuarioId={user?.id} sincronizar={Boolean(session)} actor={user?.email}>
      {children}
    </DatosProvider>
  )
}

/** Aplica al documento la combinación de color guardada en Configuración. */
function PaletaGlobal({ children }: { children: ReactNode }) {
  const { estado } = useDatos()
  const tema = estado.empresa.tema

  useEffect(() => {
    aplicarPaleta(tema)
  }, [tema])

  return <>{children}</>
}

/**
 * Raíz de composición de la app: aquí se envuelven todos los providers
 * globales (vista, store de datos, data fetching, tema, y a futuro: i18n).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <VistaProvider>
          <DatosConActor>
            <PaletaGlobal>
              <SonidoProvider>
                <ConfirmarProvider>{children}</ConfirmarProvider>
              </SonidoProvider>
            </PaletaGlobal>
          </DatosConActor>
        </VistaProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
