import { porFechaAsc, porFechaDesc } from './format'
import { useStore } from './store'

export function usePaciente() {
  const { sesion, pacientes, consultas, especialistas } = useStore()
  const paciente = pacientes.find((p) => p.id === sesion?.pacienteId)!
  const ahora = new Date()
  const propias = consultas.filter((c) => c.pacienteId === paciente.id && c.estado !== 'cancelada')
  const proximas = propias.filter((c) => c.estado === 'programada' && new Date(c.fecha) >= ahora).sort(porFechaAsc)
  const pasadas = propias.filter((c) => c.estado === 'completada').sort(porFechaDesc)
  const esp = (id: string) => especialistas.find((e) => e.id === id)!
  return { paciente, proximas, pasadas, ultima: pasadas[0], esp }
}

export function mapsUrl(direccion: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`
}
