// M07 Expedientes · RF-03 / RF-06 / HU-03 / HU-04.3 / CA-03 / CA-04 / CA-12.
// Vista compuesta (no una copia) del historial inicial y las atenciones, con la proyección permitida por rol.
// Las notas internas nunca se envían a la vista del paciente para ocultarlas después en pantalla.
import type { Consulta, HistorialInicial, Paciente, Sesion } from '../../data/types'
import { autorizar, type MotivoDenegado } from '../identidad/permisos'
import { ordenCronologico } from '../citas/atenciones'

export type ConsultaPaciente = Omit<Consulta, 'notaInterna'>

/** Copia de la consulta sin la nota interna (la propiedad no existe, no solo está vacía). */
export function proyectarParaPaciente(c: Consulta): ConsultaPaciente {
  const { notaInterna: _interna, ...visible } = c
  void _interna
  return visible
}

export interface DatosExpediente { pacientes: Paciente[]; consultas: Consulta[] }

export type Expediente =
  | {
      vista: 'admin'
      paciente: Paciente
      historial?: HistorialInicial
      /** Citas futuras y pasadas aún sin registrar, de la más cercana a la más lejana. */
      programadas: Consulta[]
      /** Consultas realizadas, de la más reciente a la más antigua. */
      realizadas: Consulta[]
      vacio: boolean
    }
  | {
      vista: 'paciente'
      paciente: Paciente
      historial?: HistorialInicial
      realizadas: ConsultaPaciente[]
      vacio: boolean
    }

export type ResultadoExpediente =
  | { ok: true; expediente: Expediente }
  | { ok: false; motivo: MotivoDenegado | 'no-existe' | 'error-carga' }

/** RF-03 / RF-06: el expediente que corresponde al rol; el paciente solo obtiene el suyo (CA-04). */
export function obtenerExpediente(sesion: Sesion | null | undefined, pacienteId: string, datos: DatosExpediente): ResultadoExpediente {
  const permiso = autorizar(sesion, 'paciente:leer', { pacienteId })
  if (!permiso.permitido) return { ok: false, motivo: permiso.motivo }
  const paciente = datos.pacientes.find((p) => p.id === pacienteId)
  if (!paciente) return { ok: false, motivo: 'no-existe' }

  const propias = datos.consultas.filter((c) => c.pacienteId === pacienteId)
  const realizadas = ordenCronologico(propias.filter((c) => c.estado === 'completada'), 'desc')
  const programadas = ordenCronologico(propias.filter((c) => c.estado === 'programada'), 'asc')
  const vacio = realizadas.length === 0 && programadas.length === 0

  if (sesion?.rol === 'admin') {
    return { ok: true, expediente: { vista: 'admin', paciente, historial: paciente.historialInicial, programadas, realizadas, vacio } }
  }
  return {
    ok: true,
    expediente: {
      vista: 'paciente', paciente, historial: paciente.historialInicial,
      realizadas: realizadas.map(proyectarParaPaciente), vacio: realizadas.length === 0,
    },
  }
}

/**
 * CA-03 error: si la carga falla se informa un error (con reintento en la pantalla), distinto del estado vacío.
 * `cargar` es la lectura de datos: en memoria no falla; con Supabase puede fallar por red o permisos.
 */
export async function cargarExpediente(
  sesion: Sesion | null | undefined,
  pacienteId: string,
  cargar: () => Promise<DatosExpediente> | DatosExpediente,
): Promise<ResultadoExpediente> {
  try {
    return obtenerExpediente(sesion, pacienteId, await cargar())
  } catch {
    return { ok: false, motivo: 'error-carga' }
  }
}
