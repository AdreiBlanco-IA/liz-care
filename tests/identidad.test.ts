// M01 Identidad y permisos · PT04 (RF-04: CA-04, CA-09, CA-10) y PT12 (RNF-02: CA-04, CA-09, CA-13).
import { describe, expect, it } from 'vitest'
import { DURACION_SESION_MS, iniciarSesionEnMemoria, MENSAJE_ACCESO_NEGADO, sesionVigente } from '../src/modules/identidad/autenticacion'
import { autorizar, puedeAbrirRuta, rutaInicial } from '../src/modules/identidad/permisos'
import { AHORA, admin, pacienteA, pacienteB, sesionA, sesionB } from './datos'

const base = {
  administradores: [{ id: 'a1', nombre: 'Liz Hernández', email: 'liz@lizcare.mx' }],
  pacientes: [pacienteA, pacienteB, { ...pacienteB, id: 'pC', email: 'cesar@example.com', portal: 'invitado' as const }, { ...pacienteB, id: 'pD', email: 'dana@example.com', activo: false }],
  passwordDemo: { admin: 'admin123', paciente: 'demo123' },
  ahora: AHORA,
}
const entrar = (email: string, password: string, rol: 'admin' | 'paciente' = 'paciente') => iniciarSesionEnMemoria({ ...base, email, password, rol })

describe('PT04-N · CA-10 normal: credenciales correctas abren el portal de su rol', () => {
  it('el paciente A entra y su sesión apunta solo a sus datos', () => {
    const r = entrar('pa@example.com', 'demo123')
    expect(r.ok).toBe(true)
    if (r.ok) { expect(r.sesion.rol).toBe('paciente'); expect(r.sesion.pacienteId).toBe('pA'); expect(rutaInicial(r.sesion.rol)).toBe('/portal') }
  })
  it('la administradora entra al panel; el correo no distingue mayúsculas ni espacios', () => {
    const r = entrar('  LIZ@lizcare.mx ', 'admin123', 'admin')
    expect(r.ok && r.sesion.rol).toBe('admin')
    expect(rutaInicial('admin')).toBe('/admin')
  })
  it('CA-04 límite: A sale y entra B; B solo recibe su identificador', () => {
    const a = entrar('pa@example.com', 'demo123')
    const b = entrar('pb@example.com', 'demo123')
    expect(a.ok && a.sesion.pacienteId).toBe('pA')
    expect(b.ok && b.sesion.pacienteId).toBe('pB')
  })
})

describe('PT04-E · CA-10 error: se niega el acceso sin decir qué dato falló', () => {
  it('campos vacíos', () => {
    expect(entrar('', '')).toEqual({ ok: false, motivo: 'campos-vacios' })
    expect(entrar('pa@example.com', '')).toEqual({ ok: false, motivo: 'campos-vacios' })
    expect(entrar('', 'demo123')).toEqual({ ok: false, motivo: 'campos-vacios' })
  })
  it('contraseña incorrecta o cuenta inexistente dan el mismo resultado', () => {
    expect(entrar('pa@example.com', 'mala')).toEqual({ ok: false, motivo: 'credenciales' })
    expect(entrar('nadie@example.com', 'demo123')).toEqual({ ok: false, motivo: 'credenciales' })
  })
  it('un mismo mensaje para todos los casos de error', () => {
    expect(MENSAJE_ACCESO_NEGADO).not.toMatch(/correo es|contraseña es|no existe/i)
  })
  it('un paciente sin acceso al portal o con servicio terminado no entra', () => {
    expect(entrar('cesar@example.com', 'demo123').ok).toBe(false)
    expect(entrar('dana@example.com', 'demo123').ok).toBe(false)
  })
  it('una cuenta de paciente no entra por el acceso de administración y viceversa', () => {
    expect(entrar('pa@example.com', 'demo123', 'admin').ok).toBe(false)
    expect(entrar('liz@lizcare.mx', 'admin123', 'paciente').ok).toBe(false)
  })
})

