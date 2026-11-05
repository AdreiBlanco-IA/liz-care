// Persistencia de pacientes en Supabase (tabla public.paciente). Traduce entre filas y el tipo Paciente de la app.
import type { SupabaseClient } from '@supabase/supabase-js'
import { CorreoDuplicadoError, type NuevoPaciente } from '../modules/pacientes/registro'
import type { Paciente } from './types'

export interface FilaPaciente {
  id: string
  nombres: string
  primer_apellido: string
  segundo_apellido: string | null
  nacimiento: string
  sexo: 'F' | 'M' | 'X'
  nacionalidad: string
  pais: string
  idioma: string
  telefono: string
  correo: string
  emergencia_nombre: string
  emergencia_parentesco: string
  emergencia_telefono: string
  padecimiento_principal: string
  estado: 'activo' | 'terminado'
  portal: Paciente['portal']
  fecha_alta: string
}

const COLORES = ['#00a58c', '#3b6fd8', '#d1497b', '#e0812b', '#7b5cd6', '#0f8fb3', '#2f9e5b']

/** Color de avatar estable a partir del id: no se guarda en la base porque no es un dato del paciente. */
function colorDe(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORES[h % COLORES.length]
}

export function aFila(p: NuevoPaciente): Omit<FilaPaciente, 'id' | 'fecha_alta'> {
  return {
    nombres: p.nombre, primer_apellido: p.apellidoPaterno, segundo_apellido: p.apellidoMaterno ?? null,
    nacimiento: p.fechaNacimiento, sexo: p.sexo, nacionalidad: p.nacionalidad, pais: p.pais, idioma: p.idioma,
    telefono: p.telefono, correo: p.email, emergencia_nombre: p.contactoEmergencia.nombre,
    emergencia_parentesco: p.contactoEmergencia.parentesco, emergencia_telefono: p.contactoEmergencia.telefono,
    padecimiento_principal: p.padecimientoPrincipal, estado: p.activo ? 'activo' : 'terminado', portal: p.portal,
  }
}

export function aPaciente(f: FilaPaciente): Paciente {
  return {
    id: f.id, nombre: f.nombres, apellidoPaterno: f.primer_apellido, apellidoMaterno: f.segundo_apellido ?? undefined,
    fechaNacimiento: f.nacimiento, sexo: f.sexo, nacionalidad: f.nacionalidad, pais: f.pais, idioma: f.idioma,
    telefono: f.telefono, email: f.correo, padecimientoPrincipal: f.padecimiento_principal,
    contactoEmergencia: { nombre: f.emergencia_nombre, parentesco: f.emergencia_parentesco, telefono: f.emergencia_telefono },
    altaEl: f.fecha_alta, activo: f.estado === 'activo', portal: f.portal, color: colorDe(f.id),
  }
}

/** Inserta y devuelve el paciente confirmado por la base. El índice único de correo responde 23505. */
export async function insertarPaciente(db: SupabaseClient, p: NuevoPaciente): Promise<Paciente> {
  const { data, error } = await db.from('paciente').insert(aFila(p)).select().single<FilaPaciente>()
  if (error) throw error.code === '23505' ? new CorreoDuplicadoError() : new Error(error.message)
  return aPaciente(data)
}

export async function listarPacientes(db: SupabaseClient): Promise<Paciente[]> {
  const { data, error } = await db.from('paciente').select('*').order('fecha_alta', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as FilaPaciente[]).map(aPaciente)
}
