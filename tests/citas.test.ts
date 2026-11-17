// M04 Citas y consultas · PT02 (RF-02: CA-02), PT03 (RF-03: CA-03, orden) y PT05 (RF-05: CA-04, CA-11).
import { describe, expect, it } from 'vitest'
import type { Consulta } from '../src/data/types'
import {
  citasPendientesDeRegistro, ordenCronologico, proximasDelPaciente, realizadasDelPaciente, registrarAtencion,
  validarAtencion, type DatosAtencion, type NuevaConsulta,
} from '../src/modules/citas/atenciones'
import { diaEnLeon } from '../src/lib/tiempo'
import { AHORA, admin, catalogo, consulta, medicamento, pacienteA, pacienteB, sesionA } from './datos'

const ctx = { pacientes: [pacienteA, pacienteB], especialistas: catalogo, ahora: AHORA }

const realizada: DatosAtencion = {
  pacienteId: 'pA', especialistaId: 'e1', fecha: '2026-11-10T16:00:00.000Z', motivo: 'Control de presión', estado: 'completada',
  overview: 'Presión estable.', acompanamiento: true, traduccion: false,
  tratamiento: { medicamentos: [medicamento('Medicamento demo 1'), medicamento('Medicamento demo 2')], sinMedicamentos: false, indicacionesGenerales: '' },
}
const cita: DatosAtencion = { ...realizada, fecha: '2026-11-25T16:00:00.000Z', estado: 'programada', overview: '', tratamiento: undefined }

function almacen(inicial: Consulta[] = []) {
  const lista = [...inicial]
  const guardar = (c: NuevaConsulta, id?: string) => {
    const n = { ...c, id: id ?? `c${lista.length + 1}` }
    if (id) lista.splice(lista.findIndex((x) => x.id === id), 1, n); else lista.push(n)
    return n
  }
  return { lista, guardar }
}
const registrar = (d: DatosAtencion, a = almacen(), extra = {}) => registrarAtencion(d, { ...ctx, sesion: admin, guardar: a.guardar, ...extra })

describe('PT02-N · CA-02 normal: la consulta de A aparece solo en el historial de A', () => {
  it('guarda la consulta con fecha, especialista, motivo y resumen', async () => {
    const a = almacen()
    const r = await registrar(realizada, a)
    expect(r.ok).toBe(true)
    expect(a.lista).toHaveLength(1)
    expect(realizadasDelPaciente(a.lista, 'pA').map((c) => c.id)).toEqual(['c1'])
    expect(realizadasDelPaciente(a.lista, 'pB')).toEqual([])
    expect(a.lista[0]).toMatchObject({ pacienteId: 'pA', especialistaId: 'e1', motivo: 'Control de presión', overview: 'Presión estable.' })
  })
})

describe('PT02-L · CA-02 límite: cita futura sin resumen', () => {
  it('queda programada y no cuenta como consulta realizada', async () => {
    const a = almacen()
    const r = await registrar(cita, a)
    expect(r.ok).toBe(true)
    expect(a.lista[0].estado).toBe('programada')
    expect(realizadasDelPaciente(a.lista, 'pA')).toEqual([])
  })
  it('una cita puede convertirse en consulta realizada al registrar su resultado', async () => {
    const a = almacen([consulta('c1', 'pA', '2026-11-12T16:00:00.000Z', { estado: 'programada', overview: '' })])
    const r = await registrar({ ...realizada, fecha: '2026-11-12T16:00:00.000Z' }, a, { existente: a.lista[0] })
    expect(r.ok).toBe(true)
    expect(a.lista).toHaveLength(1)
    expect(a.lista[0].estado).toBe('completada')
  })
})

describe('PT02-E · CA-02 error: dato faltante', () => {
  it('consulta realizada sin resumen: se señala y no se registra', async () => {
    const a = almacen()
    const r = await registrar({ ...realizada, overview: '   ' }, a)
    expect(r).toMatchObject({ ok: false, motivo: 'datos-invalidos', errores: { overview: expect.any(String) } })
    expect(a.lista).toHaveLength(0)
  })
  it('sin paciente, sin especialista o sin motivo', () => {
    const e = validarAtencion({ ...realizada, pacienteId: '', especialistaId: '', motivo: '' }, ctx)
    expect(Object.keys(e).sort()).toEqual(['especialista', 'motivo', 'paciente'])
  })
  it('paciente o especialista inexistentes (M04 verifica contra M02 y M11)', () => {
    const e = validarAtencion({ ...realizada, pacienteId: 'pX', especialistaId: 'eX' }, ctx)
    expect(e.paciente).toBeTruthy()
    expect(e.especialista).toBeTruthy()
  })
  it('una consulta realizada no puede tener fecha futura', () => {
    expect(validarAtencion({ ...realizada, fecha: '2026-12-01T16:00:00.000Z' }, ctx).fecha).toBeTruthy()
  })
  it('fecha vacía o inválida', () => {
    expect(validarAtencion({ ...realizada, fecha: '' }, ctx).fecha).toBeTruthy()
    expect(validarAtencion({ ...realizada, fecha: 'ayer' }, ctx).fecha).toBeTruthy()
  })
  it('una consulta realizada no vuelve a ser cita', () => {
    const existente = consulta('c1', 'pA', '2026-11-10T16:00:00.000Z')
    expect(validarAtencion(cita, { ...ctx, existente }).estado).toBeTruthy()
  })
  it('una cita futura no lleva tratamiento ni receta', () => {
    const e = validarAtencion({ ...cita, tratamiento: realizada.tratamiento, receta: { url: 'x', nombreOriginal: 'a.png', tipoMime: 'image/png', tamanoBytes: 10 } }, ctx)
    expect(e.tratamiento).toBeTruthy()
    expect(e.receta).toBeTruthy()
  })
  it('CA-13: el paciente no escribe consultas', async () => {
    const a = almacen()
    expect(await registrarAtencion(realizada, { ...ctx, sesion: sesionA, guardar: a.guardar })).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(await registrarAtencion(realizada, { ...ctx, sesion: null, guardar: a.guardar })).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(a.lista).toHaveLength(0)
  })
  it('una falla de guardado no confirma el registro', async () => {
    expect(await registrar(realizada, almacen(), { guardar: () => { throw new Error('red') } })).toEqual({ ok: false, motivo: 'error-guardado' })
  })
})

