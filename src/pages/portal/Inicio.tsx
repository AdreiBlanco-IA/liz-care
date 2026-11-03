import { asset } from '../../lib/asset'
import { ArrowRight, CalendarDays, ClipboardList, Clock, HeartHandshake, Languages, MapPin, MessageCircle, Moon, Navigation, Phone, Pill, Stethoscope, Sun, Sunset } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, Badge, ButtonLink, Card, cx } from '../../components/ui'
import type { Consulta, Medicamento } from '../../data/types'
import { diaMes, fechaLarga, hora, relativo } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import { mapsUrl, usePaciente } from '../../lib/usePaciente'

export const horarioMeta = {
  mañana: { icon: Sun, cls: 'bg-amber-50 text-amber-700 ring-amber-100' },
  tarde: { icon: Sunset, cls: 'bg-sky-50 text-sky-700 ring-sky-100' },
  noche: { icon: Moon, cls: 'bg-violet-50 text-violet-700 ring-violet-100' },
} as const

export function HorarioChips({ m }: { m: Medicamento }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap gap-1.5">
      {m.horarios.map((h) => {
        const { icon: Icon, cls } = horarioMeta[h]
        return <span key={h} className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1', cls)}><Icon className="size-3" />{t(`trat.${h}`)}</span>
      })}
    </div>
  )
}

