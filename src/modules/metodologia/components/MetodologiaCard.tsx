import type { MetodologiaTrabajo } from '@/core/datos/tipos'
import {
  FileText,
  Edit2,
  Copy,
  Trash2,
  Layers,
  Image as ImageIcon,
  Shield,
} from 'lucide-react'

interface Props {
  metodologia: MetodologiaTrabajo
  onVerDocumento: () => void
  onEditar: () => void
  onDuplicar: () => void
  onEliminar: () => void
  onToggleActiva: () => void
}

export function MetodologiaCard({
  metodologia,
  onVerDocumento,
  onEditar,
  onDuplicar,
  onEliminar,
  onToggleActiva,
}: Props) {
  const {
    codigo,
    titulo,
    subtitulo,
    tipo,
    clienteNombre,
    fases = [],
    imagenes = [],
    version = '1.0',
    activa,
    mostrarLogoSD = true,
    logoCliente,
  } = metodologia

  return (
    <div className={`met-card ${!activa ? 'is-inactiva' : ''}`}>
      <div className="met-card__top">
        <div className="met-card__tags">
          <span className="met-tag met-tag--codigo">{codigo || 'MET'}</span>
          <span className="met-tag met-tag--tipo">{tipo}</span>
          <span className="met-tag met-tag--ver">v{version}</span>
          {clienteNombre && (
            <span className="met-tag met-tag--cliente">{clienteNombre}</span>
          )}
        </div>

        <div className="met-card__acciones">
          <button
            type="button"
            className="met-btn-icono"
            title="Editar metodología"
            onClick={onEditar}
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            className="met-btn-icono"
            title="Duplicar metodología"
            onClick={onDuplicar}
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            className="met-btn-icono met-btn-icono--rojo"
            title="Eliminar metodología"
            onClick={onEliminar}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="met-card__cuerpo" onClick={onVerDocumento}>
        <h3 className="met-card__titulo">{titulo}</h3>
        {subtitulo && <p className="met-card__subtitulo">{subtitulo}</p>}

        <div className="met-card__stats">
          <span className="met-stat" title={`${fases.length} fases definidas`}>
            <Layers size={13} /> {fases.length} fases
          </span>
          <span className="met-stat" title={`${imagenes.length} diagramas adjuntos`}>
            <ImageIcon size={13} /> {imagenes.length} diagramas
          </span>
          <span className="met-stat" title="Identidad visual">
            <Shield size={13} /> {mostrarLogoSD ? 'Logo SD' : 'Sin logo SD'}
            {logoCliente ? ' + Cliente' : ''}
          </span>
        </div>
      </div>

      <div className="met-card__pie">
        <button
          type="button"
          className="btn btn--primary btn--sm btn--icono"
          onClick={onVerDocumento}
        >
          <FileText size={14} /> Ver Documento & PDF
        </button>

        <button
          type="button"
          className={`met-estado-badge ${activa ? 'is-activa' : 'is-archivada'}`}
          onClick={onToggleActiva}
          title="Clic para cambiar estado"
        >
          {activa ? 'Vigente' : 'Inactiva'}
        </button>
      </div>
    </div>
  )
}
