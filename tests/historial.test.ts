// M03 Historial inicial · PT10 (RF-10: CA-07, CA-08, CA-13): envío completo, «no tengo» explícito y envío único.
import { describe, expect, it } from 'vitest'
import type { HistorialInicial, Paciente } from '../src/data/types'
import { enviarHistorial, HistorialYaEnviadoError, limpiarLista, respuestasVacias, validarHistorial, type RespuestasHistorial } from '../src/modules/historial-inicial/historial'
import { AHORA, admin, paciente, pacienteA, pacienteB, sesionA, sesionB } from './datos'

const completas: RespuestasHistorial = {
  padecimientos: ['Hipertensión'], sinPadecimientos: false, alergias: ['Penicilina'], sinAlergias: false,
  tratamientos: ['Enalapril 10 mg'], sinTratamientos: false, cirugias: ' Apendicectomía ', notas: '',
}
const sinAntecedentes: RespuestasHistorial = { ...respuestasVacias, sinPadecimientos: true, sinAlergias: true, sinTratamientos: true }

/** Persistencia de prueba: guarda en el paciente de la lista, como el store en memoria. */
function almacen(inicial: Paciente[] = [pacienteA, pacienteB]) {
  const pacientes = inicial.map((p) => ({ ...p }))
  const guardar = (id: string, h: HistorialInicial) => {
    const p = pacientes.find((x) => x.id === id)!
    if (p.historialInicial) throw new HistorialYaEnviadoError()
    p.historialInicial = h
  }
  const de = (id: string) => pacientes.find((p) => p.id === id)!
  return { pacientes, guardar, de }
}
const enviar = (r: RespuestasHistorial, a = almacen(), id = 'pA', sesion = sesionA, guardar = a.guardar) =>
  enviarHistorial(r, { sesion, paciente: a.de(id), guardar, ahora: AHORA })

describe('PT10-N · CA-07 / CA-08 normal: envío completo', () => {
  it('se guarda una sola vez, con fecha, y la administradora lo ve en el expediente', async () => {
    const a = almacen()
    const r = await enviar(completas, a)
    expect(r.ok).toBe(true)
    expect(a.de('pA').historialInicial).toMatchObject({
      completadoEl: AHORA.toISOString(), padecimientos: ['Hipertensión'], alergias: ['Penicilina'], sinAlergias: false, tratamientos: ['Enalapril 10 mg'], cirugias: 'Apendicectomía',
    })
    expect(a.de('pA').historialInicial?.notas).toBeUndefined()
    expect(a.de('pB').historialInicial).toBeUndefined()
  })
})

describe('PT10-L · CA-08 límite: «no tengo» en los tres apartados', () => {
  it('la captura es válida y queda marcada como ausencia explícita', async () => {
    const a = almacen()
    expect(validarHistorial(sinAntecedentes)).toEqual({})
    const r = await enviar(sinAntecedentes, a)
    expect(r.ok).toBe(true)
    expect(a.de('pA').historialInicial).toMatchObject({ sinPadecimientos: true, sinAlergias: true, sinTratamientos: true, padecimientos: [], alergias: [], tratamientos: [] })
  })
})

describe('PT10-E · CA-08 error: apartado sin respuesta', () => {
  it('alergias vacías no equivalen a ninguna: se bloquea y se señala el apartado', async () => {
    const a = almacen()
    const r = await enviar({ ...completas, alergias: [], sinAlergias: false }, a)
    expect(r).toMatchObject({ ok: false, motivo: 'datos-invalidos', errores: { alergias: expect.any(String) } })
    expect(Object.keys((r as { errores: object }).errores)).toEqual(['alergias'])
    expect(a.de('pA').historialInicial).toBeUndefined()
  })
  it('un formulario vacío marca los tres apartados', () => {
    expect(Object.keys(validarHistorial(respuestasVacias)).sort()).toEqual(['alergias', 'padecimientos', 'tratamientos'])
  })
  it('elementos solo con espacios cuentan como vacíos', () => {
    expect(validarHistorial({ ...completas, padecimientos: ['  ', ''] }).padecimientos).toBeTruthy()
  })
  it('«no tengo» junto con elementos es contradictorio', () => {
    expect(validarHistorial({ ...completas, sinAlergias: true }).alergias).toBeTruthy()
  })
  it('limpia espacios y repetidos', () => {
    expect(limpiarLista([' Asma ', 'asma', 'Diabetes  tipo   2', ''])).toEqual(['Asma', 'Diabetes tipo 2'])
  })
})

describe('PT10 · CA-07 envío único', () => {
  it('límite: un historial ya enviado no se reenvía ni se edita', async () => {
    const a = almacen()
    expect((await enviar(completas, a)).ok).toBe(true)
    const antes = JSON.stringify(a.de('pA').historialInicial)
    const segundo = await enviar({ ...completas, alergias: ['Otra'] }, a)
    expect(segundo).toEqual({ ok: false, motivo: 'ya-enviado' })
    expect(JSON.stringify(a.de('pA').historialInicial)).toBe(antes)
  })
  it('error: una falla de guardado no confirma el envío y el reintento no lo duplica', async () => {
    const a = almacen()
    let intentos = 0
    const falla = () => { intentos++; throw new Error('red caída') }
    expect(await enviar(completas, a, 'pA', sesionA, falla)).toEqual({ ok: false, motivo: 'error-guardado' })
    expect(a.de('pA').historialInicial).toBeUndefined()
    expect((await enviar(completas, a)).ok).toBe(true)
    expect(await enviar(completas, a)).toEqual({ ok: false, motivo: 'ya-enviado' })
    expect(intentos).toBe(1)
  })
  it('dos envíos simultáneos producen un solo historial', async () => {
    const a = almacen()
    let guardados = 0
    const lento = async (id: string, h: HistorialInicial) => { await new Promise((r) => setTimeout(r, 5)); guardados++; a.guardar(id, h) }
    const [x, y] = await Promise.all([enviar(completas, a, 'pA', sesionA, lento), enviar(completas, a, 'pA', sesionA, lento)])
    expect([x.ok, y.ok].filter(Boolean)).toHaveLength(1)
    expect(guardados).toBe(1)
  })
  it('un conflicto reportado por la persistencia se trata como ya enviado', async () => {
    const a = almacen()
    const r = await enviar(completas, a, 'pA', sesionA, () => { throw new HistorialYaEnviadoError() })
    expect(r).toEqual({ ok: false, motivo: 'ya-enviado' })
  })
})

describe('CA-13 · quién puede enviar', () => {
  it('B no envía el historial de A y la administradora tampoco lo envía por el paciente', async () => {
    const a = almacen()
    expect(await enviar(completas, a, 'pA', sesionB)).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(await enviar(completas, a, 'pA', admin)).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(await enviarHistorial(completas, { sesion: null, paciente: a.de('pA'), guardar: a.guardar })).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(a.de('pA').historialInicial).toBeUndefined()
  })
  it('un paciente inexistente no se puede guardar', async () => {
    expect(await enviarHistorial(completas, { sesion: sesionA, paciente: undefined, guardar: () => undefined })).toEqual({ ok: false, motivo: 'sin-permiso' })
    void paciente
  })
})
