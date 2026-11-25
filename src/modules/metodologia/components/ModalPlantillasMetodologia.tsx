import {
  PLANTILLAS_PREDEFINIDAS,
  type PlantillaMetodologiaDef,
} from '../lib/plantillasMetodologia'
import { Sparkles, Layers, ShieldCheck, Check } from 'lucide-react'

interface Props {
  onSeleccionar: (plantilla: PlantillaMetodologiaDef) => void
  onCerrar?: () => void
}

export function ModalPlantillasMetodologia({ onSeleccionar }: Props) {
  return (
    <div className="met-plantillas-galeria">
      <p className="met-plantillas-intro">
        Selecciona una de las metodologías estandarizadas de Systems Development para incorporarla de inmediato con todas sus fases, entregables, roles y principios configurados.
      </p>

      <div className="met-plantillas-grid">
        {PLANTILLAS_PREDEFINIDAS.map((p, idx) => (
          <div key={idx} className="met-plantilla-card">
            <div className="met-plantilla-card__head">
              <span className="met-tag met-tag--tipo">{p.tipo.toUpperCase()}</span>
              <span className="met-tag met-tag--ver">VER. {p.version}</span>
            </div>

            <h4 className="met-plantilla-card__titulo">{p.titulo}</h4>
            <p className="met-plantilla-card__sub">{p.subtitulo}</p>

            <div className="met-plantilla-card__meta">
              <span>
                <Layers size={13} /> {p.fases.length} Fases
              </span>
              <span>
                <ShieldCheck size={13} /> {p.principios.length} Principios
              </span>
            </div>

            <div className="met-plantilla-card__fases-resumen">
              {p.fases.map((f, i) => (
                <div key={i} className="met-plantilla-fase-item">
                  <Check size={12} className="met-check-icono" />
                  <span>{f.nombre}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn--primary btn--sm btn--icono"
              style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
              onClick={() => onSeleccionar(p)}
            >
              <Sparkles size={14} /> Cargar esta Metodología
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
