export type Sector = 'Público' | 'Privado'

export interface Especialista {
  id: string
  nombre: string
  especialidad: string
  foto?: string
  institucion: string
  sector: Sector
  direccion: string
  telefono: string
  idiomas: string[]
}

export interface Administrador {
  id: string
  nombre: string
  email: string
}

export interface ContactoEmergencia {
  nombre: string
  parentesco: string
  telefono: string
}

export interface HistorialInicial {
  completadoEl: string
  padecimientos: string[]
  sinAlergias: boolean
  alergias: string[]
  tratamientos: string[]
  cirugias?: string
  notas?: string
}

export interface Paciente {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  fechaNacimiento: string
  sexo: 'F' | 'M' | 'X'
  nacionalidad: string
  pais: string
  idioma: string
  telefono: string
  email: string
  padecimientoPrincipal: string
  contactoEmergencia: ContactoEmergencia
  altaEl: string
  activo: boolean
  portal: 'activo' | 'invitado' | 'sin acceso'
  historialInicial?: HistorialInicial
  color: string
}

export interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
  indicaciones: string
  horarios: ('mañana' | 'tarde' | 'noche')[]
}

export interface Tratamiento {
  medicamentos: Medicamento[]
  indicacionesGenerales: string
}

export type EstadoConsulta = 'programada' | 'completada' | 'cancelada'

export interface Consulta {
  id: string
  pacienteId: string
  especialistaId: string
  fecha: string
  motivo: string
  overview: string
  notaVisible?: string
  notaInterna?: string
  estado: EstadoConsulta
  tratamiento?: Tratamiento
  recetaFoto?: string
  acompanamiento: boolean
  traduccion: boolean
}

export type Rol = 'admin' | 'paciente'

export interface Sesion {
  rol: Rol
  nombre: string
  email: string
  pacienteId?: string
}
