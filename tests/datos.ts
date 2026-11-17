// Datos ficticios para las pruebas de los módulos (no son personas reales).
import type { Consulta, Especialista, Paciente, Sesion } from '../src/data/types'

export const AHORA = new Date('2026-11-17T18:00:00Z') // 12:00 en León

export const admin: Sesion = { rol: 'admin', nombre: 'Liz Hernández', email: 'liz@lizcare.mx' }
export const sesionA: Sesion = { rol: 'paciente', nombre: 'Alex Rivera', email: 'alex@example.com', pacienteId: 'pA' }
export const sesionB: Sesion = { rol: 'paciente', nombre: 'Bea Soto', email: 'bea@example.com', pacienteId: 'pB' }

export function paciente(id: string, extra: Partial<Paciente> = {}): Paciente {
  return {
    id, nombre: id === 'pA' ? 'Alex' : 'Bea', apellidoPaterno: id === 'pA' ? 'Rivera' : 'Soto', fechaNacimiento: '1990-04-18', sexo: 'X',
    nacionalidad: 'Canadiense', pais: 'CA', idioma: 'Inglés', telefono: '+52 477 000 0000', email: `${id.toLowerCase()}@example.com`,
    padecimientoPrincipal: 'Dato de prueba', contactoEmergencia: { nombre: 'Sam', parentesco: 'Hermano', telefono: '+52 477 000 0001' },
    altaEl: '2026-10-01T10:00:00Z', activo: true, portal: 'activo', color: '#00a58c', ...extra,
  }
}

export const pacienteA = paciente('pA')
export const pacienteB = paciente('pB')

export const esp = (id: string, especialidad: string, idiomas: string[], extra: Partial<Especialista> = {}): Especialista => ({
  id, nombre: `Dra. ${id}`, especialidad, institucion: 'Clínica demo', sector: 'Privado', direccion: 'León, Gto.', telefono: '477 000 0000', idiomas, ...extra,
})

export const catalogo: Especialista[] = [
  esp('e1', 'Cardiología', ['Español', 'Inglés']),
  esp('e2', 'Dermatología', ['Español', 'Inglés', 'Francés']),
  esp('e3', 'Medicina general', ['Español']),
]

export function consulta(id: string, pacienteId: string, fecha: string, extra: Partial<Consulta> = {}): Consulta {
  return {
    id, pacienteId, especialistaId: 'e1', fecha, estado: 'completada', motivo: 'Seguimiento', overview: 'Resumen de ejemplo',
    acompanamiento: true, traduccion: false, ...extra,
  }
}

export const medicamento = (nombre = 'Medicamento demo') => ({
  nombre, dosis: '50 mg', frecuencia: 'Cada 24 horas', duracion: '30 días', indicaciones: 'Tomar por la mañana.', horarios: ['mañana' as const],
})
