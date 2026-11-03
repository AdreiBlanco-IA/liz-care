import type { Consulta, Paciente } from '../data/types'

export type Lang = 'es' | 'en'

const loc = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-MX')

export function nombreCompleto(p: Pick<Paciente, 'nombre' | 'apellidoPaterno' | 'apellidoMaterno'>) {
  return [p.nombre, p.apellidoPaterno, p.apellidoMaterno].filter(Boolean).join(' ')
}

export function iniciales(nombre: string) {
  return nombre.replace(/^(Dr|Dra)\.\s+/, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export function edad(fechaNacimiento: string) {
  const n = new Date(fechaNacimiento)
  const h = new Date()
  let e = h.getFullYear() - n.getFullYear()
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--
  return e
}

export function fechaLarga(iso: string, lang: Lang = 'es') {
  const s = new Date(iso).toLocaleDateString(loc(lang), { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function fechaCorta(iso: string, lang: Lang = 'es') {
  return new Date(iso).toLocaleDateString(loc(lang), { day: 'numeric', month: 'short', year: 'numeric' })
}

export function hora(iso: string, lang: Lang = 'es') {
  return new Date(iso).toLocaleTimeString(loc(lang), { hour: '2-digit', minute: '2-digit', hourCycle: lang === 'en' ? 'h12' : 'h23' })
}

export function diaMes(iso: string, lang: Lang = 'es') {
  const d = new Date(iso)
  return {
    dia: d.getDate(),
    mes: d.toLocaleDateString(loc(lang), { month: 'short' }).replace('.', ''),
    semana: d.toLocaleDateString(loc(lang), { weekday: 'short' }).replace('.', ''),
  }
}

export function mismoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function relativo(iso: string, lang: Lang = 'es') {
  const d = new Date(iso)
  const hoy = new Date()
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const b = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()
  const dias = Math.round((a - b) / 86400000)
  return new Intl.RelativeTimeFormat(loc(lang), { numeric: 'auto' }).format(dias, 'day')
}

export const porFechaAsc = (a: Consulta, b: Consulta) => +new Date(a.fecha) - +new Date(b.fecha)
export const porFechaDesc = (a: Consulta, b: Consulta) => +new Date(b.fecha) - +new Date(a.fecha)

export function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
