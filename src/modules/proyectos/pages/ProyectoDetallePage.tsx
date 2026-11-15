import '../styles/detalle.css'
import { useParams } from 'react-router-dom'
import { ProyectoDetalle } from '../components/detalle/ProyectoDetalle'

export function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return (
    <section className="page">
      <ProyectoDetalle proyectoId={id} />
    </section>
  )
}
