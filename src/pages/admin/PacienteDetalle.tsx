import {
  AlertTriangle, ArrowDownUp, ArrowLeft, CalendarDays, Cake, ChevronDown, ClipboardList, Eye, FileImage, Globe2, Languages, Lock,
  Mail, Phone, Pill, Plus, Send, ShieldAlert, Stethoscope, UserRound,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Lightbox } from '../../components/Lightbox'
import { Avatar, Badge, Button, ButtonLink, Card, CardHeader, DoctorChip, EmptyState, Tabs, cx } from '../../components/ui'
import type { Consulta, Especialista } from '../../data/types'
import { diaMes, edad, fechaCorta, fechaLarga, hora, nombreCompleto, porFechaAsc, porFechaDesc, relativo } from '../../lib/format'
import { useStore } from '../../lib/store'

type Tab = 'resumen' | 'historial' | 'consultas' | 'recetas'

function Dato({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-ink-400">{icon}</div>
      <div className="min-w-0"><p className="text-xs font-semibold text-ink-400">{label}</p><p className="break-words text-sm font-medium text-ink-800">{children}</p></div>
    </div>
  )
}

function Lista({ items, tone = 'gray' }: { items: string[]; tone?: 'gray' | 'red' }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => (
        <span key={x} className={cx('rounded-xl px-3 py-1.5 text-sm font-medium', tone === 'red' ? 'bg-red-50 text-red-700 ring-1 ring-red-100' : 'bg-ink-50 text-ink-700 ring-1 ring-ink-100')}>{x}</span>
      ))}
    </div>
  )
}

function TratamientoTabla({ c }: { c: Consulta }) {
  if (!c.tratamiento) return null
  return (
    <div className="mt-4 rounded-xl border border-ink-100">
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/60 px-4 py-2.5 text-sm font-bold"><Pill className="size-4 text-brand-600" /> Tratamiento</div>
      <div className="divide-y divide-ink-100">
        {c.tratamiento.medicamentos.map((m, i) => (
          <div key={i} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1.2fr_1fr_1.6fr] sm:gap-4">
            <p className="font-semibold">{m.nombre} <span className="font-normal text-ink-500">{m.dosis}</span></p>
            <p className="text-ink-600">{m.frecuencia} · {m.duracion}</p>
            <p className="text-ink-500">{m.indicaciones}</p>
          </div>
        ))}
      </div>
      {c.tratamiento.indicacionesGenerales && <p className="border-t border-ink-100 px-4 py-3 text-sm text-ink-600"><span className="font-semibold text-ink-800">Indicaciones generales: </span>{c.tratamiento.indicacionesGenerales}</p>}
    </div>
  )
}

