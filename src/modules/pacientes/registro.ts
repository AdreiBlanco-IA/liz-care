// M02 Pacientes · RF-01: operación de alta. Comprueba permiso (M01), valida, revisa duplicados
// y solo confirma cuando la persistencia devuelve el paciente guardado.
import type { Paciente, Sesion } from '../../data/types'
import { buscarDuplicados, normalizarAlta, validarAlta, type DatosAlta, type ErroresAlta } from './validacion'

export type NuevoPaciente = Omit<Paciente, 'id' | 'altaEl' | 'color'>

/**
 * Contrato con la persistencia: Supabase (src/data/pacientesSupabase.ts) o, sin configuración,
 * el store en memoria del prototipo.
 */
export type GuardarPaciente = (p: NuevoPaciente) => Promise<Paciente> | Paciente

/** La persistencia rechazó el correo por repetido aunque la revisión previa no lo detectara. */
export class CorreoDuplicadoError extends Error {
  constructor() {
    super('El correo ya pertenece a un paciente registrado.')
    this.name = 'CorreoDuplicadoError'
  }
}

export interface OpcionesAlta {
  sesion: Sesion | null
  pacientes: Paciente[]
  guardar: GuardarPaciente
  invitarAlPortal: boolean
  /** La administradora confirmó que es otra persona aunque coincidan nombre y fecha de nacimiento. */
  confirmaHomonimo?: boolean
  hoy?: Date
}

export type ResultadoAlta =
  | { ok: true; paciente: Paciente }
  | { ok: false; motivo: 'sin-permiso' }
  | { ok: false; motivo: 'datos-invalidos'; errores: ErroresAlta }
  | { ok: false; motivo: 'correo-duplicado'; existentes: Paciente[] }
  | { ok: false; motivo: 'posible-homonimo'; existentes: Paciente[] }
  | { ok: false; motivo: 'error-guardado' }

export const PAISES: Record<string, string> = {
  Estadounidense: 'US', Canadiense: 'CA', Británica: 'GB', Alemana: 'DE', Francesa: 'FR', Española: 'ES',
  Italiana: 'IT', Japonesa: 'JP', Coreana: 'KR', China: 'CN', Brasileña: 'BR', Argentina: 'AR',
  Colombiana: 'CO', Mexicana: 'MX', Otra: 'XX',
}

export function aNuevoPaciente(d: DatosAlta, invitarAlPortal: boolean): NuevoPaciente {
  const n = normalizarAlta(d)
  return {
    nombre: n.nombre, apellidoPaterno: n.apellidoPaterno, apellidoMaterno: n.apellidoMaterno || undefined,
    fechaNacimiento: n.fechaNacimiento, sexo: n.sexo as 'F' | 'M' | 'X', nacionalidad: n.nacionalidad,
    pais: PAISES[n.nacionalidad] ?? 'XX', idioma: n.idioma, telefono: n.telefono, email: n.email,
    padecimientoPrincipal: n.padecimientoPrincipal,
    contactoEmergencia: { nombre: n.emNombre, parentesco: n.emParentesco, telefono: n.emTelefono },
    activo: true, portal: invitarAlPortal ? 'invitado' : 'sin acceso',
  }
}

export async function registrarPaciente(d: DatosAlta, o: OpcionesAlta): Promise<ResultadoAlta> {
  // CA-13: solo una sesión de administradora puede dar de alta pacientes.
  if (o.sesion?.rol !== 'admin') return { ok: false, motivo: 'sin-permiso' }

  const errores = validarAlta(d, o.hoy)
  if (Object.keys(errores).length) return { ok: false, motivo: 'datos-invalidos', errores }

  const { porCorreo, porNombre } = buscarDuplicados(d, o.pacientes)
  if (porCorreo.length) return { ok: false, motivo: 'correo-duplicado', existentes: porCorreo }
  if (porNombre.length && !o.confirmaHomonimo) return { ok: false, motivo: 'posible-homonimo', existentes: porNombre }

  try {
    const paciente = await o.guardar(aNuevoPaciente(d, o.invitarAlPortal))
    return { ok: true, paciente }
  } catch (e) {
    if (e instanceof CorreoDuplicadoError) return { ok: false, motivo: 'correo-duplicado', existentes: [] }
    return { ok: false, motivo: 'error-guardado' }
  }
}