export function CitaCard({ c, destacada }: { c: Consulta; destacada?: boolean }) {
  const { t, lang } = useI18n()
  const { esp } = usePaciente()
  const e = esp(c.especialistaId)
  const d = diaMes(c.fecha, lang)
  return (
    <Card className={cx('overflow-hidden', destacada && 'ring-1 ring-brand-100')}>
      <div className="flex flex-col sm:flex-row">
        <div className={cx('flex items-center gap-4 p-5 sm:w-40 sm:flex-col sm:justify-center sm:gap-1 sm:text-center', destacada ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white' : 'bg-ink-50')}>
          <span className={cx('text-xs font-bold uppercase', destacada ? 'text-white/80' : 'text-ink-400')}>{d.semana}</span>
          <span className="text-4xl font-extrabold leading-none">{d.dia}</span>
          <span className={cx('text-sm font-bold uppercase', destacada ? 'text-white/90' : 'text-brand-600')}>{d.mes}</span>
          <span className={cx('ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold sm:ml-0 sm:mt-2', destacada ? 'bg-white/15' : 'bg-white')}><Clock className="size-3.5" />{hora(c.fecha, lang)}</span>
        </div>
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={e.nombre} src={e.foto} size={48} />
              <div><p className="font-bold">{e.nombre}</p><p className="text-sm text-ink-500">{e.especialidad}</p></div>
            </div>
            <Badge tone="gray" className="first-letter:uppercase">{relativo(c.fecha, lang)}</Badge>
          </div>
          <p className="mt-4 text-sm"><span className="font-semibold text-ink-500">{t('cita.motivo')}: </span>{c.motivo}</p>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-600"><MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />{e.institucion} · {e.direccion}</p>
          {c.overview && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900"><span className="font-bold">{t('cita.indicaciones')}: </span>{c.overview}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {c.acompanamiento && <Badge tone="brand" icon={<HeartHandshake className="size-3" />}>{t('cita.acompanamiento')}</Badge>}
            {c.traduccion && <Badge tone="blue" icon={<Languages className="size-3" />}>{t('cita.traduccion')}</Badge>}
            <a href={mapsUrl(`${e.institucion}, ${e.direccion}`)} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700">
              <Navigation className="size-4" />{t('cita.comoLlegar')}
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Inicio() {
  const { t, lang } = useI18n()
  const { paciente, proximas, pasadas, ultima, esp } = usePaciente()
  const h = new Date().getHours()
  const saludo = t(h < 12 ? 'saludo.manana' : h < 19 ? 'saludo.tarde' : 'saludo.noche')
  const especialistasUnicos = new Set(pasadas.map((c) => c.especialistaId)).size

  return (
    <div className="space-y-6">
      <section className="relative animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <Avatar name={`${paciente.nombre} ${paciente.apellidoPaterno}`} color="#5fcfbb" size={56} className="bg-white/10 ring-white/20" />
          <div>
            <p className="text-sm text-white/70">{saludo},</p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{paciente.nombre}</h1>
          </div>
        </div>
        <p className="relative mt-4 max-w-lg text-white/75">{t('inicio.sub')}</p>
        <div className="relative mt-6 grid grid-cols-3 gap-2 sm:max-w-md">
          {[[proximas.length, t('inicio.proximas'), CalendarDays], [pasadas.length, t('inicio.consultasPasadas'), ClipboardList], [especialistasUnicos, t('inicio.especialistas'), Stethoscope]].map(([n, l, I]) => {
            const Icon = I as typeof Pill
            return (
              <div key={l as string} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <Icon className="size-4 text-brand-300" />
                <p className="mt-2 text-2xl font-extrabold">{n as number}</p>
                <p className="text-xs leading-tight text-white/70">{l as string}</p>
              </div>
            )
          })}
        </div>
      </section>

      {!paciente.historialInicial && (
        <Card className="flex flex-col gap-4 border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 sm:flex-row sm:items-center">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700"><ClipboardList className="size-6" /></div>
          <div className="flex-1">
            <p className="font-bold">{t('inicio.historialPend')}</p>
            <p className="text-sm text-ink-600">{t('inicio.historialPendSub')}</p>
          </div>
          <ButtonLink to="/portal/historial-inicial">{t('inicio.llenar')} <ArrowRight className="size-4" /></ButtonLink>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t('inicio.proxima')}</h2>
            {proximas.length > 0 && <Link to="/portal/citas" className="text-sm font-bold text-brand-600 hover:text-brand-700">{t('inicio.verCitas')}</Link>}
          </div>
          {proximas[0] ? <CitaCard c={proximas[0]} destacada /> : (
            <Card className="p-8 text-center text-ink-500"><CalendarDays className="mx-auto mb-2 size-8 text-ink-300" />{t('inicio.sinCitas')}</Card>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-bold">{t('inicio.tratActual')}</h2>
            <Card className="p-5">
              {ultima?.tratamiento ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar name={esp(ultima.especialistaId).nombre} src={esp(ultima.especialistaId).foto} size={36} />
                    <div className="min-w-0 text-sm"><p className="truncate font-semibold">{esp(ultima.especialistaId).nombre}</p><p className="text-ink-500">{fechaLarga(ultima.fecha, lang)}</p></div>
                  </div>
                  <ul className="space-y-2.5">
                    {ultima.tratamiento.medicamentos.map((m) => (
                      <li key={m.nombre} className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-brand-600 shadow-sm"><Pill className="size-4.5" /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{m.nombre} {m.dosis}</p><p className="truncate text-xs text-ink-500">{m.frecuencia}</p></div>
                        <HorarioChips m={m} />
                      </li>
                    ))}
                  </ul>
                  <ButtonLink to="/portal/tratamiento" variant="secondary" className="mt-4 w-full">{t('inicio.verTrat')}</ButtonLink>
                </>
              ) : <p className="py-6 text-center text-sm text-ink-500">{t('trat.sinTrat')}</p>}
            </Card>
          </div>

          <Card className="relative overflow-hidden p-5">
            <img src={asset('images/acompanamiento.jpg')} alt="" className="absolute inset-y-0 right-0 hidden h-full w-28 object-cover sm:block" />
            <div className="absolute inset-y-0 right-0 hidden w-28 bg-gradient-to-r from-white to-transparent sm:block" />
            <div className="relative sm:pr-24">
              <p className="font-bold">{t('inicio.contacto')}</p>
              <p className="mt-1 text-sm text-ink-500">{t('inicio.contactoSub')}</p>
              <div className="mt-4 flex gap-2">
                <a href="https://wa.me/524770000000" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white hover:brightness-95"><MessageCircle className="size-4" />{t('inicio.whatsapp')}</a>
                <a href="tel:+524770000000" className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-200 px-4 text-sm font-semibold hover:bg-ink-50"><Phone className="size-4" />{t('inicio.llamar')}</a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
