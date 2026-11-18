import { createElement } from 'react'
import {
  Database,
  Server,
  Sparkles,
  GitBranch,
  Globe,
  Mail,
  CreditCard,
  Palette,
  Wrench,
} from 'lucide-react'
import type { TipoHerramienta } from '@/core/datos'

export interface CategoriaHerramientaDef {
  id: TipoHerramienta
  etiqueta: string
  icono: string
  color: string
  descripcion: string
}

export function IconoCategoria({ id, size = 16 }: { id?: string; size?: number }) {
  switch (id) {
    case 'base_datos':
      return createElement(Database, { size })
    case 'hosting_servidores':
      return createElement(Server, { size })
    case 'ia_apis':
      return createElement(Sparkles, { size })
    case 'repositorio_git':
      return createElement(GitBranch, { size })
    case 'dominios_dns':
      return createElement(Globe, { size })
    case 'correo_workspace':
      return createElement(Mail, { size })
    case 'pasarela_pagos':
      return createElement(CreditCard, { size })
    case 'diseno_multimedia':
      return createElement(Palette, { size })
    default:
      return createElement(Wrench, { size })
  }
}

export const CATEGORIAS_HERRAMIENTA: CategoriaHerramientaDef[] = [
  {
    id: 'base_datos',
    etiqueta: 'Bases de Datos & Backend',
    icono: 'Database',
    color: '#05e4fd',
    descripcion: 'Supabase, Firebase, PostgreSQL, Redis, Neon, PlanetScale…',
  },
  {
    id: 'hosting_servidores',
    etiqueta: 'Hosting, Servidores & Cloud',
    icono: 'Server',
    color: '#3b82f6',
    descripcion: 'Digital Ocean, Vercel, Hostinger, AWS, Railway, Cloudflare…',
  },
  {
    id: 'ia_apis',
    etiqueta: 'Inteligencia Artificial & APIs',
    icono: 'Sparkles',
    color: '#a855f7',
    descripcion: 'IA Antigravity, OpenAI, Claude, Gemini, APIs de terceros…',
  },
  {
    id: 'repositorio_git',
    etiqueta: 'Repositorios & Git / CI-CD',
    icono: 'GitBranch',
    color: '#f97316',
    descripcion: 'GitHub, GitLab, Bitbucket, pipelines de despliegue…',
  },
  {
    id: 'dominios_dns',
    etiqueta: 'Dominios & DNS',
    icono: 'Globe',
    color: '#10b981',
    descripcion: 'Namecheap, GoDaddy, Cloudflare DNS, DonDominio…',
  },
  {
    id: 'correo_workspace',
    etiqueta: 'Correo & Productividad',
    icono: 'Mail',
    color: '#ec4899',
    descripcion: 'Google Workspace, Zoho Mail, Resend, SendGrid…',
  },
  {
    id: 'pasarela_pagos',
    etiqueta: 'Pasarelas de Pago & Finanzas',
    icono: 'CreditCard',
    color: '#eab308',
    descripcion: 'Zinli, PayPal, Stripe, Binance, transferencias…',
  },
  {
    id: 'diseno_multimedia',
    etiqueta: 'Diseño & Multimedia',
    icono: 'Palette',
    color: '#8b5cf6',
    descripcion: 'Figma, Canva, Adobe Creative Cloud…',
  },
  {
    id: 'otro',
    etiqueta: 'Otras Herramientas',
    icono: 'Wrench',
    color: '#64748b',
    descripcion: 'Utilidades, librerías y servicios generales',
  },
]

export function detectarTipoHerramienta(nombre: string, url = ''): TipoHerramienta {
  const txt = `${nombre} ${url}`.toLowerCase()
  if (/(supabase|postgres|firebase|neon|redis|planetscale|db|mysql|mongodb|database)/i.test(txt)) {
    return 'base_datos'
  }
  if (/(digital\s?ocean|digitalocean|vercel|hostinger|aws|railway|netlify|heroku|vps|server|cloud)/i.test(txt)) {
    return 'hosting_servidores'
  }
  if (/(antigravity|openai|claude|anthropic|gemini|ia|ai|chatgpt|deepseek|perplexity)/i.test(txt)) {
    return 'ia_apis'
  }
  if (/(github|gitlab|bitbucket|git)/i.test(txt)) {
    return 'repositorio_git'
  }
  if (/(namecheap|godaddy|dondominio|dns|domain|dominio)/i.test(txt)) {
    return 'dominios_dns'
  }
  if (/(google\s?workspace|zoho|mail|resend|sendgrid|correo|outlook)/i.test(txt)) {
    return 'correo_workspace'
  }
  if (/(zinli|paypal|stripe|binance|banco|pagos|pago)/i.test(txt)) {
    return 'pasarela_pagos'
  }
  if (/(figma|canva|adobe|photoshop|illustrator)/i.test(txt)) {
    return 'diseno_multimedia'
  }
  return 'otro'
}

export function obtenerDefTipoHerramienta(id?: string): CategoriaHerramientaDef {
  const encontrada = CATEGORIAS_HERRAMIENTA.find((c) => c.id === id)
  if (encontrada) return encontrada
  return CATEGORIAS_HERRAMIENTA[CATEGORIAS_HERRAMIENTA.length - 1]
}
