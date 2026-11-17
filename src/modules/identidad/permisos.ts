// M01 Identidad y permisos · RNF-02 / CA-04 / CA-09 / CA-13.
// Decide si una sesión puede ejecutar una acción sobre un recurso. La interfaz consume la decisión;
// el identificador que llega del navegador nunca acredita propiedad: se compara con la sesión.
import type { Rol, Sesion } from '../../data/types'

export type Accion =
  | 'paciente:crear' | 'paciente:listar' | 'paciente:leer'
  | 'especialista:escribir' | 'especialista:leer'
  | 'atencion:escribir' | 'atencion:leer'
  | 'tratamiento:escribir' | 'tratamiento:leer'
  | 'receta:escribir' | 'receta:leer'
  | 'historial:enviar' | 'historial:leer'

/** Acciones que solo ejecuta la administradora (CA-13: el paciente no puede usarlas). */
const SOLO_ADMIN: Accion[] = [
  'paciente:crear', 'paciente:listar', 'especialista:escribir', 'especialista:leer',
  'atencion:escribir', 'tratamiento:escribir', 'receta:escribir',
]
/** Acciones de lectura que el paciente solo puede hacer sobre sus propios datos. */
const LECTURA_PROPIA: Accion[] = ['paciente:leer', 'atencion:leer', 'tratamiento:leer', 'receta:leer', 'historial:leer']

export interface Recurso { pacienteId?: string }

export type MotivoDenegado = 'sin-sesion' | 'rol-insuficiente' | 'recurso-ajeno'
export type Decision = { permitido: true } | { permitido: false; motivo: MotivoDenegado }

const si: Decision = { permitido: true }
const no = (motivo: MotivoDenegado): Decision => ({ permitido: false, motivo })

export function autorizar(sesion: Sesion | null | undefined, accion: Accion, recurso: Recurso = {}): Decision {
  if (!sesion) return no('sin-sesion')

  if (sesion.rol === 'admin') {
    // RNF-02: el paciente es quien escribe su historial inicial; la administradora no lo envía por él.
    return accion === 'historial:enviar' ? no('rol-insuficiente') : si
  }

  // Paciente
  if (SOLO_ADMIN.includes(accion)) return no('rol-insuficiente')
  const propio = !!sesion.pacienteId && recurso.pacienteId === sesion.pacienteId
  if (accion === 'historial:enviar') return propio ? si : no('recurso-ajeno')
  if (LECTURA_PROPIA.includes(accion)) return propio ? si : no('recurso-ajeno')
  return no('rol-insuficiente')
}

export const rutaInicial = (rol: Rol) => (rol === 'admin' ? '/admin' : '/portal')

/** ¿Puede esta sesión abrir esa ruta? Las rutas privadas piden sesión y el rol correcto (CA-09). */
export function puedeAbrirRuta(sesion: Sesion | null | undefined, ruta: string): Decision {
  const zona = ruta.startsWith('/admin') ? 'admin' : ruta.startsWith('/portal') ? 'paciente' : null
  if (!zona) return si
  if (!sesion) return no('sin-sesion')
  return sesion.rol === zona ? si : no('rol-insuficiente')
}
