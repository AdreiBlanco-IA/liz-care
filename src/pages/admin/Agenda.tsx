import { CalendarDays, ChevronLeft, ChevronRight, Languages, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState, PageHeader, cx } from '../../components/ui'
import { hora, mismoDia, nombreCompleto, porFechaAsc } from '../../lib/format'
import { useStore } from '../../lib/store'

const H_INI = 8
const H_FIN = 20
const ROW = 60

function inicioSemana(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

export default function Agenda() {
  const { consultas, pacientes, especialistas } = useStore()
  const hoy = new Date()
  const [semana, setSemana] = useState(() => inicioSemana(hoy))
  const [diaSel, setDiaSel] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))

  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(semana); d.setDate(d.getDate() + i); return d }), [semana])
  const visibles = consultas
  const deDia = (d: Date) => visibles.filter((c) => mismoDia(new Date(c.fecha), d)).sort(porFechaAsc)
  const pac = (id: string) => pacientes.find((p) => p.id === id)!
  const esp = (id: string) => especialistas.find((e) => e.id === id)!

  const mover = (n: number) => {
    const s = new Date(semana); s.setDate(s.getDate() + n * 7); setSemana(s)
    const d = new Date(diaSel); d.setDate(d.getDate() + n * 7); setDiaSel(d)
  }
  const irHoy = () => { setSemana(inicioSemana(hoy)); setDiaSel(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) }

  const rango = `${dias[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${dias[6].toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
  const ahoraTop = (hoy.getHours() + hoy.getMinutes() / 60 - H_INI) * ROW

  return (
    <>
      <PageHeader title="Agenda" subtitle="Citas y consultas de todos tus pacientes"
        actions={<ButtonLink to="/admin/consultas/nueva"><Plus className="size-4" /> Nueva cita</ButtonLink>} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-1">
            <button onClick={() => mover(-1)} className="grid size-9 place-items-center rounded-full hover:bg-ink-100" aria-label="Semana anterior"><ChevronLeft className="size-5" /></button>
            <button onClick={() => mover(1)} className="grid size-9 place-items-center rounded-full hover:bg-ink-100" aria-label="Semana siguiente"><ChevronRight className="size-5" /></button>
          </div>
          <p className="font-bold capitalize">{rango}</p>
          <Button variant="outline" size="sm" className="ml-auto" onClick={irHoy}>Hoy</Button>
        </div>

        {/* Móvil: selector de día + lista */}
        <div className="md:hidden">
          <div className="grid grid-cols-7 gap-1 border-b border-ink-100 p-2">
            {dias.map((d) => {
              const sel = mismoDia(d, diaSel); const n = deDia(d).length
              return (
                <button key={d.toISOString()} onClick={() => setDiaSel(d)} className={cx('flex flex-col items-center rounded-xl py-2 transition', sel ? 'bg-brand-500 text-white' : mismoDia(d, hoy) ? 'bg-brand-50 text-brand-700' : 'text-ink-600')}>
                  <span className="text-[10px] font-bold uppercase opacity-80">{d.toLocaleDateString('es-MX', { weekday: 'narrow' })}</span>
                  <span className="text-lg font-extrabold">{d.getDate()}</span>
                  <span className={cx('size-1.5 rounded-full', n ? (sel ? 'bg-white' : 'bg-brand-500') : 'bg-transparent')} />
                </button>
              )
            })}
          </div>
          {deDia(diaSel).length === 0 ? (
            <EmptyState icon={<CalendarDays className="size-6" />} title="Sin citas este día" />
          ) : (
            <ul className="space-y-2 p-3">
              {deDia(diaSel).map((c) => {
                const p = pac(c.pacienteId); const e = esp(c.especialistaId)
                return (
                  <li key={c.id}>
                    <Link to={`/admin/pacientes/${p.id}?tab=consultas`} className={cx('flex gap-3 rounded-2xl border-l-4 bg-ink-50 p-3', c.estado === 'completada' ? 'border-ink-300' : 'border-brand-500')}>
                      <p className="w-16 shrink-0 text-sm font-bold">{hora(c.fecha)}</p>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{nombreCompleto(p)}</p>
                        <p className="truncate text-sm text-ink-500">{e.especialidad} · {e.nombre}</p>
                        <div className="mt-1.5 flex gap-1.5">
                          {c.estado === 'completada' ? <Badge>Completada</Badge> : <Badge tone="brand">Programada</Badge>}
                          {c.traduccion && <Badge tone="blue" icon={<Languages className="size-3" />}>{p.idioma}</Badge>}
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Escritorio: vista semanal */}
        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-ink-100">
              <div />
              {dias.map((d) => (
                <div key={d.toISOString()} className="border-l border-ink-100 px-2 py-3 text-center">
                  <p className="text-xs font-bold uppercase text-ink-400">{d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '')}</p>
                  <p className={cx('mx-auto mt-1 grid size-9 place-items-center rounded-full text-lg font-extrabold', mismoDia(d, hoy) ? 'bg-brand-500 text-white' : 'text-ink-800')}>{d.getDate()}</p>
                </div>
              ))}
            </div>
            <div className="relative grid grid-cols-[64px_repeat(7,1fr)]" style={{ height: (H_FIN - H_INI) * ROW }}>
              <div>
                {Array.from({ length: H_FIN - H_INI }, (_, i) => (
                  <div key={i} style={{ height: ROW }} className="pr-2 pt-1 text-right text-xs font-medium text-ink-400">{String(H_INI + i).padStart(2, '0')}:00</div>
                ))}
              </div>
              {dias.map((d) => (
                <div key={d.toISOString()} className={cx('relative border-l border-ink-100', mismoDia(d, hoy) && 'bg-brand-50/30')}>
                  {Array.from({ length: H_FIN - H_INI }, (_, i) => <div key={i} style={{ height: ROW }} className="border-b border-ink-100/70" />)}
                  {deDia(d).map((c) => {
                    const f = new Date(c.fecha); const top = (f.getHours() + f.getMinutes() / 60 - H_INI) * ROW
                    if (top < 0 || top > (H_FIN - H_INI) * ROW) return null
                    const p = pac(c.pacienteId); const e = esp(c.especialistaId)
                    const done = c.estado === 'completada'
                    return (
                      <Link key={c.id} to={`/admin/pacientes/${p.id}?tab=consultas`} style={{ top: top + 2, height: ROW - 4 }}
                        className={cx('absolute inset-x-1 overflow-hidden rounded-lg border-l-[3px] px-2 py-1.5 text-xs shadow-sm transition hover:z-10 hover:shadow-md',
                          done ? 'border-ink-300 bg-ink-100 text-ink-600' : 'border-brand-500 bg-white text-ink-800 ring-1 ring-brand-100')}>
                        <div className="flex items-center gap-1.5">
                          <Avatar name={nombreCompleto(p)} color={p.color} size={18} className="ring-0" />
                          <p className="truncate font-bold">{p.nombre} {p.apellidoPaterno}</p>
                        </div>
                        <p className="mt-0.5 truncate text-ink-500">{hora(c.fecha)} · {e.especialidad}</p>
                      </Link>
                    )
                  })}
                  {mismoDia(d, hoy) && ahoraTop > 0 && ahoraTop < (H_FIN - H_INI) * ROW && (
                    <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: ahoraTop }}>
                      <span className="-ml-1 size-2.5 rounded-full bg-red-500" /><span className="h-0.5 flex-1 bg-red-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}
