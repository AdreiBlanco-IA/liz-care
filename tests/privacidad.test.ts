// M10 Protección de datos · PT13 (RNF-03: CA-09, CA-14): finalidad de cada dato y registros sin datos clínicos.
import { describe, expect, it } from 'vitest'
import { pacientesIniciales, consultasIniciales, especialistas } from '../src/data/mock'
import { camposSinFinalidad, camposVisiblesPara, INVENTARIO, registrarIncidente, sanearParaRegistro } from '../src/modules/privacidad/inventario'
import { respuestasVacias, aHistorial } from '../src/modules/historial-inicial/historial'
import { obtenerExpediente } from '../src/modules/expedientes/expediente'
import { medicamento, pacienteA, sesionA } from './datos'

describe('PT13-N · CA-14 normal: cada dato tiene una finalidad documentada', () => {
  it('toda finalidad del inventario está escrita', () => {
    for (const [entidad, campos] of Object.entries(INVENTARIO)) {
      for (const c of campos) expect(c.finalidad.trim().length, `${entidad}.${c.campo}`).toBeGreaterThan(10)
    }
  })
  it('todo campo de los datos reales del prototipo aparece en el inventario', () => {
    for (const p of pacientesIniciales) expect(camposSinFinalidad('paciente', p), p.id).toEqual([])
    for (const p of pacientesIniciales) if (p.historialInicial) expect(camposSinFinalidad('historial', p.historialInicial), p.id).toEqual([])
    for (const c of consultasIniciales) expect(camposSinFinalidad('consulta', c), c.id).toEqual([])
    for (const c of consultasIniciales) if (c.tratamiento) expect(camposSinFinalidad('medicamento', c.tratamiento), c.id).toEqual([])
    for (const c of consultasIniciales) for (const m of c.tratamiento?.medicamentos ?? []) expect(camposSinFinalidad('medicamento', m)).toEqual([])
    for (const c of consultasIniciales) if (c.receta) expect(camposSinFinalidad('receta', c.receta)).toEqual([])
    for (const e of especialistas) expect(camposSinFinalidad('especialista', e), e.id).toEqual([])
  })
  it('lo que produce M03 también está documentado', () => {
    expect(camposSinFinalidad('historial', aHistorial(respuestasVacias, new Date()))).toEqual([])
    expect(camposSinFinalidad('medicamento', medicamento())).toEqual([])
  })
  it('un campo nuevo sin documentar se detecta', () => {
    expect(camposSinFinalidad('paciente', { ...pacienteA, curp: 'XXXX' })).toEqual(['curp'])
  })
})

describe('PT13-L · el paciente no recibe campos reservados a la administración', () => {
  it('la vista del paciente no incluye campos que el inventario marca solo para administración', () => {
    const ocultos = INVENTARIO.consulta.filter((c) => !c.ven.includes('paciente')).map((c) => c.campo)
    expect(ocultos).toContain('notaInterna')
    const r = obtenerExpediente(sesionA, 'p1', { pacientes: pacientesIniciales, consultas: consultasIniciales })
    expect(r.ok).toBe(false) // A (pA) no puede abrir p1
    const propia = obtenerExpediente({ ...sesionA, pacienteId: 'p1' }, 'p1', { pacientes: pacientesIniciales, consultas: consultasIniciales })
    if (!propia.ok) throw new Error('debería abrir su propio expediente')
    for (const c of propia.expediente.realizadas) for (const campo of ocultos) expect(campo in c).toBe(false)
  })
  it('lista los campos visibles por rol', () => {
    expect(camposVisiblesPara('consulta', 'paciente')).not.toContain('notaInterna')
    expect(camposVisiblesPara('consulta', 'admin')).toContain('notaInterna')
  })
})

describe('PT13-E · CA-14: mensajes y registros sin datos clínicos ni credenciales', () => {
  it('quita correos, teléfonos, contraseñas y tokens', () => {
    const s = sanearParaRegistro('fallo con alex@example.com tel +52 477 000 0000 password=secreto123 Bearer abc.def.ghi y eyJhbGciOiJIUzI1.eyJzdWIiOiIxMjM0.SflKxwRJSMeKKF2QT4')
    expect(s).not.toMatch(/alex@example|477 000|secreto123|abc\.def|eyJhbG/)
    expect(s).toContain('[correo]')
  })
  it('quita los textos clínicos indicados', () => {
    expect(sanearParaRegistro('no se pudo guardar: alergia a Penicilina', ['Penicilina'])).toBe('no se pudo guardar: alergia a [dato clínico]')
  })
  it('el incidente devuelve un identificador técnico y un mensaje limpio', () => {
    const lineas: string[] = []
    const i = registrarIncidente(new Error('insert falló para ana@example.com con Metformina 850 mg'), 'guardar consulta', ['Metformina 850 mg'], (l) => lineas.push(l))
    expect(i.id).toMatch(/^INC-/)
    expect(lineas).toHaveLength(1)
    expect(lineas[0]).toContain(i.id)
    expect(lineas[0]).not.toMatch(/ana@example|Metformina/)
  })
  it('los identificadores de incidente no se repiten', () => {
    const a = registrarIncidente('x', 'a', [], () => undefined)
    const b = registrarIncidente('x', 'a', [], () => undefined)
    expect(a.id).not.toBe(b.id)
  })
})
