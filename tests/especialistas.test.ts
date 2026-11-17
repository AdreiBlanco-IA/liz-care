// M11 Especialistas · PT14 (RF-11 / HU-08 / CA-16): alta, búsqueda por especialidad e idioma, y datos faltantes.
import { describe, expect, it } from 'vitest'
import type { Especialista } from '../src/data/types'
import {
  buscarEspecialistas, datosEspecialistaVacios, especialidadesDe, idiomasDe, registrarEspecialista, separarIdiomas,
  validarEspecialista, type DatosEspecialista, type NuevoEspecialista,
} from '../src/modules/especialistas/catalogo'
import { registrarAtencion } from '../src/modules/citas/atenciones'
import { AHORA, admin, catalogo, pacienteA, sesionA } from './datos'

const doctora: DatosEspecialista = {
  nombre: 'Dra. Ana López', especialidad: 'Pediatría', institucion: 'Clínica demo', sector: 'Privado',
  direccion: 'León, Gto.', telefono: '477 000 0001', idiomas: 'Español, Inglés',
}

function almacen() {
  const lista: Especialista[] = [...catalogo]
  const guardar = (e: NuevoEspecialista) => { const n = { ...e, id: `e${lista.length + 1}` }; lista.push(n); return n }
  return { lista, guardar }
}

describe('PT14-N · CA-16 normal: alta y asignación a una cita', () => {
  it('queda en el catálogo con identificador y puede asignarse a una cita', async () => {
    const a = almacen()
    const r = await registrarEspecialista(doctora, { sesion: admin, guardar: a.guardar })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(a.lista.at(-1)).toEqual(r.especialista)
    expect(r.especialista.idiomas).toEqual(['Español', 'Inglés'])
    const cita = await registrarAtencion(
      { pacienteId: 'pA', especialistaId: r.especialista.id, fecha: '2026-11-20T16:00:00.000Z', motivo: 'Control', estado: 'programada', overview: '', acompanamiento: true, traduccion: false },
      { sesion: admin, pacientes: [pacienteA], especialistas: a.lista, guardar: (c) => ({ ...c, id: 'c1' }), ahora: AHORA },
    )
    expect(cita.ok).toBe(true)
  })
  it('la dirección es opcional', () => {
    expect(validarEspecialista({ ...doctora, direccion: '' })).toEqual({})
  })
})

describe('PT14-L · CA-16 límite: búsqueda por especialidad e idioma', () => {
  it('con ambos filtros solo salen quienes cumplen los dos', () => {
    expect(buscarEspecialistas(catalogo, { especialidad: 'dermato', idioma: 'francés' }).map((e) => e.id)).toEqual(['e2'])
    expect(buscarEspecialistas(catalogo, { idioma: 'Inglés' }).map((e) => e.id)).toEqual(['e1', 'e2'])
  })
  it('no distingue mayúsculas ni acentos', () => {
    expect(buscarEspecialistas(catalogo, { especialidad: 'CARDIOLOGIA', idioma: 'ingles' }).map((e) => e.id)).toEqual(['e1'])
  })
  it('sin coincidencias el resultado es vacío y no sugiere otros', () => {
    expect(buscarEspecialistas(catalogo, { especialidad: 'Cardiología', idioma: 'Francés' })).toEqual([])
    expect(buscarEspecialistas(catalogo, { especialidad: 'Neurología' })).toEqual([])
  })
  it('sin filtros devuelve todo el catálogo', () => {
    expect(buscarEspecialistas(catalogo, {})).toHaveLength(3)
  })
  it('lista especialidades e idiomas sin repetir', () => {
    expect(especialidadesDe(catalogo)).toEqual(['Cardiología', 'Dermatología', 'Medicina general'])
    expect(idiomasDe(catalogo)).toEqual(['Español', 'Francés', 'Inglés'])
  })
})

describe('PT14-E · CA-16 error: datos faltantes', () => {
  it('sin nombre o sin especialidad se señala el dato y no se agrega al catálogo', async () => {
    const a = almacen()
    const sinNombre = await registrarEspecialista({ ...doctora, nombre: '  ' }, { sesion: admin, guardar: a.guardar })
    const sinEsp = await registrarEspecialista({ ...doctora, especialidad: '' }, { sesion: admin, guardar: a.guardar })
    expect(sinNombre).toMatchObject({ ok: false, motivo: 'datos-invalidos', errores: { nombre: expect.any(String) } })
    expect(sinEsp).toMatchObject({ ok: false, motivo: 'datos-invalidos', errores: { especialidad: expect.any(String) } })
    expect(a.lista).toHaveLength(3)
  })
  it('un formulario vacío marca todos los obligatorios menos la dirección', () => {
    expect(Object.keys(validarEspecialista(datosEspecialistaVacios)).sort()).toEqual(['especialidad', 'idiomas', 'institucion', 'nombre', 'telefono'])
  })
  it('los idiomas solo con comas o espacios no cuentan', () => {
    expect(validarEspecialista({ ...doctora, idiomas: ' , ,' }).idiomas).toBeTruthy()
    expect(separarIdiomas('Español,  inglés , Español, INGLÉS')).toEqual(['Español', 'inglés'])
  })
  it('CA-13: el paciente no puede registrar especialistas', async () => {
    const a = almacen()
    expect(await registrarEspecialista(doctora, { sesion: sesionA, guardar: a.guardar })).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(await registrarEspecialista(doctora, { sesion: null, guardar: a.guardar })).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(a.lista).toHaveLength(3)
  })
  it('una falla de guardado no confirma el alta', async () => {
    const r = await registrarEspecialista(doctora, { sesion: admin, guardar: () => { throw new Error('red') } })
    expect(r).toEqual({ ok: false, motivo: 'error-guardado' })
  })
})
