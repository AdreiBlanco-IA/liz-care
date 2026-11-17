// M05 Tratamientos · PT08 (RF-08: CA-05) y PT09 (RF-09: CA-04, CA-06).
import { describe, expect, it } from 'vitest'
import { medicamentoVacio, ultimoTratamiento, validarMedicamento, validarTratamiento } from '../src/modules/tratamientos/tratamiento'
import { consulta, medicamento } from './datos'

const entrada = (meds = [medicamento('Medicamento demo 1'), medicamento('Medicamento demo 2')], sin = false) => ({ medicamentos: meds, sinMedicamentos: sin, indicacionesGenerales: '  Reposo  ' })

describe('PT08-N · CA-05: dos medicamentos válidos', () => {
  it('se aceptan y se limpian los espacios', () => {
    const r = validarTratamiento(entrada([{ ...medicamento('  Medicamento demo 1 '), dosis: ' 50 mg ' }, medicamento('Medicamento demo 2')]))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.tratamiento.medicamentos.map((m) => m.nombre)).toEqual(['Medicamento demo 1', 'Medicamento demo 2'])
    expect(r.tratamiento.medicamentos[0].dosis).toBe('50 mg')
    expect(r.tratamiento.indicacionesGenerales).toBe('Reposo')
    expect(r.tratamiento.sinMedicamentos).toBeUndefined()
  })
  it('una fila completamente en blanco no cuenta como medicamento', () => {
    const r = validarTratamiento(entrada([medicamento('Medicamento demo 1'), medicamentoVacio()]))
    expect(r.ok && r.tratamiento.medicamentos).toHaveLength(1)
  })
})

describe('PT08-L · CA-05 límite: consulta sin medicamentos', () => {
  it('la ausencia queda indicada expresamente', () => {
    const r = validarTratamiento(entrada([medicamentoVacio()], true))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.tratamiento).toMatchObject({ medicamentos: [], sinMedicamentos: true })
  })
})

describe('PT08-E · CA-05 error: datos faltantes', () => {
  it('medicamento sin nombre', () => {
    const r = validarTratamiento(entrada([medicamento('Medicamento demo 1'), { ...medicamento(''), nombre: '' }]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errores.medicamentos[1].nombre).toBeTruthy()
  })
  it('medicamento sin indicaciones, dosis, frecuencia o duración', () => {
    expect(validarMedicamento({ ...medicamento(), indicaciones: '' }).indicaciones).toBeTruthy()
    expect(validarMedicamento({ ...medicamento(), dosis: ' ' }).dosis).toBeTruthy()
    expect(validarMedicamento({ ...medicamento(), frecuencia: '' }).frecuencia).toBeTruthy()
    expect(validarMedicamento({ ...medicamento(), duracion: '' }).duracion).toBeTruthy()
    expect(validarMedicamento(medicamento())).toEqual({})
  })
  it('sin medicamentos y sin la marca «Sin medicamentos» no se acepta (no se deduce de una lista vacía)', () => {
    const r = validarTratamiento(entrada([medicamentoVacio()], false))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errores.general).toBeTruthy()
  })
  it('medicamentos escritos y «Sin medicamentos» a la vez es contradictorio', () => {
    const r = validarTratamiento(entrada([medicamento()], true))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errores.general).toBeTruthy()
  })
})

describe('PT09 · CA-06: último tratamiento', () => {
  const trat = (nombre: string) => ({ medicamentos: [medicamento(nombre)], indicacionesGenerales: '' })

  it('normal: una consulta antigua capturada al final no reemplaza a la más reciente', () => {
    const lista = [
      consulta('c1', 'pA', '2026-09-10T16:00:00.000Z', { tratamiento: trat('Medicamento reciente') }),
      consulta('c2', 'pA', '2026-10-20T16:00:00.000Z', { tratamiento: trat('Medicamento intermedio') }),
      consulta('c3', 'pA', '2026-08-01T16:00:00.000Z', { tratamiento: trat('Medicamento antiguo') }), // capturada al final
    ]
    const r = ultimoTratamiento(lista, 'pA')
    expect(r.estado).toBe('con-tratamiento')
    if (r.estado === 'con-tratamiento') { expect(r.consulta.id).toBe('c2'); expect(r.tratamiento.medicamentos[0].nombre).toBe('Medicamento intermedio') }
  })
  it('una cita futura no reemplaza al tratamiento de la última consulta realizada', () => {
    const lista = [consulta('c1', 'pA', '2026-10-20T16:00:00.000Z', { tratamiento: trat('Medicamento demo') }), consulta('c2', 'pA', '2026-12-20T16:00:00.000Z', { estado: 'programada' })]
    expect(ultimoTratamiento(lista, 'pA')).toMatchObject({ estado: 'con-tratamiento', consulta: { id: 'c1' } })
  })
  it('límite: sin consultas se indica que no hay tratamiento', () => {
    expect(ultimoTratamiento([], 'pA')).toEqual({ estado: 'sin-consultas' })
    expect(ultimoTratamiento([consulta('c1', 'pB', '2026-10-20T16:00:00.000Z', { tratamiento: trat('Medicamento demo') })], 'pA')).toEqual({ estado: 'sin-consultas' })
  })
  it('límite: la última consulta sin tratamiento no muestra el de otra', () => {
    const lista = [consulta('c1', 'pA', '2026-09-10T16:00:00.000Z', { tratamiento: trat('Medicamento antiguo') }), consulta('c2', 'pA', '2026-10-20T16:00:00.000Z')]
    const r = ultimoTratamiento(lista, 'pA')
    expect(r.estado).toBe('sin-tratamiento')
    expect(r).not.toHaveProperty('tratamiento')
  })
  it('una última consulta sin medicamentos se reconoce como tratamiento con la ausencia indicada', () => {
    const lista = [consulta('c1', 'pA', '2026-10-20T16:00:00.000Z', { tratamiento: { medicamentos: [], sinMedicamentos: true, indicacionesGenerales: 'Reposo' } })]
    const r = ultimoTratamiento(lista, 'pA')
    expect(r.estado === 'con-tratamiento' && r.tratamiento.sinMedicamentos).toBe(true)
  })
  it('error: nunca mezcla pacientes', () => {
    const lista = [consulta('cB', 'pB', '2026-11-01T16:00:00.000Z', { tratamiento: trat('Medicamento de B') }), consulta('cA', 'pA', '2026-10-01T16:00:00.000Z', { tratamiento: trat('Medicamento de A') })]
    expect(ultimoTratamiento(lista, 'pA')).toMatchObject({ consulta: { id: 'cA' } })
  })
})
