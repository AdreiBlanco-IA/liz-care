import { asset } from '../lib/asset'
import type { Administrador, ArchivoReceta, Consulta, Especialista, Paciente } from './types'

function at(offsetDays: number, hhmm = '10:00'): string {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

/** Receta precargada de demostración (PNG de ejemplo con la marca «EJEMPLO»). */
const recetaEjemplo: ArchivoReceta = {
  url: asset('images/receta-ejemplo.png'), nombreOriginal: 'receta-ejemplo.png', tipoMime: 'image/png', tamanoBytes: 629556,
}

export const administradores: Administrador[] = [
  { id: 'a1', nombre: 'Liz Hernández', email: 'liz@lizcare.mx' },
  { id: 'a2', nombre: 'Daniela Ríos', email: 'daniela@lizcare.mx' },
]

export const especialistas: Especialista[] = [
  {
    id: 'e1', nombre: 'Dr. Andrés Villalobos Ruiz', especialidad: 'Cardiología', foto: asset('images/doctores/dr-1.jpg'),
    institucion: 'Hospital San Rafael', sector: 'Privado', direccion: 'Blvd. Campestre 1200, León, Gto.',
    telefono: '477 123 4501', idiomas: ['Español', 'Inglés'],
  },
  {
    id: 'e2', nombre: 'Dra. Mariana Ortega Lugo', especialidad: 'Dermatología', foto: asset('images/doctores/dr-2.jpg'),
    institucion: 'Centro Médico Los Arcos', sector: 'Privado', direccion: 'Av. Los Arcos 410, León, Gto.',
    telefono: '477 123 4502', idiomas: ['Español', 'Inglés'],
  },
  {
    id: 'e3', nombre: 'Dr. Luis Herrera Soto', especialidad: 'Medicina general', foto: asset('images/doctores/dr-3.jpg'),
    institucion: 'Hospital General de Zona (IMSS)', sector: 'Público', direccion: 'Blvd. Adolfo López Mateos 1800, León, Gto.',
    telefono: '477 123 4503', idiomas: ['Español'],
  },
  {
    id: 'e4', nombre: 'Dra. Sofía Castañeda Prieto', especialidad: 'Ginecología', foto: asset('images/doctores/dr-4.jpg'),
    institucion: 'Hospital Santa Lucía', sector: 'Privado', direccion: 'Calle Madero 215, Centro, León, Gto.',
    telefono: '477 123 4504', idiomas: ['Español', 'Inglés', 'Francés'],
  },
  {
    id: 'e5', nombre: 'Dr. Ernesto Ramírez Gallardo', especialidad: 'Endocrinología', foto: asset('images/doctores/dr-5.jpg'),
    institucion: 'Hospital Regional de Especialidades', sector: 'Público', direccion: 'Blvd. Milenio 900, León, Gto.',
    telefono: '477 123 4505', idiomas: ['Español', 'Inglés'],
  },
  {
    id: 'e6', nombre: 'Dra. Paola Méndez Arriaga', especialidad: 'Neumología', foto: asset('images/doctores/dr-6.jpg'),
    institucion: 'Clínica Médica del Valle', sector: 'Privado', direccion: 'Blvd. Juan Alonso de Torres 1500, León, Gto.',
    telefono: '477 123 4506', idiomas: ['Español', 'Inglés'],
  },
  {
    id: 'e7', nombre: 'Dr. Javier Montaño Ibarra', especialidad: 'Traumatología y ortopedia', foto: asset('images/doctores/dr-7.jpg'),
    institucion: 'Hospital San Rafael', sector: 'Privado', direccion: 'Blvd. Campestre 1200, León, Gto.',
    telefono: '477 123 4507', idiomas: ['Español', 'Inglés', 'Alemán'],
  },
]

export const pacientesIniciales: Paciente[] = [
  {
    id: 'p1', nombre: 'Emily', apellidoPaterno: 'Carter', fechaNacimiento: '1985-03-14', sexo: 'F',
    nacionalidad: 'Estadounidense', pais: 'US', idioma: 'Inglés', telefono: '+1 512 555 0142', email: 'emily@demo.com',
    padecimientoPrincipal: 'Hipertensión arterial', altaEl: at(-120), activo: true, portal: 'activo', color: '#00a58c',
    contactoEmergencia: { nombre: 'David Carter', parentesco: 'Esposo', telefono: '+1 512 555 0199' },
    historialInicial: {
      completadoEl: at(-118), padecimientos: ['Hipertensión arterial (desde 2019)', 'Migraña ocasional'],
      sinPadecimientos: false, sinAlergias: false, alergias: ['Penicilina', 'Mariscos'], sinTratamientos: false,
      tratamientos: ['Enalapril 10 mg (2019–2024)', 'Sumatriptán 50 mg según necesidad'],
      cirugias: 'Apendicectomía (2008)',
    },
  },
  {
    id: 'p2', nombre: 'Hans', apellidoPaterno: 'Müller', fechaNacimiento: '1958-11-02', sexo: 'M',
    nacionalidad: 'Alemana', pais: 'DE', idioma: 'Alemán', telefono: '+49 151 2345 6789', email: 'hans@demo.com',
    padecimientoPrincipal: 'Dolor de rodilla derecha', altaEl: at(-6), activo: true, portal: 'activo', color: '#3b6fd8',
    contactoEmergencia: { nombre: 'Greta Müller', parentesco: 'Hija', telefono: '+49 151 9876 5432' },
  },
  {
    id: 'p3', nombre: 'Sophie', apellidoPaterno: 'Laurent', fechaNacimiento: '1992-07-21', sexo: 'F',
    nacionalidad: 'Francesa', pais: 'FR', idioma: 'Francés', telefono: '+33 6 12 34 56 78', email: 'sophie.laurent@mail.fr',
    padecimientoPrincipal: 'Control prenatal', altaEl: at(-60), activo: true, portal: 'activo', color: '#d1497b',
    contactoEmergencia: { nombre: 'Julien Laurent', parentesco: 'Pareja', telefono: '+33 6 98 76 54 32' },
    historialInicial: {
      completadoEl: at(-58), padecimientos: ['Hipotiroidismo'], sinPadecimientos: false, sinAlergias: true, alergias: [], sinTratamientos: false,
      tratamientos: ['Levotiroxina 50 mcg diaria'],
    },
  },
  {
    id: 'p4', nombre: 'Kenji', apellidoPaterno: 'Tanaka', fechaNacimiento: '1979-01-30', sexo: 'M',
    nacionalidad: 'Japonesa', pais: 'JP', idioma: 'Inglés', telefono: '+81 90 1234 5678', email: 'k.tanaka@mail.jp',
    padecimientoPrincipal: 'Diabetes tipo 2', altaEl: at(-200), activo: true, portal: 'activo', color: '#e0812b',
    contactoEmergencia: { nombre: 'Yuki Tanaka', parentesco: 'Esposa', telefono: '+81 90 8765 4321' },
    historialInicial: {
      completadoEl: at(-198), padecimientos: ['Diabetes tipo 2 (desde 2016)'], sinPadecimientos: false, sinAlergias: false, alergias: ['Sulfas'], sinTratamientos: false,
      tratamientos: ['Metformina 850 mg dos veces al día'],
    },
  },
  {
    id: 'p5', nombre: 'Michael', apellidoPaterno: "O'Brien", fechaNacimiento: '1966-05-09', sexo: 'M',
    nacionalidad: 'Canadiense', pais: 'CA', idioma: 'Inglés', telefono: '+1 416 555 0175', email: 'mobrien@mail.ca',
    padecimientoPrincipal: 'EPOC', altaEl: at(-90), activo: true, portal: 'invitado', color: '#7b5cd6',
    contactoEmergencia: { nombre: 'Claire O\'Brien', parentesco: 'Esposa', telefono: '+1 416 555 0122' },
  },
  {
    id: 'p6', nombre: 'Laura', apellidoPaterno: 'Gómez', apellidoMaterno: 'Rivera', fechaNacimiento: '1974-09-17', sexo: 'F',
    nacionalidad: 'Mexicana', pais: 'MX', idioma: 'Español', telefono: '+52 477 555 0110', email: 'laura.gomez@mail.mx',
    padecimientoPrincipal: 'Dermatitis atópica', altaEl: at(-45), activo: true, portal: 'activo', color: '#0f8fb3',
    contactoEmergencia: { nombre: 'Ricardo Gómez', parentesco: 'Hermano', telefono: '+52 477 555 0111' },
    historialInicial: {
      completadoEl: at(-44), padecimientos: ['Dermatitis atópica', 'Asma leve'], sinPadecimientos: false, sinAlergias: false, alergias: ['Ácaros', 'Níquel'], sinTratamientos: false,
      tratamientos: ['Salbutamol inhalado según necesidad'],
    },
  },
  {
    id: 'p7', nombre: 'Ana', apellidoPaterno: 'Ferreira', fechaNacimiento: '1988-12-03', sexo: 'F',
    nacionalidad: 'Brasileña', pais: 'BR', idioma: 'Portugués', telefono: '+55 11 91234 5678', email: 'ana.ferreira@mail.br',
    padecimientoPrincipal: 'Hipotiroidismo', altaEl: at(-15), activo: true, portal: 'invitado', color: '#2f9e5b',
    contactoEmergencia: { nombre: 'Paulo Ferreira', parentesco: 'Padre', telefono: '+55 11 99876 5432' },
  },
  {
    id: 'p8', nombre: 'Olivia', apellidoPaterno: 'Smith', fechaNacimiento: '1953-04-25', sexo: 'F',
    nacionalidad: 'Británica', pais: 'GB', idioma: 'Inglés', telefono: '+44 7700 900123', email: 'olivia.smith@mail.uk',
    padecimientoPrincipal: 'Artrosis de cadera', altaEl: at(-310), activo: false, portal: 'sin acceso', color: '#a0703c',
    contactoEmergencia: { nombre: 'George Smith', parentesco: 'Hijo', telefono: '+44 7700 900456' },
    historialInicial: {
      completadoEl: at(-305), padecimientos: ['Artrosis de cadera', 'Osteoporosis'], sinPadecimientos: false, sinAlergias: true, alergias: [], sinTratamientos: false,
      tratamientos: ['Alendronato 70 mg semanal', 'Paracetamol 500 mg según dolor'],
    },
  },
]

export const consultasIniciales: Consulta[] = [
  {
    id: 'c1', pacienteId: 'p1', especialistaId: 'e3', fecha: at(-110, '09:30'), estado: 'completada',
    motivo: 'Valoración inicial y referencia', acompanamiento: true, traduccion: true,
    overview: 'Primera consulta en México. Presión arterial de 145/92. Se solicitan estudios de laboratorio y se refiere a cardiología.',
    notaVisible: 'Llevar los resultados de laboratorio a la cita con cardiología.',
    notaInterna: 'Paciente nerviosa con el sistema público; prefiere atención privada para seguimiento.',
  },
  {
    id: 'c2', pacienteId: 'p1', especialistaId: 'e1', fecha: at(-82, '11:00'), estado: 'completada',
    motivo: 'Evaluación cardiológica', acompanamiento: true, traduccion: true,
    overview: 'Electrocardiograma normal. Hipertensión grado 1. Se inicia tratamiento y se recomienda dieta baja en sodio.',
    notaVisible: 'Medir la presión en casa 3 veces por semana y anotarla.',
    tratamiento: {
      medicamentos: [
        { nombre: 'Losartán', dosis: '50 mg', frecuencia: 'Cada 24 horas', duracion: '30 días', indicaciones: 'Tomar por la mañana con un vaso de agua.', horarios: ['mañana'] },
      ],
      indicacionesGenerales: 'Reducir sal, caminar 30 minutos diarios y evitar el alcohol.',
    },
    receta: recetaEjemplo,
  },
  {
    id: 'c3', pacienteId: 'p1', especialistaId: 'e2', fecha: at(-35, '16:30'), estado: 'completada',
    motivo: 'Lesión en la piel del brazo', acompanamiento: true, traduccion: false,
    overview: 'Lunar benigno en antebrazo izquierdo. Sin cambios sospechosos. Control en 12 meses.',
    notaVisible: 'Usar protector solar FPS 50 diariamente.',
  },
  {
    id: 'c4', pacienteId: 'p1', especialistaId: 'e1', fecha: at(-7, '10:30'), estado: 'completada',
    motivo: 'Seguimiento de hipertensión', acompanamiento: true, traduccion: true,
    overview: 'Presión 130/85, mejoría respecto a la consulta anterior. Colesterol LDL elevado; se agrega estatina y antiagregante.',
    notaVisible: 'Excelente avance. Continuar con el registro de presión en casa.',
    notaInterna: 'Confirmar con la farmacia del hospital disponibilidad de atorvastatina genérica.',
    tratamiento: {
      medicamentos: [
        { nombre: 'Losartán', dosis: '50 mg', frecuencia: 'Cada 24 horas', duracion: '30 días', indicaciones: 'Tomar 1 tableta por la mañana.', horarios: ['mañana'] },
        { nombre: 'Ácido acetilsalicílico', dosis: '100 mg', frecuencia: 'Cada 24 horas', duracion: '30 días', indicaciones: 'Tomar con la comida para evitar molestias estomacales.', horarios: ['tarde'] },
        { nombre: 'Atorvastatina', dosis: '20 mg', frecuencia: 'Cada 24 horas', duracion: 'Indefinido', indicaciones: 'Tomar en la noche antes de dormir.', horarios: ['noche'] },
      ],
      indicacionesGenerales: 'Dieta baja en sodio y grasas saturadas. Volver a medir colesterol en 3 meses. Acudir a urgencias si presenta dolor de pecho o presión mayor a 160/100.',
    },
    receta: recetaEjemplo,
  },
  {
    id: 'c5', pacienteId: 'p1', especialistaId: 'e5', fecha: at(6, '12:00'), estado: 'programada',
    motivo: 'Revisión de tiroides y metabolismo', acompanamiento: true, traduccion: true,
    overview: 'Llevar estudios de laboratorio en ayunas.',
  },
  {
    id: 'c6', pacienteId: 'p1', especialistaId: 'e1', fecha: at(34, '10:30'), estado: 'programada',
    motivo: 'Control cardiológico mensual', acompanamiento: true, traduccion: true, overview: '',
  },
  {
    id: 'c7', pacienteId: 'p2', especialistaId: 'e7', fecha: at(0, '13:00'), estado: 'programada',
    motivo: 'Dolor de rodilla derecha', acompanamiento: true, traduccion: true, overview: 'Llevar radiografía previa (Alemania, 2025).',
  },
  {
    id: 'c8', pacienteId: 'p3', especialistaId: 'e4', fecha: at(0, '09:00'), estado: 'programada',
    motivo: 'Control prenatal — semana 24', acompanamiento: true, traduccion: true, overview: '',
  },
  {
    id: 'c9', pacienteId: 'p3', especialistaId: 'e4', fecha: at(-28, '09:00'), estado: 'completada',
    motivo: 'Control prenatal — semana 20', acompanamiento: true, traduccion: true,
    overview: 'Ultrasonido estructural normal. Crecimiento adecuado.',
    tratamiento: {
      medicamentos: [
        { nombre: 'Ácido fólico', dosis: '5 mg', frecuencia: 'Cada 24 horas', duracion: 'Hasta el parto', indicaciones: 'Tomar en ayunas.', horarios: ['mañana'] },
        { nombre: 'Hierro', dosis: '60 mg', frecuencia: 'Cada 24 horas', duracion: '60 días', indicaciones: 'Tomar con jugo de naranja, no con lácteos.', horarios: ['tarde'] },
      ],
      indicacionesGenerales: 'Hidratación abundante y reposo relativo.',
    },
    receta: recetaEjemplo,
  },
  {
    id: 'c10', pacienteId: 'p4', especialistaId: 'e5', fecha: at(0, '17:30'), estado: 'programada',
    motivo: 'Control de diabetes', acompanamiento: true, traduccion: true, overview: 'Llevar glucometría de las últimas 2 semanas.',
  },
  {
    id: 'c11', pacienteId: 'p4', especialistaId: 'e5', fecha: at(-60, '17:00'), estado: 'completada',
    motivo: 'Control de diabetes', acompanamiento: true, traduccion: true,
    overview: 'HbA1c 7.4%. Se ajusta metformina y se refuerza plan alimenticio.',
    tratamiento: {
      medicamentos: [
        { nombre: 'Metformina', dosis: '850 mg', frecuencia: 'Cada 12 horas', duracion: 'Indefinido', indicaciones: 'Tomar con desayuno y cena.', horarios: ['mañana', 'noche'] },
      ],
      indicacionesGenerales: 'Revisar glucosa en ayunas diario.',
    },
  },
  {
    id: 'c12', pacienteId: 'p5', especialistaId: 'e6', fecha: at(2, '11:30'), estado: 'programada',
    motivo: 'Espirometría de control', acompanamiento: true, traduccion: true, overview: 'No usar broncodilatador 6 h antes.',
  },
  {
    id: 'c13', pacienteId: 'p6', especialistaId: 'e2', fecha: at(3, '16:00'), estado: 'programada',
    motivo: 'Brote de dermatitis', acompanamiento: false, traduccion: false, overview: '',
  },
  {
    id: 'c14', pacienteId: 'p7', especialistaId: 'e5', fecha: at(1, '10:00'), estado: 'programada',
    motivo: 'Valoración de hipotiroidismo', acompanamiento: true, traduccion: true, overview: '',
  },
  {
    id: 'c15', pacienteId: 'p5', especialistaId: 'e3', fecha: at(-20, '08:30'), estado: 'completada',
    motivo: 'Tos persistente', acompanamiento: true, traduccion: false,
    overview: 'Exacerbación leve de EPOC. Se refiere a neumología.',
  },
  {
    id: 'c16', pacienteId: 'p8', especialistaId: 'e7', fecha: at(-150, '12:00'), estado: 'completada',
    motivo: 'Dolor de cadera', acompanamiento: true, traduccion: true,
    overview: 'Artrosis grado III. Se recomienda fisioterapia y valorar reemplazo articular en su país de origen.',
  },
  {
    id: 'c17', pacienteId: 'p2', especialistaId: 'e3', fecha: at(4, '09:00'), estado: 'programada',
    motivo: 'Chequeo general', acompanamiento: true, traduccion: true, overview: '',
  },
]

export const credencialesDemo = {
  admin: { email: 'liz@lizcare.mx', password: 'admin123' },
  admin2: { email: 'daniela@lizcare.mx', password: 'admin123' },
  paciente: { email: 'emily@demo.com', password: 'demo123' },
  pacienteNuevo: { email: 'hans@demo.com', password: 'demo123' },
}