function ConsultaItem({ c, e, onReceta, defaultOpen }: { c: Consulta; e: Especialista; onReceta: (src: string) => void; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const d = diaMes(c.fecha)
  const futura = c.estado === 'programada'
  return (
    <li className="relative pl-8 sm:pl-10">
      <span className={cx('absolute left-0 top-5 grid size-6 place-items-center rounded-full ring-4 ring-white sm:left-1', futura ? 'bg-sky-100' : 'bg-brand-100')}>
        <span className={cx('size-2.5 rounded-full', futura ? 'bg-sky-500' : 'bg-brand-500')} />
      </span>
      <Card className={cx('overflow-hidden transition', open && 'ring-1 ring-brand-100')}>
        <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-4 p-4 text-left sm:p-5" aria-expanded={open}>
          <div className="hidden w-14 shrink-0 flex-col items-center rounded-xl bg-ink-50 py-2 sm:flex">
            <span className="text-xl font-extrabold leading-none">{d.dia}</span>
            <span className="text-[11px] font-bold uppercase text-brand-600">{d.mes}</span>
            <span className="text-[10px] text-ink-400">{new Date(c.fecha).getFullYear()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">{c.motivo}</p>
              {futura ? <Badge tone="blue">Programada</Badge> : <Badge tone="brand">Completada</Badge>}
              {c.tratamiento && <Badge tone="violet" icon={<Pill className="size-3" />}>{c.tratamiento.medicamentos.length}</Badge>}
              {c.receta && <Badge tone="gray" icon={<FileImage className="size-3" />}>Receta</Badge>}
            </div>
            <p className="mt-1 truncate text-sm text-ink-500">
              <span className="sm:hidden">{fechaCorta(c.fecha)} · </span>{hora(c.fecha)} · {e.nombre} · {e.especialidad}
            </p>
          </div>
          <ChevronDown className={cx('size-5 shrink-0 text-ink-400 transition', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="border-t border-ink-100 px-4 pb-5 pt-4 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1">
                <DoctorChip e={e} sub={`${e.especialidad} · ${e.institucion}`} />
                {c.overview && <p className="mt-4 text-sm leading-relaxed text-ink-700">{c.overview}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.acompanamiento && <Badge tone="brand">Con acompañamiento</Badge>}
                  {c.traduccion && <Badge tone="blue" icon={<Languages className="size-3" />}>Con traducción</Badge>}
                  <Badge tone={e.sector === 'Público' ? 'blue' : 'violet'}>Sector {e.sector.toLowerCase()}</Badge>
                </div>
              </div>
              {c.receta && (
                <button onClick={() => onReceta(c.receta!.url)} className="group relative h-40 w-full shrink-0 overflow-hidden rounded-xl border border-ink-100 lg:w-36">
                  <img src={c.receta.url} alt="Foto de la receta" className="size-full object-cover object-top transition group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent p-2 text-xs font-semibold text-white">Ver receta</span>
                </button>
              )}
            </div>
            {(c.notaVisible || c.notaInterna) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {c.notaVisible && (
                  <div className="rounded-xl bg-brand-50/70 p-3.5 text-sm">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-brand-700"><Eye className="size-3.5" /> Visible para el paciente</p>
                    <p className="text-ink-700">{c.notaVisible}</p>
                  </div>
                )}
                {c.notaInterna && (
                  <div className="rounded-xl bg-amber-50/80 p-3.5 text-sm">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700"><Lock className="size-3.5" /> Nota interna · solo administradora</p>
                    <p className="text-ink-700">{c.notaInterna}</p>
                  </div>
                )}
              </div>
            )}
            <TratamientoTabla c={c} />
            {futura && (
              <div className="mt-4 flex justify-end">
                <ButtonLink to={`/admin/consultas/nueva?paciente=${c.pacienteId}&cita=${c.id}`} size="sm">Registrar resultado de la consulta</ButtonLink>
              </div>
            )}
          </div>
        )}
      </Card>
    </li>
  )
}

export default function PacienteDetalle() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'resumen'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })
  const { pacientes, consultas, especialistas, notify } = useStore()
  const [asc, setAsc] = useState(false)
  const [receta, setReceta] = useState<string | null>(null)

  const p = pacientes.find((x) => x.id === id)
  if (!p) {
    return <Card><EmptyState icon={<UserRound className="size-6" />} title="Paciente no encontrado" text="Es posible que el enlace sea incorrecto." action={<ButtonLink to="/admin/pacientes">Volver a pacientes</ButtonLink>} /></Card>
  }

  const esp = (eid: string) => especialistas.find((e) => e.id === eid)!
  const cs = consultas.filter((c) => c.pacienteId === p.id)
  const ordenadas = [...cs].sort(asc ? porFechaAsc : porFechaDesc)
  const completadas = cs.filter((c) => c.estado === 'completada').sort(porFechaDesc)
  const proxima = cs.filter((c) => c.estado === 'programada' && new Date(c.fecha) >= new Date()).sort(porFechaAsc)[0]
  const recetas = completadas.filter((c) => c.receta)
  const h = p.historialInicial

  const atendidoPor = Object.values(completadas.reduce<Record<string, { e: Especialista; n: number; ultima: string }>>((acc, c) => {
    const a = acc[c.especialistaId]
    acc[c.especialistaId] = a ? { ...a, n: a.n + 1 } : { e: esp(c.especialistaId), n: 1, ultima: c.fecha }
    return acc
  }, {}))

  return (
    <>
      <Link to="/admin/pacientes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft className="size-4" /> Pacientes</Link>

      <Card className="relative mb-6 animate-fade-up overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-500 via-brand-400 to-sky-400 sm:h-28" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-fit rounded-full bg-white p-1.5 shadow-card"><Avatar name={nombreCompleto(p)} color={p.color} size={88} className="ring-0" /></div>
            <div className="min-w-0 flex-1 sm:pt-15">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{nombreCompleto(p)}</h1>
                {p.activo ? <Badge tone="brand">Activo</Badge> : <Badge>Servicio terminado</Badge>}
                {p.portal === 'activo' && <Badge tone="blue">Portal activo</Badge>}
                {p.portal === 'invitado' && <Badge tone="amber">Invitación pendiente</Badge>}
              </div>
              <p className="mt-1 text-ink-500">{p.padecimientoPrincipal} · {edad(p.fechaNacimiento)} años · {p.nacionalidad}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:pt-15">
              {p.portal === 'invitado' && <Button variant="outline" size="sm" onClick={() => notify(`Invitación reenviada a ${p.email}`)}><Send className="size-4" /> Reenviar acceso</Button>}
              <ButtonLink to={`/admin/consultas/nueva?paciente=${p.id}`} size="sm"><Plus className="size-4" /> Registrar consulta</ButtonLink>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Consultas', completadas.length, ClipboardList],
              ['Especialistas', atendidoPor.length, Stethoscope],
              ['Recetas', recetas.length, FileImage],
              ['Próxima cita', proxima ? relativo(proxima.fecha) : '—', CalendarDays],
            ].map(([l, v, I]) => {
              const Icon = I as typeof Pill
              return (
                <div key={l as string} className="rounded-xl bg-ink-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-500"><Icon className="size-3.5" />{l as string}</p>
                  <p className="mt-1 truncate text-lg font-extrabold first-letter:uppercase">{v as ReactNode}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {h && !h.sinAlergias && h.alergias.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-red-600" />
          <p><span className="font-bold text-red-700">Alergias: </span><span className="text-red-800">{h.alergias.join(', ')}</span></p>
        </div>
      )}

      <Tabs value={tab} onChange={setTab} items={[
        { value: 'resumen', label: 'Resumen' },
        { value: 'historial', label: 'Historial médico' },
        { value: 'consultas', label: 'Consultas', count: cs.length },
        { value: 'recetas', label: 'Recetas', count: recetas.length },
      ]} />

      <div className="mt-6">
        {tab === 'resumen' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader title="Datos del paciente" icon={<UserRound className="size-5" />} />
              <div className="space-y-4 p-5">
                <Dato icon={<Cake className="size-4.5" />} label="Fecha de nacimiento">{fechaCorta(p.fechaNacimiento + 'T12:00:00')} ({edad(p.fechaNacimiento)} años)</Dato>
                <Dato icon={<Globe2 className="size-4.5" />} label="Nacionalidad e idioma">{p.nacionalidad} · {p.idioma}</Dato>
                <Dato icon={<Phone className="size-4.5" />} label="Teléfono">{p.telefono}</Dato>
                <Dato icon={<Mail className="size-4.5" />} label="Correo">{p.email}</Dato>
                <Dato icon={<CalendarDays className="size-4.5" />} label="Paciente desde">{fechaCorta(p.altaEl)}</Dato>
              </div>
              <div className="m-4 mt-0 rounded-xl border border-red-100 bg-red-50/50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700"><ShieldAlert className="size-4" /> Contacto de emergencia</p>
                <p className="mt-2 font-bold">{p.contactoEmergencia.nombre}</p>
                <p className="text-sm text-ink-600">{p.contactoEmergencia.parentesco} · {p.contactoEmergencia.telefono}</p>
              </div>
            </Card>

            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader title="Próxima cita" icon={<CalendarDays className="size-5" />} />
                {proxima ? (
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="rounded-2xl bg-brand-500 px-5 py-3 text-center text-white">
                      <p className="text-xs font-bold uppercase opacity-80">{diaMes(proxima.fecha).mes}</p>
                      <p className="text-3xl font-extrabold leading-none">{diaMes(proxima.fecha).dia}</p>
                      <p className="text-xs font-semibold opacity-80">{hora(proxima.fecha)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{proxima.motivo}</p>
                      <p className="text-sm text-ink-500">{fechaLarga(proxima.fecha)} · {esp(proxima.especialistaId).institucion}</p>
                      <div className="mt-3"><DoctorChip e={esp(proxima.especialistaId)} size={34} /></div>
                    </div>
                  </div>
                ) : <EmptyState icon={<CalendarDays className="size-6" />} title="Sin citas programadas" action={<ButtonLink to={`/admin/consultas/nueva?paciente=${p.id}`} size="sm" variant="secondary">Agendar cita</ButtonLink>} />}
              </Card>

              <Card>
                <CardHeader title="Especialistas que lo han atendido" subtitle="Con quién y cuándo" icon={<Stethoscope className="size-5" />} />
                {atendidoPor.length ? (
                  <ul className="divide-y divide-ink-100">
                    {atendidoPor.map(({ e, n, ultima }) => (
                      <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                        <DoctorChip e={e} />
                        <div className="shrink-0 text-right text-sm">
                          <p className="font-semibold">{n} {n === 1 ? 'consulta' : 'consultas'}</p>
                          <p className="text-xs text-ink-500">Última: {fechaCorta(ultima)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="p-5 text-sm text-ink-500">Todavía no tiene consultas completadas.</p>}
              </Card>
            </div>
          </div>
        )}

        {tab === 'historial' && (
          h ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-5">
                <p className="mb-3 text-sm font-bold text-ink-500">Padecimientos crónicos o actuales</p>
                {h.padecimientos.length ? <Lista items={h.padecimientos} /> : <p className="text-sm text-ink-600">Ninguno reportado</p>}
              </Card>
              <Card className="p-5">
                <p className="mb-3 text-sm font-bold text-ink-500">Alergias</p>
                {h.sinAlergias ? <Badge tone="brand">Sin alergias conocidas (confirmado por el paciente)</Badge> : <Lista items={h.alergias} tone="red" />}
              </Card>
              <Card className="p-5">
                <p className="mb-3 text-sm font-bold text-ink-500">Tratamientos que ha seguido</p>
                {h.tratamientos.length ? <Lista items={h.tratamientos} /> : <p className="text-sm text-ink-600">Ninguno reportado</p>}
              </Card>
              <Card className="p-5">
                <p className="mb-3 text-sm font-bold text-ink-500">Cirugías u hospitalizaciones</p>
                <p className="text-sm text-ink-700">{h.cirugias || 'Ninguna reportada'}</p>
                {h.notas && <><p className="mb-1 mt-4 text-sm font-bold text-ink-500">Notas del paciente</p><p className="text-sm text-ink-700">{h.notas}</p></>}
              </Card>
              <p className="text-xs text-ink-400 lg:col-span-2">Formulario llenado por el paciente el {fechaCorta(h.completadoEl)}.</p>
            </div>
          ) : (
            <Card><EmptyState icon={<ClipboardList className="size-6" />} title="Historial médico inicial pendiente"
              text="El paciente aún no llena su formulario de padecimientos, alergias y tratamientos desde su portal."
              action={<Button variant="secondary" size="sm" onClick={() => notify(`Recordatorio enviado a ${p.email}`)}><Send className="size-4" /> Enviar recordatorio</Button>} /></Card>
          )
        )}

        {tab === 'consultas' && (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-500">{cs.length} registros · ordenados cronológicamente</p>
              <Button variant="outline" size="sm" onClick={() => setAsc(!asc)}><ArrowDownUp className="size-4" /> {asc ? 'Más antiguas primero' : 'Más recientes primero'}</Button>
            </div>
            {cs.length ? (
              <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-3 before:top-4 before:w-px before:bg-ink-200 sm:before:left-4">
                {ordenadas.map((c) => <ConsultaItem key={c.id} c={c} e={esp(c.especialistaId)} onReceta={setReceta} defaultOpen={c.id === completadas[0]?.id} />)}
              </ol>
            ) : <Card><EmptyState icon={<ClipboardList className="size-6" />} title="Sin consultas registradas" action={<ButtonLink to={`/admin/consultas/nueva?paciente=${p.id}`} size="sm">Registrar consulta</ButtonLink>} /></Card>}
          </>
        )}

        {tab === 'recetas' && (
          recetas.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recetas.map((c) => (
                <button key={c.id} onClick={() => setReceta(c.receta!.url)} className="group overflow-hidden rounded-2xl border border-ink-100 bg-white text-left shadow-card transition hover:shadow-float">
                  <div className="h-48 overflow-hidden"><img src={c.receta!.url} alt="" className="size-full object-cover object-top transition duration-300 group-hover:scale-105" /></div>
                  <div className="p-4">
                    <p className="font-bold">{esp(c.especialistaId).especialidad}</p>
                    <p className="text-sm text-ink-500">{fechaCorta(c.fecha)} · {c.tratamiento?.medicamentos.length ?? 0} medicamentos</p>
                  </div>
                </button>
              ))}
            </div>
          ) : <Card><EmptyState icon={<FileImage className="size-6" />} title="Sin recetas" text="Las fotos de recetas aparecerán aquí al registrarlas en una consulta." /></Card>
        )}
      </div>

      {receta && <Lightbox src={receta} alt={`Receta de ${nombreCompleto(p)}`} onClose={() => setReceta(null)} />}
    </>
  )
}
