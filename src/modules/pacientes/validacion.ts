// M02 Pacientes · RF-01 / CA-01: captura, normalización y validación del alta.
import type { Paciente } from '../../data/types'
import { normalizar } from '../../lib/format'

export interface DatosAlta {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  sexo: '' | 'F' | 'M' | 'X'
  nacionalidad: string
  idioma: string
  telefono: string
  email: string
  padecimientoPrincipal: string
  emNombre: string
  emParentesco: string
  emTelefono: string
}

export type CampoAlta = keyof DatosAlta
export type ErroresAlta = Partial<Record<CampoAlta, string>>

export const datosAltaVacios: DatosAlta = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', sexo: '',
  nacionalidad: '', idioma: '', telefono: '', email: '', padecimientoPrincipal: '',
  emNombre: '', emParentesco: '', emTelefono: '',
}

// Todo es obligatorio salvo el segundo apellido (CA-01 límite), conforme al diccionario de datos.
export const camposRequeridos: CampoAlta[] = [
  'nombre', 'apellidoPaterno', 'fechaNacimiento', 'sexo', 'nacionalidad', 'idioma',
  'telefono', 'email', 'padecimientoPrincipal', 'emNombre', 'emParentesco', 'emTelefono',
]

const espacios = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Quita espacios sobrantes sin alterar acentos ni mayúsculas de los nombres; el correo se guarda en minúsculas. */
export function normalizarAlta(d: DatosAlta): DatosAlta {
  const limpio = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, espacios(String(v))])) as unknown as DatosAlta
  return { ...limpio, email: limpio.email.replace(/\s/g, '').toLowerCase() }
}

/** Fecha de hoy en hora local, en formato AAAA-MM-DD. */
function hoyISO(hoy: Date) {
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${m}-${d}`
}

export function validarAlta(d: DatosAlta, hoy = new Date()): ErroresAlta {
  const n = normalizarAlta(d)
  const errores: ErroresAlta = {}
  camposRequeridos.forEach((k) => { if (!n[k]) errores[k] = 'Este campo es obligatorio.' })
  if (n.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.email)) errores.email = 'Escribe un correo válido.'
  if (n.fechaNacimiento) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(n.fechaNacimiento) || Number.isNaN(Date.parse(n.fechaNacimiento))) {
      errores.fechaNacimiento = 'Escribe una fecha válida.'
    } else if (n.fechaNacimiento > hoyISO(hoy)) {
      errores.fechaNacimiento = 'La fecha no puede ser futura.'
    }
  }
  return errores
}

export interface Duplicados {
  /** Mismo correo, sin distinguir mayúsculas ni espacios: bloquea el alta (CA-01 error). */
  porCorreo: Paciente[]
  /** Mismo nombre, primer apellido y fecha de nacimiento: solo advierte, porque dos personas pueden llamarse igual. */
  porNombre: Paciente[]
}

export function buscarDuplicados(d: DatosAlta, pacientes: Paciente[]): Duplicados {
  const n = normalizarAlta(d)
  const nombre = normalizar(`${n.nombre} ${n.apellidoPaterno}`)
  const porCorreo = n.email.includes('@')
    ? pacientes.filter((p) => p.email.replace(/\s/g, '').toLowerCase() === n.email)
    : []
  const porNombre = nombre.length >= 4 && n.fechaNacimiento
    ? pacientes.filter((p) => !porCorreo.includes(p)
        && normalizar(`${p.nombre} ${p.apellidoPaterno}`) === nombre
        && p.fechaNacimiento === n.fechaNacimiento)
    : []
  return { porCorreo, porNombre }
}
