// M03 Historial inicial · RF-10 / HU-07 / CA-07 / CA-08 / CA-13.
// Captura explícita de padecimientos, alergias y tratamientos previos, con envío único por paciente.
import type { HistorialInicial, Paciente, Sesion } from '../../data/types'
import { autorizar } from '../identidad/permisos'

export interface RespuestasHistorial {
  padecimientos: string[]
  sinPadecimientos: boolean
  alergias: string[]
  sinAlergias: boolean
  tratamientos: string[]
  sinTratamientos: boolean
  cirugias?: string
  notas?: string
}

export type ApartadoHistorial = 'padecimientos' | 'alergias' | 'tratamientos'
export type ErroresHistorial = Partial<Record<ApartadoHistorial, string>>

export const respuestasVacias: RespuestasHistorial = {
  padecimientos: [], sinPadecimientos: false, alergias: [], sinAlergias: false, tratamientos: [], sinTratamientos: false,
}

/** Quita espacios y repetidos (sin distinguir mayúsculas) y descarta elementos vacíos. */
export function limpiarLista(items: string[]): string[] {
  const vistos = new Set<string>()
  const salida: string[] = []
  for (const bruto of items) {
    const item = bruto.replace(/\s+/g, ' ').trim()
    const clave = item.toLowerCase()
    if (item && !vistos.has(clave)) { vistos.add(clave); salida.push(item) }
  }
  return salida
}

const apartados: { clave: ApartadoHistorial; lista: keyof RespuestasHistorial; no: keyof RespuestasHistorial; nombre: string }[] = [
  { clave: 'padecimientos', lista: 'padecimientos', no: 'sinPadecimientos', nombre: 'padecimientos' },
  { clave: 'alergias', lista: 'alergias', no: 'sinAlergias', nombre: 'alergias' },
  { clave: 'tratamientos', lista: 'tratamientos', no: 'sinTratamientos', nombre: 'tratamientos previos' },
]

/**
 * CA-08: cada apartado trae elementos o «no tengo». Un apartado sin respuesta bloquea el envío
 * y una lista de alergias vacía nunca equivale a «sin alergias».
 */
export function validarHistorial(r: RespuestasHistorial): ErroresHistorial {
  const errores: ErroresHistorial = {}
  for (const a of apartados) {
    const items = limpiarLista(r[a.lista] as string[])
    const no = r[a.no] as boolean
    if (no && items.length) errores[a.clave] = `En ${a.nombre}, elige «No tengo» o escribe elementos, no ambos.`
    else if (!no && items.length === 0) errores[a.clave] = `Indica tus ${a.nombre} o marca «No tengo».`
  }
  return errores
}

export function aHistorial(r: RespuestasHistorial, ahora: Date): HistorialInicial {
  return {
    completadoEl: ahora.toISOString(),
    padecimientos: r.sinPadecimientos ? [] : limpiarLista(r.padecimientos), sinPadecimientos: r.sinPadecimientos,
    alergias: r.sinAlergias ? [] : limpiarLista(r.alergias), sinAlergias: r.sinAlergias,
    tratamientos: r.sinTratamientos ? [] : limpiarLista(r.tratamientos), sinTratamientos: r.sinTratamientos,
    cirugias: r.cirugias?.trim() || undefined,
    notas: r.notas?.trim() || undefined,
  }
}

/** La persistencia rechazó el envío porque el historial ya existe (envío concurrente). */
export class HistorialYaEnviadoError extends Error {
  constructor() {
    super('El historial inicial ya fue enviado.')
    this.name = 'HistorialYaEnviadoError'
  }
}

export type ResultadoHistorial =
  | { ok: true; historial: HistorialInicial }
  | { ok: false; motivo: 'sin-permiso' }
  | { ok: false; motivo: 'ya-enviado' }
  | { ok: false; motivo: 'datos-invalidos'; errores: ErroresHistorial }
  | { ok: false; motivo: 'error-guardado' }

/** Pacientes con un envío en curso: un segundo envío simultáneo se rechaza sin duplicar el historial. */
const enCurso = new Set<string>()

export interface OpcionesEnvio {
  sesion: Sesion | null
  /** Paciente tal como está en la persistencia, para saber si ya envió. */
  paciente: Paciente | undefined
  guardar: (pacienteId: string, h: HistorialInicial) => Promise<void> | void
  ahora?: Date
}

export async function enviarHistorial(r: RespuestasHistorial, o: OpcionesEnvio): Promise<ResultadoHistorial> {
  // La propiedad sale de la sesión: la administradora no lo envía por el paciente ni un paciente por otro (CA-13).
  if (!o.paciente || !autorizar(o.sesion, 'historial:enviar', { pacienteId: o.paciente.id }).permitido) {
    return { ok: false, motivo: 'sin-permiso' }
  }
  const id = o.paciente.id
  // CA-07 límite: un historial ya enviado puede consultarse, pero no reenviarse ni editarse.
  if (o.paciente.historialInicial || enCurso.has(id)) return { ok: false, motivo: 'ya-enviado' }

  const errores = validarHistorial(r)
  if (Object.keys(errores).length) return { ok: false, motivo: 'datos-invalidos', errores }

  enCurso.add(id)
  try {
    const historial = aHistorial(r, o.ahora ?? new Date())
    await o.guardar(id, historial)
    return { ok: true, historial }
  } catch (e) {
    // CA-07 error: una falla no confirma el envío; el reintento no lo duplica porque el paciente sigue sin historial.
    return e instanceof HistorialYaEnviadoError ? { ok: false, motivo: 'ya-enviado' } : { ok: false, motivo: 'error-guardado' }
  } finally {
    enCurso.delete(id)
  }
}
