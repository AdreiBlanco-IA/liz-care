// M06 Recetas y archivos · PT07 (RF-07: CA-05, CA-09): tipo y tamaño de la foto y entrega autorizada.
import { describe, expect, it } from 'vitest'
import { aArchivoReceta, entregarReceta, LIMITE_BYTES, validarArchivoReceta } from '../src/modules/recetas/archivo'
import { registrarAtencion, type DatosAtencion } from '../src/modules/citas/atenciones'
import { AHORA, admin, catalogo, consulta, medicamento, pacienteA, sesionA, sesionB } from './datos'

const MB = 1024 * 1024

describe('PT07-N · CA-05 normal: foto JPG válida', () => {
  it('se acepta y conserva sus metadatos', () => {
    expect(validarArchivoReceta({ nombre: 'receta.jpg', tipo: 'image/jpeg', tamano: 2 * MB })).toEqual({ ok: true, tipoMime: 'image/jpeg' })
    expect(aArchivoReceta({ nombre: 'receta.jpg', tipo: 'image/jpeg', tamano: 2 * MB }, 'blob:x')).toEqual({ url: 'blob:x', nombreOriginal: 'receta.jpg', tipoMime: 'image/jpeg', tamanoBytes: 2 * MB })
  })
  it('PNG y HEIC también se aceptan', () => {
    expect(validarArchivoReceta({ nombre: 'a.png', tipo: 'image/png', tamano: 1000 }).ok).toBe(true)
    expect(validarArchivoReceta({ nombre: 'a.heic', tipo: 'image/heic', tamano: 1000 }).ok).toBe(true)
  })
  it('un .heic que el navegador reporta sin tipo se acepta por su extensión', () => {
    expect(validarArchivoReceta({ nombre: 'IMG_0042.HEIC', tipo: '', tamano: 1000 })).toEqual({ ok: true, tipoMime: 'image/heic' })
  })
})

describe('PT07-L · CA-05 límite: exactamente 10 MB', () => {
  it('10 MB se acepta y un byte más se rechaza', () => {
    expect(validarArchivoReceta({ nombre: 'a.png', tipo: 'image/png', tamano: LIMITE_BYTES }).ok).toBe(true)
    expect(validarArchivoReceta({ nombre: 'a.png', tipo: 'image/png', tamano: LIMITE_BYTES + 1 })).toMatchObject({ ok: false, motivo: 'tamano' })
  })
})

describe('PT07-E · CA-05 error: archivo no admitido', () => {
  it('PDF, GIF, SVG o texto se rechazan aunque se llamen .jpg', () => {
    expect(validarArchivoReceta({ nombre: 'a.pdf', tipo: 'application/pdf', tamano: 1000 })).toMatchObject({ ok: false, motivo: 'tipo' })
    expect(validarArchivoReceta({ nombre: 'a.gif', tipo: 'image/gif', tamano: 1000 })).toMatchObject({ ok: false, motivo: 'tipo' })
    expect(validarArchivoReceta({ nombre: 'a.svg', tipo: 'image/svg+xml', tamano: 1000 })).toMatchObject({ ok: false, motivo: 'tipo' })
    expect(validarArchivoReceta({ nombre: 'a.jpg', tipo: 'text/plain', tamano: 1000 })).toMatchObject({ ok: false, motivo: 'tipo' })
  })
  it('un archivo vacío se rechaza', () => {
    expect(validarArchivoReceta({ nombre: 'a.png', tipo: 'image/png', tamano: 0 })).toMatchObject({ ok: false, motivo: 'vacio' })
  })
  it('aArchivoReceta devuelve null si no es válido', () => {
    expect(aArchivoReceta({ nombre: 'a.pdf', tipo: 'application/pdf', tamano: 10 }, 'blob:x')).toBeNull()
  })
  it('una consulta con una receta de 11 MB no se registra', async () => {
    const d: DatosAtencion = {
      pacienteId: 'pA', especialistaId: 'e1', fecha: '2026-11-10T16:00:00.000Z', motivo: 'Control', estado: 'completada', overview: 'Resumen',
      acompanamiento: true, traduccion: false,
      tratamiento: { medicamentos: [medicamento()], sinMedicamentos: false, indicacionesGenerales: '' },
      receta: { url: 'blob:x', nombreOriginal: 'a.png', tipoMime: 'image/png', tamanoBytes: 11 * MB },
    }
    let guardadas = 0
    const r = await registrarAtencion(d, { sesion: admin, pacientes: [pacienteA], especialistas: catalogo, ahora: AHORA, guardar: (c) => { guardadas++; return { ...c, id: 'c1' } } })
    expect(r).toMatchObject({ ok: false, motivo: 'datos-invalidos', errores: { receta: expect.any(String) } })
    expect(guardadas).toBe(0)
  })
})

describe('CA-09 · entrega autorizada de la receta', () => {
  const receta = { url: 'blob:privada', nombreOriginal: 'a.png', tipoMime: 'image/png', tamanoBytes: 10 }
  const deA = consulta('c1', 'pA', '2026-10-20T16:00:00.000Z', { receta })
  it('la administradora y el paciente dueño la reciben', () => {
    expect(entregarReceta(admin, deA)).toEqual({ ok: true, receta })
    expect(entregarReceta(sesionA, deA)).toEqual({ ok: true, receta })
  })
  it('el paciente B no recibe la receta de A', () => {
    expect(entregarReceta(sesionB, deA)).toEqual({ ok: false, motivo: 'recurso-ajeno' })
  })
  it('sin sesión se deniega sin revelar contenido', () => {
    const r = entregarReceta(null, deA)
    expect(r).toEqual({ ok: false, motivo: 'sin-sesion' })
    expect(JSON.stringify(r)).not.toContain('privada')
  })
  it('una consulta sin receta o inexistente no entrega nada', () => {
    expect(entregarReceta(sesionA, consulta('c2', 'pA', '2026-10-20T16:00:00.000Z'))).toEqual({ ok: false, motivo: 'sin-receta' })
    expect(entregarReceta(sesionA, undefined)).toEqual({ ok: false, motivo: 'sin-receta' })
  })
})
