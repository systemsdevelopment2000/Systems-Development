import { useRouteError, useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/core/ui'

export function RouteErrorBoundary() {
  const error = useRouteError() as Error | undefined
  const navigate = useNavigate()

  const mensaje = error?.message || 'Ha ocurrido un error inesperado al procesar la pantalla.'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#0a0d14',
        color: '#f1f5f9',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#111827',
          border: '1px solid #1f293d',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ef4444',
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          Algo salió mal en esta vista
        </h2>

        <p
          style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          {mensaje}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Recargar pantalla
          </Button>
          <Button onClick={() => navigate('/tablero')}>
            <Home size={15} /> Ir al Tablero
          </Button>
        </div>
      </div>
    </div>
  )
}
