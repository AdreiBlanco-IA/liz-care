// M05 Tratamientos · RF-08 / RF-09 / HU-05.1 / HU-06 / CA-05 / CA-06.
// Valida medicamentos (o la ausencia expresa de ellos) y resuelve el último tratamiento del paciente.
import type { Consulta, Medicamento, Tratamiento } from '../../data/types'

export type CampoMedicamento = 'nombre' | 'dosis' | 'frecuencia' | 'duracion' | 'indicaciones'
export type ErroresMedicamento = Partial<Record<CampoMedicamento, string>>

/**
 * v4 (RF-08 y CA-05) pide dosis, frecuencia, duración e indicaciones; el diccionario de datos pide nombre,
 * dosis, duración y frecuencia. Se exigen todos para que el paciente reciba un tratamiento completo.
 */
export const camposMedicamento: CampoMedicamento[] = ['nombre', 'dosis', 'frecuencia', 'duracion', 'indicaciones']

export const medicamentoVacio = (): Medicamento => ({ nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '', horarios: [] })

/** Una fila está «en uso» si tiene cualquier dato escrito; así una fila en blanco no cuenta como medicamento. */
export const medicamentoEnUso = (m: Medicamento) => camposMedicamento.some((k) => m[k].trim()) || m.horarios.length > 0

export function validarMedicamento(m: Medicamento): ErroresMedicamento {
  const errores: ErroresMedicamento = {}
  camposMedicamento.forEach((k) => { if (!m[k].trim()) errores[k] = 'Falta este dato.' })
  return errores
}

export interface ErroresTratamiento {
  /** Error general: ni medicamentos ni «sin medicamentos». */
  general?: string
  /** Errores por posición dentro de la lista tal como llegó. */
  medicamentos: Record<number, ErroresMedicamento>
}

export interface EntradaTratamiento {
  medicamentos: Medicamento[]
  sinMedicamentos: boolean
  indicacionesGenerales: string
}

export type ResultadoTratamiento =
  | { ok: true; tratamiento: Tratamiento }
  | { ok: false; errores: ErroresTratamiento }

/** RF-08: por consulta realizada se registran medicamentos o se indica expresamente que no hubo. */
export function validarTratamiento(e: EntradaTratamiento): ResultadoTratamiento {
  const errores: ErroresTratamiento = { medicamentos: {} }
  const usados = e.medicamentos.map((m, i) => ({ m, i })).filter(({ m }) => medicamentoEnUso(m))

  if (e.sinMedicamentos && usados.length) errores.general = 'Quita los medicamentos o desmarca «Sin medicamentos».'
  else if (!e.sinMedicamentos && usados.length === 0) errores.general = 'Agrega al menos un medicamento o marca «Sin medicamentos».'

  if (!e.sinMedicamentos) {
    usados.forEach(({ m, i }) => {
      const er = validarMedicamento(m)
      if (Object.keys(er).length) errores.medicamentos[i] = er
    })
  }

  if (errores.general || Object.keys(errores.medicamentos).length) return { ok: false, errores }

  const limpio = (m: Medicamento): Medicamento => ({
    nombre: m.nombre.trim(), dosis: m.dosis.trim(), frecuencia: m.frecuencia.trim(), duracion: m.duracion.trim(),
    indicaciones: m.indicaciones.trim(), horarios: [...m.horarios],
  })
  return {
    ok: true,
    tratamiento: {
      medicamentos: e.sinMedicamentos ? [] : usados.map(({ m }) => limpio(m)),
      sinMedicamentos: e.sinMedicamentos || undefined,
      indicacionesGenerales: e.indicacionesGenerales.trim(),
    },
  }
}

export type UltimoTratamiento =
  | { estado: 'sin-consultas' }
  | { estado: 'sin-tratamiento'; consulta: Consulta }
  | { estado: 'con-tratamiento'; consulta: Consulta; tratamiento: Tratamiento }

/**
 * RF-09 / CA-06 / PT09: se elige la consulta realizada de fecha más reciente, no la última capturada.
 * Si esa consulta no tiene tratamiento se indica así; nunca se muestra el de otra consulta.
 */
export function ultimoTratamiento(consultas: Consulta[], pacienteId: string): UltimoTratamiento {
  const realizadas = consultas
    .filter((c) => c.pacienteId === pacienteId && c.estado === 'completada')
    .sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha) || b.id.localeCompare(a.id))
  const ultima = realizadas[0]
  if (!ultima) return { estado: 'sin-consultas' }
  if (!ultima.tratamiento) return { estado: 'sin-tratamiento', consulta: ultima }
  return { estado: 'con-tratamiento', consulta: ultima, tratamiento: ultima.tratamiento }
}
