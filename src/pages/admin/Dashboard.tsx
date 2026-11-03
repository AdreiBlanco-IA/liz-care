import { asset } from '../../lib/asset'
import { ArrowRight, CalendarClock, CalendarDays, ClipboardCheck, Clock, FileWarning, Languages, Mail, Plus, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, Badge, ButtonLink, Card, CardHeader, EmptyState, PageHeader, cx } from '../../components/ui'
import { diaMes, fechaCorta, fechaLarga, hora, mismoDia, nombreCompleto, porFechaAsc, porFechaDesc, relativo } from '../../lib/format'
import { useStore } from '../../lib/store'

function saludo() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export default function Dashboard() {
  const { pacientes, consultas, especialistas, sesion } = useStore()
  const hoy = new Date()
  const en7 = new Date(); en7.setDate(en7.getDate() + 7)
  const pac = (id: string) => pacientes.find((p) => p.id === id)!
  const esp = (id: string) => especialistas.find((e) => e.id === id)!

  const deHoy = consultas.filter((c) => c.estado === 'programada' && mismoDia(new Date(c.fecha), hoy)).sort(porFechaAsc)
  const proximas = consultas.filter((c) => c.estado === 'programada' && new Date(c.fecha) > hoy && !mismoDia(new Date(c.fecha), hoy) && new Date(c.fecha) <= en7).sort(porFechaAsc)
  const recientes = consultas.filter((c) => c.estado === 'completada').sort(porFechaDesc).slice(0, 4)
  const activos = pacientes.filter((p) => p.activo)
  const sinHistorial = activos.filter((p) => !p.historialInicial)
  const invitados = activos.filter((p) => p.portal === 'invitado')

  const stats = [
    { label: 'Pacientes activos', value: activos.length, icon: Users, tone: 'bg-brand-50 text-brand-600', to: '/admin/pacientes' },
    { label: 'Citas hoy', value: deHoy.length, icon: CalendarClock, tone: 'bg-sky-50 text-sky-600', to: '/admin/agenda' },
    { label: 'Próximos 7 días', value: proximas.length, icon: CalendarDays, tone: 'bg-violet-50 text-violet-600', to: '/admin/agenda' },
    { label: 'Historiales pendientes', value: sinHistorial.length, icon: FileWarning, tone: 'bg-amber-50 text-amber-600', to: '/admin/pacientes?filtro=pendiente' },
  ]

  return (
    <>
      <PageHeader
        title={`${saludo()}, ${sesion?.nombre.split(' ')[0]}`}
        subtitle={`${fechaLarga(hoy.toISOString())} · Tienes ${deHoy.length} ${deHoy.length === 1 ? 'cita' : 'citas'} hoy`}
        actions={<>
          <ButtonLink to="/admin/pacientes/nuevo" variant="outline"><UserPlus className="size-4" /> Registrar paciente</ButtonLink>
          <ButtonLink to="/admin/consultas/nueva"><Plus className="size-4" /> Registrar consulta</ButtonLink>
        </>}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone, to }, i) => (
          <Link key={label} to={to} style={{ animationDelay: `${i * 60}ms` }} className="group animate-fade-up rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-float sm:p-5">
            <div className="flex items-start justify-between">
              <div className={cx('grid size-11 place-items-center rounded-xl', tone)}><Icon className="size-5" /></div>
              <ArrowRight className="size-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
            <p className="text-sm font-medium text-ink-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader title="Agenda de hoy" subtitle="Consultas en las que acompañas a tus pacientes" icon={<Clock className="size-5" />}
              action={<ButtonLink to="/admin/agenda" variant="ghost" size="sm">Ver agenda</ButtonLink>} />
            {deHoy.length === 0 ? (
              <EmptyState icon={<CalendarDays className="size-6" />} title="Sin citas para hoy" text="Disfruta el día o aprovecha para registrar consultas pendientes." />
            ) : (
              <ol className="divide-y divide-ink-100">
                {deHoy.map((c) => {
                  const p = pac(c.pacienteId); const e = esp(c.especialistaId)
                  const pasada = new Date(c.fecha) < hoy
                  return (
                    <li key={c.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                      <div className="flex w-24 shrink-0 items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
                        <p className={cx('text-lg font-extrabold', pasada ? 'text-ink-400' : 'text-ink-900')}>{hora(c.fecha)}</p>
                        {pasada ? <Badge tone="amber">Por registrar</Badge> : <Badge tone="brand">Próxima</Badge>}
                      </div>
                      <div className="hidden h-12 w-px bg-ink-100 sm:block" />
                      <Link to={`/admin/pacientes/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={nombreCompleto(p)} color={p.color} size={44} />
                        <div className="min-w-0">
                          <p className="truncate font-bold hover:text-brand-700">{nombreCompleto(p)} <span className="font-medium text-ink-400">· {c.motivo}</span></p>
                          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm text-ink-500">
                            <Avatar name={e.nombre} src={e.foto} size={20} className="ring-0" />
                            <span className="truncate">{e.nombre} · {e.especialidad}</span>
                          </p>
                        </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        {c.traduccion && <Badge tone="blue" icon={<Languages className="size-3" />}>{p.idioma}</Badge>}
                        <ButtonLink to={`/admin/consultas/nueva?paciente=${p.id}&cita=${c.id}`} variant={pasada ? 'primary' : 'secondary'} size="sm">Registrar</ButtonLink>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </Card>

          <Card>
            <CardHeader title="Próximos 7 días" subtitle={`${proximas.length} citas programadas`} icon={<CalendarDays className="size-5" />} />
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {proximas.map((c) => {
                const p = pac(c.pacienteId); const e = esp(c.especialistaId); const d = diaMes(c.fecha)
                return (
                  <Link key={c.id} to={`/admin/pacientes/${p.id}`} className="flex gap-3 rounded-2xl border border-ink-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40">
                    <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-ink-50 py-2 text-center">
                      <span className="text-[11px] font-bold uppercase text-ink-400">{d.semana}</span>
                      <span className="text-xl font-extrabold leading-none">{d.dia}</span>
                      <span className="text-[11px] font-semibold uppercase text-brand-600">{d.mes}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{nombreCompleto(p)}</p>
                      <p className="truncate text-sm text-ink-500">{e.especialidad} · {hora(c.fecha)}</p>
                      <p className="mt-1 truncate text-xs text-ink-400">{e.institucion}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Pendientes" icon={<ClipboardCheck className="size-5" />} />
            <div className="space-y-1 p-2">
              {sinHistorial.map((p) => (
                <Link key={p.id} to={`/admin/pacientes/${p.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-ink-50">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600"><FileWarning className="size-4.5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{nombreCompleto(p)}</p>
                    <p className="text-xs text-ink-500">No ha llenado su historial inicial</p>
                  </div>
                </Link>
              ))}
              {invitados.map((p) => (
                <Link key={`i${p.id}`} to={`/admin/pacientes/${p.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-ink-50">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600"><Mail className="size-4.5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{nombreCompleto(p)}</p>
                    <p className="text-xs text-ink-500">Invitación al portal sin aceptar</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Consultas recientes" icon={<ClipboardCheck className="size-5" />} />
            <ul className="divide-y divide-ink-100">
              {recientes.map((c) => {
                const p = pac(c.pacienteId); const e = esp(c.especialistaId)
                return (
                  <li key={c.id}>
                    <Link to={`/admin/pacientes/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50">
                      <Avatar name={nombreCompleto(p)} color={p.color} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{nombreCompleto(p)}</p>
                        <p className="truncate text-xs text-ink-500">{e.especialidad} · {fechaCorta(c.fecha)}</p>
                      </div>
                      <span className="text-xs text-ink-400">{relativo(c.fecha)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>

          <div className="relative overflow-hidden rounded-2xl">
            <img src={asset('images/consulta.jpg')} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-ink-900/30" />
            <div className="relative p-5 pt-24 text-white">
              <p className="text-lg font-bold">¿Acabas de salir de consulta?</p>
              <p className="mt-1 text-sm text-white/75">Registra el resumen, el tratamiento y sube la foto de la receta en menos de 2 minutos.</p>
              <ButtonLink to="/admin/consultas/nueva" variant="white" size="sm" className="mt-4">Registrar ahora <ArrowRight className="size-4" /></ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
