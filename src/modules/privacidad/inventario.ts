// M10 Protección de datos · RNF-03 / CA-14: finalidad y minimización de cada dato, y registros sin datos clínicos.
// Esto documenta controles de diseño; no certifica el cumplimiento legal de la LFPDPPP (lo valida el responsable).
export type Rol = 'admin' | 'paciente'

export interface DatoInventariado {
  campo: string
  finalidad: string
  /** Dato de salud o que identifica una receta: acceso restringido. */
  sensible: boolean
  ven: Rol[]
}

export type Entidad = 'paciente' | 'historial' | 'consulta' | 'medicamento' | 'receta' | 'especialista'

const A: Rol[] = ['admin']
const AP: Rol[] = ['admin', 'paciente']

/** Todo campo del modelo debe aparecer aquí con su finalidad; las pruebas fallan si se agrega uno sin documentar. */
export const INVENTARIO: Record<Entidad, DatoInventariado[]> = {
  paciente: [
    { campo: 'id', finalidad: 'Identificar el expediente sin usar datos personales.', sensible: false, ven: AP },
    { campo: 'nombre', finalidad: 'Identificar al paciente ante la administradora y los especialistas.', sensible: false, ven: AP },
    { campo: 'apellidoPaterno', finalidad: 'Identificar al paciente.', sensible: false, ven: AP },
    { campo: 'apellidoMaterno', finalidad: 'Identificar al paciente cuando existe (opcional).', sensible: false, ven: AP },
    { campo: 'fechaNacimiento', finalidad: 'Distinguir homónimos y valorar la atención por edad.', sensible: false, ven: AP },
    { campo: 'sexo', finalidad: 'Orientar la atención médica y la elección del especialista.', sensible: false, ven: AP },
    { campo: 'nacionalidad', finalidad: 'Coordinar trámites y apoyo a pacientes extranjeros.', sensible: false, ven: AP },
    { campo: 'pais', finalidad: 'Código del país de origen para mostrar la bandera y el contacto internacional.', sensible: false, ven: AP },
    { campo: 'idioma', finalidad: 'Asignar especialistas y traducción en el idioma del paciente.', sensible: false, ven: AP },
    { campo: 'telefono', finalidad: 'Contactar al paciente para citas y seguimiento.', sensible: false, ven: AP },
    { campo: 'email', finalidad: 'Contacto, cuenta del portal y detección de duplicados.', sensible: false, ven: AP },
    { campo: 'padecimientoPrincipal', finalidad: 'Elegir el especialista adecuado en el primer contacto.', sensible: true, ven: AP },
    { campo: 'contactoEmergencia', finalidad: 'Avisar a una persona de confianza en una urgencia.', sensible: false, ven: AP },
    { campo: 'altaEl', finalidad: 'Registrar cuándo inició el servicio.', sensible: false, ven: A },
    { campo: 'activo', finalidad: 'Saber si el servicio sigue vigente (el expediente no se borra).', sensible: false, ven: A },
    { campo: 'portal', finalidad: 'Controlar si el paciente tiene acceso al portal.', sensible: false, ven: A },
    { campo: 'historialInicial', finalidad: 'Antecedentes médicos que el paciente envía una vez (ver historial).', sensible: true, ven: AP },
    { campo: 'color', finalidad: 'Color del avatar en pantalla; no es un dato del paciente y no se guarda en la base.', sensible: false, ven: A },
  ],
  historial: [
    { campo: 'completadoEl', finalidad: 'Constancia de cuándo se envió el historial inicial.', sensible: false, ven: AP },
    { campo: 'padecimientos', finalidad: 'Que los especialistas conozcan los antecedentes de salud.', sensible: true, ven: AP },
    { campo: 'sinPadecimientos', finalidad: 'Distinguir «no tengo» de una respuesta omitida.', sensible: true, ven: AP },
    { campo: 'alergias', finalidad: 'Evitar reacciones a medicamentos o alimentos.', sensible: true, ven: AP },
    { campo: 'sinAlergias', finalidad: 'Distinguir «no tengo» de una respuesta omitida.', sensible: true, ven: AP },
    { campo: 'tratamientos', finalidad: 'Evitar duplicar o contraindicar tratamientos previos.', sensible: true, ven: AP },
    { campo: 'sinTratamientos', finalidad: 'Distinguir «no tengo» de una respuesta omitida.', sensible: true, ven: AP },
    { campo: 'cirugias', finalidad: 'Conocer cirugías y hospitalizaciones previas (opcional).', sensible: true, ven: AP },
    { campo: 'notas', finalidad: 'Información adicional que el paciente quiera compartir (opcional).', sensible: true, ven: AP },
  ],
  consulta: [
    { campo: 'id', finalidad: 'Identificar la cita o consulta.', sensible: false, ven: AP },
    { campo: 'pacienteId', finalidad: 'Vincular la atención con un solo paciente y verificar propiedad.', sensible: false, ven: AP },
    { campo: 'especialistaId', finalidad: 'Saber qué especialista atiende o atendió.', sensible: false, ven: AP },
    { campo: 'fecha', finalidad: 'Ordenar la agenda y el historial.', sensible: false, ven: AP },
    { campo: 'motivo', finalidad: 'Saber para qué es la cita o consulta.', sensible: true, ven: AP },
    { campo: 'overview', finalidad: 'Resumen de la consulta realizada o indicaciones previas de la cita.', sensible: true, ven: AP },
    { campo: 'notaVisible', finalidad: 'Indicaciones que el paciente debe leer en su portal.', sensible: true, ven: AP },
    { campo: 'notaInterna', finalidad: 'Observaciones de la administración; no se envían al portal.', sensible: true, ven: A },
    { campo: 'estado', finalidad: 'Distinguir cita programada de consulta realizada.', sensible: false, ven: AP },
    { campo: 'tratamiento', finalidad: 'Medicamentos e indicaciones de la consulta (ver medicamento).', sensible: true, ven: AP },
    { campo: 'receta', finalidad: 'Foto de la receta de la consulta (ver receta).', sensible: true, ven: AP },
    { campo: 'acompanamiento', finalidad: 'Saber si Liz Care acompaña al paciente a la cita.', sensible: false, ven: AP },
    { campo: 'traduccion', finalidad: 'Saber si se necesita traducción durante la cita.', sensible: false, ven: AP },
  ],
  medicamento: [
    { campo: 'nombre', finalidad: 'Indicar qué medicamento se prescribió.', sensible: true, ven: AP },
    { campo: 'dosis', finalidad: 'Indicar la cantidad por toma.', sensible: true, ven: AP },
    { campo: 'frecuencia', finalidad: 'Indicar cada cuánto se toma.', sensible: true, ven: AP },
    { campo: 'duracion', finalidad: 'Indicar por cuánto tiempo se toma.', sensible: true, ven: AP },
    { campo: 'indicaciones', finalidad: 'Instrucciones específicas de uso.', sensible: true, ven: AP },
    { campo: 'horarios', finalidad: 'Mostrar en qué momentos del día se toma.', sensible: true, ven: AP },
    { campo: 'medicamentos', finalidad: 'Lista de medicamentos del tratamiento.', sensible: true, ven: AP },
    { campo: 'sinMedicamentos', finalidad: 'Indicar expresamente que la consulta no tuvo medicamentos.', sensible: true, ven: AP },
    { campo: 'indicacionesGenerales', finalidad: 'Recomendaciones generales posteriores a la consulta.', sensible: true, ven: AP },
  ],
  receta: [
    { campo: 'url', finalidad: 'Referencia privada con la que se muestra la foto; no es un enlace público.', sensible: true, ven: AP },
    { campo: 'nombreOriginal', finalidad: 'Nombre del archivo cargado.', sensible: false, ven: A },
    { campo: 'tipoMime', finalidad: 'Comprobar que el archivo sea JPG, PNG o HEIC.', sensible: false, ven: A },
    { campo: 'tamanoBytes', finalidad: 'Comprobar el límite de 10 MB.', sensible: false, ven: A },
  ],
  especialista: [
    { campo: 'id', finalidad: 'Identificar al especialista del catálogo.', sensible: false, ven: AP },
    { campo: 'nombre', finalidad: 'Mostrar quién atiende al paciente.', sensible: false, ven: AP },
    { campo: 'especialidad', finalidad: 'Buscar y asignar por especialidad.', sensible: false, ven: AP },
    { campo: 'foto', finalidad: 'Fotografía profesional opcional para reconocer al médico.', sensible: false, ven: AP },
    { campo: 'institucion', finalidad: 'Indicar dónde se atiende.', sensible: false, ven: AP },
    { campo: 'sector', finalidad: 'Distinguir atención pública o privada.', sensible: false, ven: AP },
    { campo: 'direccion', finalidad: 'Indicar cómo llegar a la consulta.', sensible: false, ven: AP },
    { campo: 'telefono', finalidad: 'Contacto profesional del consultorio.', sensible: false, ven: AP },
    { campo: 'idiomas', finalidad: 'Buscar y asignar por idioma.', sensible: false, ven: AP },
  ],
}

