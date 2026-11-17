import { proximasDelPaciente } from '../modules/citas/atenciones'
import { obtenerExpediente, proyectarParaPaciente } from '../modules/expedientes/expediente'
import { ultimoTratamiento } from '../modules/tratamientos/tratamiento'
import { useStore } from './store'

/**
 * Datos del portal del paciente. Todo sale de los módulos de dominio con la sesión actual:
 * M04 (próximas citas), M07 (expediente sin notas internas) y M05 (último tratamiento).
 */
export function usePaciente() {
  const { sesion, pacientes, consultas, especialistas } = useStore()
  const paciente = pacientes.find((p) => p.id === sesion?.pacienteId)!
  // Las citas también pasan por la proyección: la nota interna nunca llega a las pantallas del paciente.
  const proximas = proximasDelPaciente(consultas, paciente.id).map(proyectarParaPaciente)
  const r = obtenerExpediente(sesion, paciente.id, { pacientes, consultas })
  const pasadas = r.ok && r.expediente.vista === 'paciente' ? r.expediente.realizadas : []
  const esp = (id: string) => especialistas.find((e) => e.id === id)!
  return { paciente, proximas, pasadas, ultima: pasadas[0], ultimoTratamiento: ultimoTratamiento(consultas, paciente.id), esp, sesion }
}

export function mapsUrl(direccion: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
}