describe('PT03 · CA-03: historial en orden cronológico', () => {
  const desordenadas = [
    consulta('c12', 'pA', '2026-10-12T16:00:00.000Z'),
    consulta('c3', 'pA', '2026-10-03T16:00:00.000Z'),
    consulta('c8', 'pA', '2026-10-08T16:00:00.000Z'),
  ]
  it('normal: fechas 12, 3 y 8 se ordenan', () => {
    expect(ordenCronologico(desordenadas).map((c) => c.id)).toEqual(['c3', 'c8', 'c12'])
    expect(ordenCronologico(desordenadas, 'desc').map((c) => c.id)).toEqual(['c12', 'c8', 'c3'])
    expect(realizadasDelPaciente(desordenadas, 'pA').map((c) => c.id)).toEqual(['c12', 'c8', 'c3'])
  })
  it('no modifica la lista original', () => {
    const copia = [...desordenadas]
    ordenCronologico(desordenadas)
    expect(desordenadas).toEqual(copia)
  })
  it('empates de fecha se resuelven siempre igual (por id)', () => {
    const empate = [consulta('b', 'pA', '2026-10-05T16:00:00.000Z'), consulta('a', 'pA', '2026-10-05T16:00:00.000Z')]
    expect(ordenCronologico(empate).map((c) => c.id)).toEqual(['a', 'b'])
    expect(ordenCronologico([...empate].reverse()).map((c) => c.id)).toEqual(['a', 'b'])
  })
  it('límite: paciente sin consultas devuelve vacío', () => {
    expect(realizadasDelPaciente(desordenadas, 'pB')).toEqual([])
  })
})

describe('PT05 · CA-11: próximas citas del paciente (hora de León)', () => {
  // AHORA = 17 nov 2026, 12:00 en León.
  const citas = [
    consulta('lejana', 'pA', '2026-12-10T16:00:00.000Z', { estado: 'programada' }),
    consulta('hoy-tarde', 'pA', '2026-11-17T23:00:00.000Z', { estado: 'programada' }),
    consulta('hoy-temprano', 'pA', '2026-11-17T15:00:00.000Z', { estado: 'programada' }),
    consulta('ayer', 'pA', '2026-11-16T16:00:00.000Z', { estado: 'programada' }),
    consulta('realizada', 'pA', '2026-11-20T16:00:00.000Z', { estado: 'completada' }),
    consulta('de-B', 'pB', '2026-11-18T16:00:00.000Z', { estado: 'programada' }),
  ]
  it('normal: hoy y futuras, de la más cercana a la más lejana; sin consultas realizadas', () => {
    expect(proximasDelPaciente(citas, 'pA', AHORA).map((c) => c.id)).toEqual(['hoy-temprano', 'hoy-tarde', 'lejana'])
  })
  it('una cita de hoy más temprano que la hora actual sigue contando como de hoy', () => {
    expect(proximasDelPaciente(citas, 'pA', AHORA).some((c) => c.id === 'hoy-temprano')).toBe(true)
  })
  it('límite: paciente sin citas vigentes devuelve vacío', () => {
    expect(proximasDelPaciente(citas.filter((c) => c.id === 'ayer' || c.id === 'realizada'), 'pA', AHORA)).toEqual([])
  })
  it('error: A pide las citas de B y no las recibe', () => {
    expect(proximasDelPaciente(citas, 'pA', AHORA).some((c) => c.pacienteId === 'pB')).toBe(false)
  })
  it('el día se decide en hora de León, no en UTC', () => {
    // 2026-11-18 02:00 UTC sigue siendo 17 nov a las 20:00 en León.
    expect(diaEnLeon('2026-11-18T02:00:00Z')).toBe('2026-11-17')
    expect(diaEnLeon('2026-11-17T05:59:00Z')).toBe('2026-11-16')
  })
  it('citas pasadas sin registrar se separan para dar seguimiento', () => {
    expect(citasPendientesDeRegistro(citas, 'pA', AHORA).map((c) => c.id)).toEqual(['ayer'])
  })
})
