// Traducción entre la tabla public.paciente de Supabase y el tipo Paciente de la app.
import { describe, expect, it } from 'vitest'
import { aFila, aPaciente, insertarPaciente, type FilaPaciente } from '../src/data/pacientesSupabase'
import { aNuevoPaciente, CorreoDuplicadoError } from '../src/modules/pacientes/registro'
import type { DatosAlta } from '../src/modules/pacientes/validacion'

const alex: DatosAlta = {
  nombre: 'Alex', apellidoPaterno: 'Luna', apellidoMaterno: '', fechaNacimiento: '1990-01-20', sexo: 'X',
  nacionalidad: 'Canadiense', idioma: 'Inglés', telefono: '4770000101', email: 'alex.luna@example.com',
  padecimientoPrincipal: 'Dato de prueba', emNombre: 'Sam Luna', emParentesco: 'Hermano(a)', emTelefono: '4770000102',
}

/** Cliente mínimo con la forma de supabase.from(...).insert(...).select().single(). */
const cliente = (respuesta: { data: unknown; error: unknown }) =>
  ({ from: () => ({ insert: () => ({ select: () => ({ single: async () => respuesta }) }) }) }) as never

describe('Mapeo de paciente con Supabase', () => {
  it('ida y vuelta conserva los datos y deja nulo el segundo apellido vacío', () => {
    const nuevo = aNuevoPaciente(alex, false)
    const fila = aFila(nuevo)
    expect(fila.segundo_apellido).toBeNull()
    expect(fila).toMatchObject({ correo: 'alex.luna@example.com', emergencia_nombre: 'Sam Luna', estado: 'activo', portal: 'sin acceso' })
    const p = aPaciente({ ...fila, id: '7f1c2d4e-0000-4000-8000-000000000001', fecha_alta: '2026-11-05T10:00:00Z' } as FilaPaciente)
    expect(p).toMatchObject({ nombre: 'Alex', apellidoPaterno: 'Luna', apellidoMaterno: undefined, email: 'alex.luna@example.com',
      contactoEmergencia: { nombre: 'Sam Luna', parentesco: 'Hermano(a)', telefono: '4770000102' } })
    expect(p.color).toMatch(/^#/)
  })

  it('insertarPaciente lanza CorreoDuplicadoError ante el código 23505', async () => {
    const db = cliente({ data: null, error: { code: '23505', message: 'duplicate key' } })
    await expect(insertarPaciente(db, aNuevoPaciente(alex, false))).rejects.toBeInstanceOf(CorreoDuplicadoError)
  })

  it('insertarPaciente lanza un error genérico ante otros fallos', async () => {
    const db = cliente({ data: null, error: { code: '42501', message: 'permission denied' } })
    await expect(insertarPaciente(db, aNuevoPaciente(alex, false))).rejects.toThrow('permission denied')
  })
})
