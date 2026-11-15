import { useRef, useState } from 'react'
import { Database, Download, Upload, RotateCcw } from 'lucide-react'
import { Button, useConfirmar } from '@/core/ui'
import { useDatos, estadoInicial, type EstadoDatos } from '@/core/datos'

/**
 * Gestión de los datos locales. En la fase front todo vive en el navegador,
 * así que conviene poder respaldarlos, restaurarlos y reiniciarlos.
 */
export function DatosCard() {
  const { estado, reemplazarTodo } = useDatos()
  const confirmar = useConfirmar()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const conteo = {
    proyectos: Object.keys(estado.proyectos).length,
    clientes: Object.keys(estado.clientes).length,
    colaboradores: Object.keys(estado.colaboradores).length,
    tareas: Object.keys(estado.actividades).length,
    reuniones: Object.keys(estado.reuniones).length,
    herramientas: Object.keys(estado.herramientas).length,
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sd-sistema-respaldo-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Respaldo descargado.')
  }

  async function importar(file: File) {
    try {
      const texto = await file.text()
      const datos = JSON.parse(texto) as EstadoDatos
      if (!datos || typeof datos !== 'object' || !datos.proyectos) {
        setMsg('El archivo no parece un respaldo válido.')
        return
      }
      const ok = await confirmar({
        titulo: '¿Restaurar este respaldo?',
        mensaje: 'Se reemplazarán todos los datos actuales por los del archivo.',
        textoConfirmar: 'Restaurar',
        peligro: true,
      })
      if (!ok) return
      reemplazarTodo({ ...estadoInicial(), ...datos })
      setMsg('Respaldo restaurado.')
    } catch {
      setMsg('No se pudo leer el archivo.')
    }
  }

  async function reiniciar() {
    const ok = await confirmar({
      titulo: '¿Reiniciar a los datos de ejemplo?',
      mensaje: 'Se perderá todo lo que hayas cargado: proyectos, clientes, tareas y reuniones.',
      textoConfirmar: 'Reiniciar',
      peligro: true,
    })
    if (ok) {
      reemplazarTodo(estadoInicial())
      setMsg('Datos reiniciados.')
    }
  }

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Database size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Datos locales</h2>
          <p className="cfg-card__sub">
            En esta fase todo se guarda en este navegador. Haz respaldos antes de limpiar el equipo.
          </p>
        </div>
      </div>

      <div className="dat-conteo">
        {Object.entries(conteo).map(([k, v]) => (
          <span key={k} className="dat-chip">
            <b>{v}</b> {k}
          </span>
        ))}
      </div>

      <div className="cfg-acciones">
        <Button type="button" variant="ghost" onClick={exportar}>
          <Download size={15} /> Exportar respaldo
        </Button>
        <Button type="button" variant="ghost" onClick={() => fileRef.current?.click()}>
          <Upload size={15} /> Restaurar
        </Button>
        <button className="btn btn--peligro" onClick={reiniciar}>
          <RotateCcw size={15} /> Reiniciar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) void importar(f)
          }}
        />
      </div>

      {msg && <p className="cfg-nota">{msg}</p>}
    </div>
  )
}