/** Campos del objeto que no tienen finalidad documentada en el inventario. */
export function camposSinFinalidad(entidad: Entidad, objeto: object): string[] {
  const declarados = new Set(INVENTARIO[entidad].filter((d) => d.finalidad.trim()).map((d) => d.campo))
  return Object.keys(objeto).filter((k) => !declarados.has(k))
}

/** Campos que la vista de cada rol puede mostrar; lo que no está aquí no debe viajar a esa vista. */
export const camposVisiblesPara = (entidad: Entidad, rol: Rol) => INVENTARIO[entidad].filter((d) => d.ven.includes(rol)).map((d) => d.campo)

// ── Registro de errores sin datos clínicos ni credenciales ───────────────────────────────────

const PATRONES: [RegExp, string][] = [
  [/\beyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/g, '[token]'],
  [/\b(bearer|token|apikey|api_key|authorization)\b\s*[:=]?\s*\S+/gi, '$1=[oculto]'],
  [/\b(password|contrase(?:ñ|n)a|pwd)\b\s*[:=]\s*\S+/gi, '$1=[oculto]'],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[correo]'],
  [/\+?\d[\d\s().-]{6,}\d/g, '[teléfono]'],
]

/** Quita correos, teléfonos, tokens, contraseñas y los textos clínicos indicados de un mensaje antes de registrarlo. */
export function sanearParaRegistro(texto: string, datosClinicos: string[] = []): string {
  let s = texto
  for (const dato of datosClinicos) {
    const limpio = dato.trim()
    if (limpio.length >= 3) s = s.split(limpio).join('[dato clínico]')
  }
  for (const [re, con] of PATRONES) s = s.replace(re, con)
  return s
}

export interface Incidente { id: string; mensaje: string }

let contador = 0
/** CA-14: devuelve un identificador técnico y un mensaje sin información clínica ni credenciales. */
export function registrarIncidente(error: unknown, contexto: string, datosClinicos: string[] = [], escribir: (l: string) => void = (l) => console.error(l)): Incidente {
  contador += 1
  const id = `INC-${Date.now().toString(36).toUpperCase()}-${contador}`
  const crudo = error instanceof Error ? error.message : String(error)
  const mensaje = sanearParaRegistro(`${contexto}: ${crudo}`, datosClinicos)
  escribir(`[${id}] ${mensaje}`)
  return { id, mensaje }
}
