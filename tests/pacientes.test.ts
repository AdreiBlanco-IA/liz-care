// PT01 · RF-01 / HU-01 / CA-01 (+ CA-13): pruebas del alta de pacientes del módulo M02.
// Datos ficticios de la práctica; los teléfonos no pertenecen a personas reales.
import { describe, expect, it } from 'vitest'
import type { Paciente, Sesion } from '../src/data/types'
import { CorreoDuplicadoError, registrarPaciente, type NuevoPaciente } from '../src/modules/pacientes/registro'
import { buscarDuplicados, normalizarAlta, validarAlta, type DatosAlta } from '../src/modules/pacientes/validacion'

const HOY = new Date('2026-11-03T12:00:00')
const admin: Sesion = { rol: 'admin', nombre: 'Liz Hernández', email: 'liz@lizcare.mx' }
const paciente: Sesion = { rol: 'paciente', nombre: 'Emily Carter', email: 'emily@demo.com', pacienteId: 'p1' }

const alex: DatosAlta = {
  nombre: 'Alex', apellidoPaterno: 'Luna', apellidoMaterno: 'Sol', fechaNacimiento: '1990-01-20', sexo: 'X',
  nacionalidad: 'Canadiense', idioma: 'Inglés', telefono: '4770000101', email: 'alex.luna@example.com',
  padecimientoPrincipal: 'Dato de prueba', emNombre: 'Sam Luna', emParentesco: 'Hermano(a)', emTelefono: '4770000102',
}

/** Persistencia de prueba equivalente al store en memoria del prototipo. */
function almacen(inicial: Paciente[] = []) {
  const pacientes = [...inicial]
  const guardar = (p: NuevoPaciente) => {
    const nuevo: Paciente = { ...p, id: `p${pacientes.length + 1}`, altaEl: HOY.toISOString(), color: '#00a58c' }
    pacientes.push(nuevo)
    return nuevo
  }
  return { pacientes, guardar }
}

const alta = (d: DatosAlta, a = almacen(), extra: Partial<Parameters<typeof registrarPaciente>[1]> = {}) =>
  registrarPaciente(d, { sesion: admin, pacientes: a.pacientes, guardar: a.guardar, invitarAlPortal: false, hoy: HOY, ...extra })

describe('PT01-N · CA-01 normal: alta válida', () => {
  it('crea un solo paciente con identificador y conserva datos y contacto de emergencia', async () => {
    const a = almacen()
    const r = await alta(alex, a)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(a.pacientes).toHaveLength(1)
    expect(r.paciente.id).toBeTruthy()
    // Volver a abrir la ficha: se recupera el mismo registro por su identificador.
    const ficha = a.pacientes.find((p) => p.id === r.paciente.id)
    expect(ficha).toMatchObject({
      nombre: 'Alex', apellidoPaterno: 'Luna', apellidoMaterno: 'Sol', email: 'alex.luna@example.com', pais: 'CA',
      contactoEmergencia: { nombre: 'Sam Luna', parentesco: 'Hermano(a)', telefono: '4770000102' },
    })
  })

  it('normaliza espacios y guarda el correo en minúsculas sin alterar acentos', async () => {
    const a = almacen()
    const r = await alta({ ...alex, nombre: '  María   José ', email: ' Alex.Luna@Example.COM ' }, a)
    expect(r.ok && r.paciente.nombre).toBe('María José')
    expect(r.ok && r.paciente.email).toBe('alex.luna@example.com')
  })
})

describe('PT01-L · CA-01 límite: un solo apellido', () => {
  it('acepta el alta con segundo apellido vacío', async () => {
    const a = almacen()
    const r = await alta({ ...alex, apellidoMaterno: '' }, a)
    expect(r.ok).toBe(true)
    expect(a.pacientes[0].apellidoMaterno).toBeUndefined()
  })
})

