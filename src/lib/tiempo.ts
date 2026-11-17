// Hora local de León, Guanajuato. v4 (supuesto, CA-11): una cita es «próxima» según el día en León,
// sin importar la zona horaria del navegador. México no usa horario de verano desde 2022.
export const ZONA_LEON = 'America/Mexico_City'

const formato = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_LEON, year: 'numeric', month: '2-digit', day: '2-digit' })

/** Día calendario (AAAA-MM-DD) de un instante, en hora de León. */
export function diaEnLeon(instante: Date | string): string {
  return formato.format(typeof instante === 'string' ? new Date(instante) : instante)
}