describe('PT04 / CA-09 · rutas privadas', () => {
  it('sin sesión se pide iniciar sesión (límite: sesión recién cerrada)', () => {
    expect(puedeAbrirRuta(null, '/portal/expediente')).toEqual({ permitido: false, motivo: 'sin-sesion' })
    expect(puedeAbrirRuta(null, '/admin/pacientes/pA')).toEqual({ permitido: false, motivo: 'sin-sesion' })
  })
  it('las rutas públicas están abiertas', () => {
    expect(puedeAbrirRuta(null, '/').permitido).toBe(true)
    expect(puedeAbrirRuta(null, '/login').permitido).toBe(true)
  })
  it('cada rol solo abre su zona', () => {
    expect(puedeAbrirRuta(sesionA, '/portal').permitido).toBe(true)
    expect(puedeAbrirRuta(sesionA, '/admin')).toEqual({ permitido: false, motivo: 'rol-insuficiente' })
    expect(puedeAbrirRuta(admin, '/admin/agenda').permitido).toBe(true)
    expect(puedeAbrirRuta(admin, '/portal')).toEqual({ permitido: false, motivo: 'rol-insuficiente' })
  })
  it('la sesión expira pasado el límite', () => {
    const s = { ...sesionA, iniciadaEl: AHORA.toISOString() }
    expect(sesionVigente(s, new Date(AHORA.getTime() + DURACION_SESION_MS - 1000))).toBe(true)
    expect(sesionVigente(s, new Date(AHORA.getTime() + DURACION_SESION_MS + 1000))).toBe(false)
    expect(sesionVigente(null)).toBe(false)
  })
})

describe('PT12 · RNF-02 autorización por rol y propiedad', () => {
  it('CA-09 normal: la administradora lee cualquier expediente y el dueño el suyo', () => {
    expect(autorizar(admin, 'paciente:leer', { pacienteId: 'pA' }).permitido).toBe(true)
    expect(autorizar(admin, 'paciente:leer', { pacienteId: 'pB' }).permitido).toBe(true)
    expect(autorizar(sesionA, 'paciente:leer', { pacienteId: 'pA' }).permitido).toBe(true)
  })
  it('CA-04 error: A intenta abrir datos de B con un identificador directo', () => {
    for (const accion of ['paciente:leer', 'atencion:leer', 'tratamiento:leer', 'receta:leer', 'historial:leer'] as const) {
      expect(autorizar(sesionA, accion, { pacienteId: 'pB' })).toEqual({ permitido: false, motivo: 'recurso-ajeno' })
    }
  })
  it('un identificador ausente no acredita propiedad', () => {
    expect(autorizar(sesionA, 'paciente:leer').permitido).toBe(false)
  })
  it('CA-09 error: sin sesión se deniega todo', () => {
    expect(autorizar(null, 'paciente:leer', { pacienteId: 'pA' })).toEqual({ permitido: false, motivo: 'sin-sesion' })
    expect(autorizar(undefined, 'receta:leer', { pacienteId: 'pA' })).toEqual({ permitido: false, motivo: 'sin-sesion' })
  })
  it('CA-13 error: el paciente no usa funciones administrativas ni escribe consultas, tratamiento o receta', () => {
    for (const accion of ['paciente:crear', 'paciente:listar', 'especialista:escribir', 'especialista:leer', 'atencion:escribir', 'tratamiento:escribir', 'receta:escribir'] as const) {
      expect(autorizar(sesionA, accion, { pacienteId: 'pA' })).toEqual({ permitido: false, motivo: 'rol-insuficiente' })
    }
  })
  it('CA-13: el paciente solo envía su propio historial inicial; la administradora no lo envía por él', () => {
    expect(autorizar(sesionA, 'historial:enviar', { pacienteId: 'pA' }).permitido).toBe(true)
    expect(autorizar(sesionA, 'historial:enviar', { pacienteId: 'pB' }).permitido).toBe(false)
    expect(autorizar(sesionB, 'historial:enviar', { pacienteId: 'pB' }).permitido).toBe(true)
    expect(autorizar(admin, 'historial:enviar', { pacienteId: 'pA' }).permitido).toBe(false)
  })
  it('la administradora ejecuta todas las funciones de gestión', () => {
    for (const accion of ['paciente:crear', 'paciente:listar', 'especialista:escribir', 'atencion:escribir', 'tratamiento:escribir', 'receta:escribir'] as const) {
      expect(autorizar(admin, accion).permitido).toBe(true)
    }
  })
})