describe('PT01-E · CA-01 error: correo duplicado', () => {
  it('bloquea un correo ya registrado aunque cambien mayúsculas o espacios', async () => {
    const a = almacen()
    await alta(alex, a)
    const r = await alta({ ...alex, nombre: 'Otra', email: '  ALEX.luna@example.com ' }, a)
    expect(r).toMatchObject({ ok: false, motivo: 'correo-duplicado' })
    expect(a.pacientes).toHaveLength(1)
  })

  it('no permite forzar el duplicado de correo con la confirmación de homónimo', async () => {
    const a = almacen()
    await alta(alex, a)
    const r = await alta(alex, a, { confirmaHomonimo: true })
    expect(r).toMatchObject({ ok: false, motivo: 'correo-duplicado' })
    expect(a.pacientes).toHaveLength(1)
  })

  it('mismo nombre y fecha con otro correo solo advierte y se puede confirmar', async () => {
    const a = almacen()
    await alta(alex, a)
    const otro = { ...alex, email: 'otra.persona@example.com' }
    expect(await alta(otro, a)).toMatchObject({ ok: false, motivo: 'posible-homonimo' })
    expect(a.pacientes).toHaveLength(1)
    expect((await alta(otro, a, { confirmaHomonimo: true })).ok).toBe(true)
    expect(a.pacientes).toHaveLength(2)
  })

  it('compartir solo el nombre no cuenta como duplicado', () => {
    const existente = { ...alex, email: 'x@example.com', fechaNacimiento: '1985-05-05' }
    const a = almacen()
    a.guardar({ ...normalizarAlta(existente), sexo: 'X', pais: 'CA', apellidoMaterno: undefined,
      contactoEmergencia: { nombre: 'Sam Luna', parentesco: 'Hermano(a)', telefono: '4770000102' }, activo: true, portal: 'sin acceso' })
    expect(buscarDuplicados(alex, a.pacientes)).toEqual({ porCorreo: [], porNombre: [] })
  })
})

describe('PT01-E2 · CA-01 error: datos obligatorios faltantes o inválidos', () => {
  it.each([
    ['nombre'], ['apellidoPaterno'], ['fechaNacimiento'], ['email'], ['telefono'], ['padecimientoPrincipal'],
    ['emNombre'], ['emParentesco'], ['emTelefono'],
  ] as [keyof DatosAlta][])('rechaza el alta sin %s y no guarda nada', async (campo) => {
    const a = almacen()
    const r = await alta({ ...alex, [campo]: '   ' }, a)
    expect(r.ok).toBe(false)
    if (r.ok || r.motivo !== 'datos-invalidos') throw new Error(`motivo inesperado: ${JSON.stringify(r)}`)
    expect(r.errores[campo]).toBe('Este campo es obligatorio.')
    expect(a.pacientes).toHaveLength(0)
  })

  it('rechaza correo con formato inválido y fecha de nacimiento futura', () => {
    const e = validarAlta({ ...alex, email: 'alex@', fechaNacimiento: '2026-11-04' }, HOY)
    expect(e.email).toBe('Escribe un correo válido.')
    expect(e.fechaNacimiento).toBe('La fecha no puede ser futura.')
  })

  it('acepta como nacimiento la fecha de hoy', () => {
    expect(validarAlta({ ...alex, fechaNacimiento: '2026-11-03' }, HOY).fechaNacimiento).toBeUndefined()
  })
})

describe('PT01-E3 · CA-13: alta sin permiso', () => {
  it.each([['sin sesión', null], ['con sesión de paciente', paciente]] as const)('deniega el alta %s', async (_, sesion) => {
    const a = almacen()
    const r = await alta(alex, a, { sesion })
    expect(r).toEqual({ ok: false, motivo: 'sin-permiso' })
    expect(a.pacientes).toHaveLength(0)
  })
})

describe('PT01-E4 · CA-01: fallo de persistencia', () => {
  it('no confirma éxito si el guardado falla y el reintento crea un solo registro', async () => {
    const a = almacen()
    let falla = true
    const guardar = (p: NuevoPaciente) => {
      if (falla) throw new Error('fallo simulado de almacenamiento')
      return a.guardar(p)
    }
    expect(await alta(alex, a, { guardar })).toEqual({ ok: false, motivo: 'error-guardado' })
    expect(a.pacientes).toHaveLength(0)
    falla = false
    expect((await alta(alex, a, { guardar })).ok).toBe(true)
    expect(a.pacientes).toHaveLength(1)
    expect(await alta(alex, a, { guardar })).toMatchObject({ ok: false, motivo: 'correo-duplicado' })
  })
})

describe('PT01-E5 · CA-01: duplicado detectado por la base de datos', () => {
  it('convierte el rechazo del índice único de correo en correo-duplicado', async () => {
    const guardar = () => { throw new CorreoDuplicadoError() }
    expect(await alta(alex, almacen(), { guardar })).toEqual({ ok: false, motivo: 'correo-duplicado', existentes: [] })
  })
})
