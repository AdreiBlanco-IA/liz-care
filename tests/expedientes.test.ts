// M07 Expedientes · PT06 (RF-06: CA-04, CA-12) y PT03 (RF-03: CA-03 vacío y error de carga).
import { describe, expect, it } from 'vitest'
import { cargarExpediente, obtenerExpediente, proyectarParaPaciente } from '../src/modules/expedientes/expediente'
import { admin, consulta, pacienteA, pacienteB, sesionA, sesionB } from './datos'

const consultas = [
  consulta('c1', 'pA', '2026-10-10T16:00:00.000Z', { notaVisible: 'Llevar estudios.', notaInterna: 'Paciente prefiere clínica privada.' }),
  consulta('c2', 'pA', '2026-10-25T16:00:00.000Z'),
  consulta('c3', 'pA', '2026-12-01T16:00:00.000Z', { estado: 'programada', notaInterna: 'Confirmar traductor.' }),
  consulta('cB', 'pB', '2026-10-12T16:00:00.000Z', { notaVisible: 'Nota de B' }),
]
const datos = { pacientes: [pacienteA, pacienteB], consultas }

describe('PT06-N · CA-12 normal: la nota visible se muestra y la interna no', () => {
  it('el paciente recibe sus consultas con notas visibles y sin la propiedad notaInterna', () => {
    const r = obtenerExpediente(sesionA, 'pA', datos)
    expect(r.ok).toBe(true)
    if (!r.ok || r.expediente.vista !== 'paciente') throw new Error('vista inesperada')
    const c1 = r.expediente.realizadas.find((c) => c.id === 'c1')!
    expect(c1.notaVisible).toBe('Llevar estudios.')
    expect('notaInterna' in c1).toBe(false)
    expect(JSON.stringify(r.expediente)).not.toContain('clínica privada')
    expect(JSON.stringify(r.expediente)).not.toContain('traductor')
  })
  it('la administradora ve todo, con notas internas y citas programadas separadas', () => {
    const r = obtenerExpediente(admin, 'pA', datos)
    if (!r.ok || r.expediente.vista !== 'admin') throw new Error('vista inesperada')
    expect(r.expediente.realizadas.map((c) => c.id)).toEqual(['c2', 'c1'])
    expect(r.expediente.programadas.map((c) => c.id)).toEqual(['c3'])
    expect(r.expediente.realizadas.find((c) => c.id === 'c1')?.notaInterna).toBeTruthy()
  })
  it('la proyección no altera la consulta original', () => {
    const original = consultas[0]
    proyectarParaPaciente(original)
    expect(original.notaInterna).toBeTruthy()
  })
})

describe('PT06-L · CA-12 / CA-03 límite: expediente vacío', () => {
  it('un paciente sin consultas recibe un estado vacío, no un error', () => {
    const r = obtenerExpediente(admin, 'pB', { pacientes: [pacienteA, pacienteB], consultas: [] })
    expect(r.ok && r.expediente.vacio).toBe(true)
    const p = obtenerExpediente(sesionB, 'pB', { pacientes: [pacienteA, pacienteB], consultas: [] })
    expect(p.ok && p.expediente.vacio).toBe(true)
  })
  it('el paciente solo ve consultas realizadas: una cita futura sola no cuenta', () => {
    const solo = [consulta('c3', 'pA', '2026-12-01T16:00:00.000Z', { estado: 'programada' })]
    const r = obtenerExpediente(sesionA, 'pA', { ...datos, consultas: solo })
    expect(r.ok && r.expediente.vacio).toBe(true)
  })
})

describe('PT06-E · CA-04 error: A solicita el expediente de B', () => {
  it('se deniega y no se revela contenido', () => {
    const r = obtenerExpediente(sesionA, 'pB', datos)
    expect(r).toEqual({ ok: false, motivo: 'recurso-ajeno' })
    expect(JSON.stringify(r)).not.toContain('Nota de B')
  })
  it('sin sesión se deniega', () => {
    expect(obtenerExpediente(null, 'pA', datos)).toEqual({ ok: false, motivo: 'sin-sesion' })
  })
  it('un paciente inexistente da no-existe solo a la administradora', () => {
    expect(obtenerExpediente(admin, 'pX', datos)).toEqual({ ok: false, motivo: 'no-existe' })
    expect(obtenerExpediente(sesionA, 'pX', datos)).toEqual({ ok: false, motivo: 'recurso-ajeno' })
  })
})

describe('PT03-E · CA-03 error: fallo de carga distinto del estado vacío', () => {
  it('un error al cargar se informa como error-carga, nunca como vacío', async () => {
    const r = await cargarExpediente(admin, 'pA', () => { throw new Error('tiempo de espera') })
    expect(r).toEqual({ ok: false, motivo: 'error-carga' })
    const vacio = await cargarExpediente(admin, 'pB', () => ({ pacientes: [pacienteA, pacienteB], consultas: [] }))
    expect(vacio.ok).toBe(true)
  })
  it('un reintento exitoso devuelve el expediente', async () => {
    let intento = 0
    const cargar = () => { if (++intento === 1) throw new Error('red'); return datos }
    expect((await cargarExpediente(admin, 'pA', cargar)).ok).toBe(false)
    expect((await cargarExpediente(admin, 'pA', cargar)).ok).toBe(true)
  })
  it('una promesa rechazada también cuenta como error de carga', async () => {
    expect(await cargarExpediente(admin, 'pA', () => Promise.reject(new Error('x')))).toEqual({ ok: false, motivo: 'error-carga' })
  })
})
