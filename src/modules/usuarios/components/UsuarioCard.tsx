import { Pencil, KeyRound, Ban, RotateCcw, Mail, ShieldCheck } from 'lucide-react'
import type { Colaborador, RolSistema } from '@/core/datos'
import { colorAvatar, inicialesDe } from '@/core/lib/avatar'
import { CATALOGO_PERMISOS, permisosPorRol } from '../lib/permisos'

const ROL_LABEL: Record<RolSistema, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  lectura: 'Lectura',
}

interface Props {
  usuario: Colaborador
  onEditar: () => void
  onReset: () => void
  onAlternarAcceso: () => void
}

/**
 * Resumen de permisos: cuántos módulos hay en cada nivel. Si el usuario aún no
 * tiene permisos explícitos (cuentas anteriores al editor), se usa el preset de
 * su rol para no mostrarlo como "sin acceso".
 */
function resumen(u: Colaborador, rol: RolSistema) {
  const permisos = u.permisos ?? permisosPorRol(rol)
  const conteo = { admin: 0, editar: 0, ver: 0, ninguno: 0 }
  for (const m of CATALOGO_PERMISOS) {
    const nivel = permisos[m.id]?.nivel ?? 'ninguno'
    conteo[nivel] += 1
  }
  return conteo
}

export function UsuarioCard({ usuario: u, onEditar, onReset, onAlternarAcceso }: Props) {
  const deshab = !!u.cuentaDeshabilitada
  const rol = u.rolSistema ?? 'editor'
  const c = resumen(u, rol)

  return (
    <article className={'usr-card' + (deshab ? ' usr-card--off' : '')}>
      <div className="usr-card__head">
        <span className="usr-card__av" style={{ background: colorAvatar(u.id) }}>
          {inicialesDe(u.nombre)}
        </span>
        <div className="usr-card__id">
          <h3 className="usr-card__nom">{u.nombre}</h3>
          <span className="usr-card__mail">
            <Mail size={12} /> {u.contacto.correo ?? 'sin correo'}
          </span>
        </div>
        <span className={'usr-estado ' + (deshab ? 'usr-estado--off' : 'usr-estado--on')}>
          {deshab ? 'Deshabilitada' : 'Activo'}
        </span>
      </div>

      <div className="usr-card__rol">
        <span className={'rol-badge rol-' + rol}>{ROL_LABEL[rol]}</span>
        {u.claveActualizada && (
          <span className="usr-card__clave">
            clave actualizada{' '}
            {new Date(u.claveActualizada).toLocaleDateString('es-VE', { dateStyle: 'medium' })}
          </span>
        )}
      </div>

      <div className="usr-perm">
        <span className="usr-perm__tit">
          <ShieldCheck size={12} /> Permisos
        </span>
        <div className="usr-perm__barras">
          <span className="usr-perm__b usr-perm__b--admin" style={{ flexGrow: c.admin || 0.001 }} />
          <span className="usr-perm__b usr-perm__b--editar" style={{ flexGrow: c.editar || 0.001 }} />
          <span className="usr-perm__b usr-perm__b--ver" style={{ flexGrow: c.ver || 0.001 }} />
          <span className="usr-perm__b usr-perm__b--none" style={{ flexGrow: c.ninguno || 0.001 }} />
        </div>
        <div className="usr-perm__leyenda">
          {c.admin > 0 && <span className="usr-lg usr-lg--admin">{c.admin} total</span>}
          {c.editar > 0 && <span className="usr-lg usr-lg--editar">{c.editar} editar</span>}
          {c.ver > 0 && <span className="usr-lg usr-lg--ver">{c.ver} ver</span>}
          {c.ninguno > 0 && <span className="usr-lg usr-lg--none">{c.ninguno} sin acceso</span>}
        </div>
      </div>

      <div className="usr-card__acc">
        <button className="usr-acc__btn" onClick={onEditar}>
          <Pencil size={14} /> Permisos
        </button>
        <button className="usr-acc__btn" onClick={onReset}>
          <KeyRound size={14} /> Contraseña
        </button>
        <button
          className={'usr-acc__btn' + (deshab ? '' : ' usr-acc__btn--peligro')}
          onClick={onAlternarAcceso}
        >
          {deshab ? <RotateCcw size={14} /> : <Ban size={14} />}
          {deshab ? 'Habilitar' : 'Deshabilitar'}
        </button>
      </div>
    </article>
  )
}
