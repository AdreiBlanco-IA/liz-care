import { AlertTriangle, ArrowRight, ClipboardList, Lock, MessageSquareText, ShieldAlert, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Avatar, ButtonLink, Card, CardHeader, cx } from '../../components/ui'
import { fechaCorta, nombreCompleto } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import { usePaciente } from '../../lib/usePaciente'

function Fila({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm font-semibold text-ink-800 sm:text-right">{children}</dd>
    </div>
  )
}

function Chips({ items, red }: { items: string[]; red?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => <span key={x} className={cx('rounded-xl px-3 py-1.5 text-sm font-medium ring-1', red ? 'bg-red-50 text-red-700 ring-red-100' : 'bg-ink-50 text-ink-700 ring-ink-100')}>{x}</span>)}
    </div>
  )
}

export default function Expediente() {
  const { t, lang } = useI18n()
  const { paciente: p, pasadas, esp } = usePaciente()
  const h = p.historialInicial
  const especialistas = Array.from(new Set(pasadas.map((c) => c.especialistaId))).map(esp)

  return (
    <div>
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('exp.titulo')}</h1>
        <p className="mt-1 text-ink-500">{t('exp.sub')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title={t('exp.datos')} icon={<UserRound className="size-5" />} action={<Lock className="size-4 text-ink-300" />} />
            <div className="flex items-center gap-4 px-5 pt-5">
              <Avatar name={nombreCompleto(p)} color={p.color} size={56} />
              <div><p className="text-lg font-bold">{nombreCompleto(p)}</p><p className="text-sm text-ink-500">{p.padecimientoPrincipal}</p></div>
            </div>
            <dl className="divide-y divide-ink-100 px-5 pb-3 pt-2">
              <Fila label={t('exp.nacimiento')}>{fechaCorta(p.fechaNacimiento + 'T12:00:00', lang)}</Fila>
              <Fila label={t('exp.nacionalidad')}>{p.nacionalidad}</Fila>
              <Fila label={t('exp.telefono')}>{p.telefono}</Fila>
              <Fila label={t('exp.correo')}>{p.email}</Fila>
            </dl>
            <div className="m-4 mt-0 rounded-xl bg-red-50/60 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700"><ShieldAlert className="size-4" />{t('exp.emergencia')}</p>
              <p className="mt-1.5 font-bold">{p.contactoEmergencia.nombre}</p>
              <p className="text-sm text-ink-600">{p.contactoEmergencia.parentesco} · {p.contactoEmergencia.telefono}</p>
            </div>
          </Card>

          {especialistas.length > 0 && (
            <Card>
              <CardHeader title={t('exp.especialistasTe')} icon={<Stethoscope className="size-5" />} />
              <ul className="divide-y divide-ink-100">
                {especialistas.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={e.nombre} src={e.foto} size={40} />
                    <div className="min-w-0"><p className="truncate text-sm font-bold">{e.nombre}</p><p className="truncate text-xs text-ink-500">{e.especialidad} · {e.institucion}</p></div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="flex gap-2 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900"><ShieldCheck className="size-5 shrink-0 text-brand-600" />{t('exp.privacidad')}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title={t('exp.historial')} icon={<ClipboardList className="size-5" />} subtitle={h ? fechaCorta(h.completadoEl, lang) : undefined} />
            {h ? (
              <div className="space-y-5 p-5">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink-500">{!h.sinAlergias && <AlertTriangle className="size-4 text-red-500" />}{t('exp.alergias')}</p>
                  {h.sinAlergias ? <p className="text-sm font-semibold text-brand-700">{t('exp.sinAlergias')}</p> : <Chips items={h.alergias} red />}
                </div>
                <div><p className="mb-2 text-sm font-bold text-ink-500">{t('exp.padecimientos')}</p>{h.sinPadecimientos ? <p className="text-sm font-semibold text-brand-700">{t('exp.sinPadecimientos')}</p> : <Chips items={h.padecimientos} />}</div>
                <div><p className="mb-2 text-sm font-bold text-ink-500">{t('exp.tratamientosPrev')}</p>{h.sinTratamientos ? <p className="text-sm font-semibold text-brand-700">{t('exp.sinTratamientos')}</p> : <Chips items={h.tratamientos} />}</div>
                {h.cirugias && <div><p className="mb-2 text-sm font-bold text-ink-500">{t('exp.cirugias')}</p><p className="text-sm text-ink-700">{h.cirugias}</p></div>}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-ink-500">{t('exp.pendiente')}</p>
                <ButtonLink to="/portal/historial-inicial" className="mt-4">{t('inicio.llenar')} <ArrowRight className="size-4" /></ButtonLink>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title={t('exp.consultas')} icon={<Stethoscope className="size-5" />} subtitle={`${pasadas.length}`} />
            {pasadas.length ? (
              <ol className="relative space-y-0 p-5 before:absolute before:bottom-8 before:left-[39px] before:top-8 before:w-px before:bg-ink-200">
                {pasadas.map((c) => {
                  const e = esp(c.especialistaId)
                  return (
                    <li key={c.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <Avatar name={e.nombre} src={e.foto} size={40} className="relative z-10" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <p className="font-bold">{e.especialidad}</p>
                          <p className="text-xs font-semibold text-ink-400">{fechaCorta(c.fecha, lang)}</p>
                        </div>
                        <p className="text-sm text-ink-500">{e.nombre} · {c.motivo}</p>
                        {c.overview && <p className="mt-2 text-sm leading-relaxed text-ink-700">{c.overview}</p>}
                        {c.notaVisible && (
                          <p className="mt-2 flex gap-2 rounded-xl bg-brand-50 p-3 text-sm text-ink-700">
                            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-brand-600" /><span><span className="font-bold text-brand-700">{t('exp.nota')}: </span>{c.notaVisible}</span>
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : <p className="p-6 text-center text-sm text-ink-500">{t('citas.sinPasadas')}</p>}
          </Card>
        </div>
      </div>
    </div>
  )
}
