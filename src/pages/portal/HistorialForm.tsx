import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, HeartPulse, Pill, Plus, ShieldCheck, X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonLink, Card, Textarea, cx } from '../../components/ui'
import { useI18n } from '../../lib/i18n'
import { useStore } from '../../lib/store'
import { usePaciente } from '../../lib/usePaciente'

const sugerencias = {
  es: { pad: ['Diabetes', 'Hipertensión', 'Asma', 'Hipotiroidismo', 'Colesterol alto', 'Migraña'], al: ['Penicilina', 'Ibuprofeno', 'Sulfas', 'Látex', 'Mariscos', 'Nueces'] },
  en: { pad: ['Diabetes', 'High blood pressure', 'Asthma', 'Hypothyroidism', 'High cholesterol', 'Migraine'], al: ['Penicillin', 'Ibuprofen', 'Sulfa drugs', 'Latex', 'Shellfish', 'Nuts'] },
}

function ListaEditable({ items, setItems, placeholder, sugeridas, comunLabel, agregarLabel, red, disabled }: {
  items: string[]; setItems: (v: string[]) => void; placeholder: string; sugeridas?: string[]; comunLabel: string; agregarLabel: string; red?: boolean; disabled?: boolean
}) {
  const [v, setV] = useState('')
  const add = (x = v) => {
    const s = x.trim()
    if (s && !items.some((i) => i.toLowerCase() === s.toLowerCase())) setItems([...items, s])
    setV('')
  }
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); add() } }
  return (
    <div className={cx(disabled && 'pointer-events-none opacity-40')}>
      <div className="flex gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={onKey} placeholder={placeholder} disabled={disabled}
          className="h-12 w-full rounded-xl border border-ink-200 px-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
        <Button type="button" variant="dark" onClick={() => add()} className="h-12 shrink-0"><Plus className="size-4" /><span className="hidden sm:inline">{agregarLabel}</span></Button>
      </div>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((i) => (
            <span key={i} className={cx('inline-flex items-center gap-1.5 rounded-full py-1.5 pl-3.5 pr-1.5 text-sm font-semibold', red ? 'bg-red-50 text-red-700' : 'bg-brand-50 text-brand-800')}>
              {i}
              <button type="button" onClick={() => setItems(items.filter((x) => x !== i))} className="grid size-5 place-items-center rounded-full hover:bg-black/10" aria-label={`Quitar ${i}`}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
      {sugeridas && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">{comunLabel}</p>
          <div className="flex flex-wrap gap-2">
            {sugeridas.filter((s) => !items.includes(s)).map((s) => (
              <button type="button" key={s} onClick={() => add(s)} className="rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-sm text-ink-600 hover:border-brand-500 hover:text-brand-700">+ {s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Check2({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked}
      className={cx('flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition', checked ? 'border-brand-500 bg-brand-50/60' : 'border-ink-100 hover:border-ink-200')}>
      <span className={cx('grid size-6 shrink-0 place-items-center rounded-lg border-2 transition', checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-300')}>{checked && <Check className="size-4" />}</span>
      {label}
    </button>
  )
}

export default function HistorialForm() {
  const { t, lang } = useI18n()
  const { paciente } = usePaciente()
  const { enviarHistorialInicial, reportarFallo, notify } = useStore()
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const [paso, setPaso] = useState(0)
  const [pad, setPad] = useState<string[]>([])
  const [sinPad, setSinPad] = useState(false)
  const [tieneAlergias, setTieneAlergias] = useState<boolean | null>(null)
  const [alergias, setAlergias] = useState<string[]>([])
  const [trat, setTrat] = useState<string[]>([])
  const [sinTrat, setSinTrat] = useState(false)
  const [cirugias, setCirugias] = useState('')
  const [notas, setNotas] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')

  if (paciente.historialInicial) {
    return (
      <Card className="mx-auto max-w-xl p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-brand-500" />
        <p className="mt-4 text-lg font-bold">{t('form.yaEnviado')}</p>
        <ButtonLink to="/portal/expediente" className="mt-6">{t('nav.expediente')} <ArrowRight className="size-4" /></ButtonLink>
      </Card>
    )
  }

  const pasos = [
    { t: t('form.p1'), icon: HeartPulse },
    { t: t('form.p2'), icon: AlertCircle },
    { t: t('form.p3'), icon: Pill },
    { t: t('form.p4'), icon: ClipboardList },
  ]

  const validar = (n: number) => {
    if (n === 0 && !sinPad && pad.length === 0) return t('form.errPad')
    if (n === 1 && tieneAlergias === null) return t('form.errAl')
    if (n === 1 && tieneAlergias && alergias.length === 0) return t('form.errAlLista')
    if (n === 2 && !sinTrat && trat.length === 0) return t('form.errTr')
    if (n === 3 && !consent) return t('form.errConsent')
    return ''
  }

  // La validación por paso guía a la persona; al enviar, M03 decide de nuevo y garantiza el envío único.
  const siguiente = async () => {
    if (enviando) return
    const e = validar(paso)
    setError(e)
    if (e) return
    if (paso < 3) { setPaso(paso + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    for (let i = 0; i < 3; i++) { const er = validar(i); if (er) { setPaso(i); setError(er); return } }
    setEnviando(true)
    const r = await enviarHistorialInicial({
      padecimientos: sinPad ? [] : pad, sinPadecimientos: sinPad,
      alergias: tieneAlergias ? alergias : [], sinAlergias: tieneAlergias === false,
      tratamientos: sinTrat ? [] : trat, sinTratamientos: sinTrat,
      cirugias: cirugias, notas: notas,
    })
    setEnviando(false)
    if (r.ok) { notify(t('form.enviado')); navigate('/portal/expediente'); return }
    if (r.motivo === 'ya-enviado') { notify(t('form.yaEnviado'), 'error'); navigate('/portal/expediente'); return }
    if (r.motivo === 'datos-invalidos') {
      const primero = (['padecimientos', 'alergias', 'tratamientos'] as const).findIndex((k) => r.errores[k])
      setPaso(Math.max(primero, 0))
      setError(r.errores.padecimientos ? t('form.errPad') : r.errores.alergias ? t('form.errAl') : t('form.errTr'))
      return
    }
    if (r.motivo === 'sin-permiso') { setError(t('form.errPermiso')); return }
    setError(`${t('form.errGuardado')} (${reportarFallo('enviar historial inicial')})`)
  }

  const s = sugerencias[lang]

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('form.titulo')}</h1>
        <p className="mt-1 text-ink-500">{t('form.sub')}</p>
      </div>

      <ol className="mb-6 grid grid-cols-4 gap-2">
        {pasos.map(({ t: label, icon: Icon }, i) => (
          <li key={label}>
            <div className={cx('h-1.5 rounded-full transition-all', i <= paso ? 'bg-brand-500' : 'bg-ink-200')} />
            <p className={cx('mt-2 flex items-center gap-1.5 text-xs font-bold', i === paso ? 'text-brand-700' : i < paso ? 'text-ink-600' : 'text-ink-400')}>
              {i < paso ? <CheckCircle2 className="size-3.5 text-brand-500" /> : <Icon className="size-3.5" />}<span className="truncate">{label}</span>
            </p>
          </li>
        ))}
      </ol>

      <Card className="p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{t('form.paso')} {paso + 1} {t('form.de')} 4</p>

        {paso === 0 && (
          <div className="mt-2 animate-fade-up">
            <h2 className="text-xl font-bold">{t('form.p1.q')}</h2>
            <p className="mt-1 text-sm text-ink-500">{t('form.p1.h')}</p>
            <div className="mt-6 space-y-4">
              <ListaEditable items={pad} setItems={(v) => { setPad(v); setError('') }} placeholder={t('form.placeholderPad')} sugeridas={s.pad} comunLabel={t('form.comun')} agregarLabel={t('form.agregar')} disabled={sinPad} />
              <Check2 checked={sinPad} onChange={(v) => { setSinPad(v); setError('') }} label={t('form.ninguno')} />
            </div>
          </div>
        )}

        {paso === 1 && (
          <div className="mt-2 animate-fade-up">
            <h2 className="text-xl font-bold">{t('form.p2.q')}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-red-600"><AlertCircle className="size-4" />{t('form.p2.h')}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup">
              {([[true, t('form.siAlergias')], [false, t('form.noAlergias')]] as const).map(([v, l]) => (
                <button type="button" key={String(v)} role="radio" aria-checked={tieneAlergias === v} onClick={() => { setTieneAlergias(v); setError('') }}
                  className={cx('flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition',
                    tieneAlergias === v ? (v ? 'border-red-400 bg-red-50' : 'border-brand-500 bg-brand-50/60') : 'border-ink-100 hover:border-ink-200')}>
                  <span className={cx('grid size-6 shrink-0 place-items-center rounded-full border-2', tieneAlergias === v ? (v ? 'border-red-500' : 'border-brand-500') : 'border-ink-300')}>
                    {tieneAlergias === v && <span className={cx('size-3 rounded-full', v ? 'bg-red-500' : 'bg-brand-500')} />}
                  </span>
                  {l}
                </button>
              ))}
            </div>
            {tieneAlergias && (
              <div className="mt-6 animate-fade-up">
                <ListaEditable items={alergias} setItems={(v) => { setAlergias(v); setError('') }} placeholder={t('form.placeholderAl')} sugeridas={s.al} comunLabel={t('form.comun')} agregarLabel={t('form.agregar')} red />
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="mt-2 animate-fade-up">
            <h2 className="text-xl font-bold">{t('form.p3.q')}</h2>
            <p className="mt-1 text-sm text-ink-500">{t('form.p3.h')}</p>
            <div className="mt-6 space-y-4">
              <ListaEditable items={trat} setItems={(v) => { setTrat(v); setError('') }} placeholder={t('form.placeholderTr')} comunLabel={t('form.comun')} agregarLabel={t('form.agregar')} disabled={sinTrat} />
              <Check2 checked={sinTrat} onChange={(v) => { setSinTrat(v); setError('') }} label={t('form.ninguno')} />
              <label className="block pt-2">
                <span className="mb-1.5 block text-sm font-semibold">{t('form.cirugias')}</span>
                <Textarea value={cirugias} onChange={(e) => setCirugias(e.target.value)} rows={2} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">{t('form.notas')}</span>
                <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
              </label>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="mt-2 animate-fade-up space-y-4">
            <h2 className="text-xl font-bold">{t('form.p4')}</h2>
            {[
              [t('form.p1'), sinPad ? [t('form.ninguno')] : pad, 0, false],
              [t('exp.alergias'), tieneAlergias ? alergias : [t('form.noAlergias')], 1, !!tieneAlergias],
              [t('form.p3'), sinTrat ? [t('form.ninguno')] : trat, 2, false],
            ].map(([label, items, n, red]) => (
              <div key={label as string} className="rounded-2xl border border-ink-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-ink-500">{label as string}</p>
                  <button type="button" onClick={() => setPaso(n as number)} className="text-sm font-bold text-brand-600">{t('form.editar')}</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(items as string[]).map((i) => <span key={i} className={cx('rounded-full px-3 py-1 text-sm font-semibold', red ? 'bg-red-50 text-red-700' : 'bg-ink-50 text-ink-700')}>{i}</span>)}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => { setConsent(!consent); setError('') }} aria-pressed={consent}
              className={cx('flex w-full gap-3 rounded-2xl border-2 p-4 text-left text-sm transition', consent ? 'border-brand-500 bg-brand-50/60' : 'border-ink-100')}>
              <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2', consent ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-300')}>{consent && <Check className="size-3.5" />}</span>
              <span className="flex-1 text-ink-700">{t('form.consent')}</span>
              <ShieldCheck className="size-5 shrink-0 text-brand-500" />
            </button>
          </div>
        )}

        {error && (
          <p className="mt-6 flex animate-fade-up items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert"><AlertCircle className="size-4.5 shrink-0" />{error}</p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
          {paso > 0 ? <Button variant="ghost" onClick={() => { setPaso(paso - 1); setError('') }}><ArrowLeft className="size-4" />{t('form.anterior')}</Button> : <span />}
          <Button size="lg" onClick={siguiente} disabled={enviando}>{paso === 3 ? <><Check className="size-4.5" />{t('form.enviar')}</> : <>{t('form.siguiente')}<ArrowRight className="size-4.5" /></>}</Button>
        </div>
      </Card>
    </div>
  )
}
