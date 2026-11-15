/**
 * Catálogo de tipos de sistema y sus módulos.
 *
 * Vive en `core/lib` porque lo consumen dos módulos: `proyectos` define el
 * alcance y `finanzas` lo cotiza. Un módulo no puede importar de otro, así que
 * lo compartido sube a core y aquí sólo se reexporta por compatibilidad.
 */
export * from '@/core/lib/modulos'
