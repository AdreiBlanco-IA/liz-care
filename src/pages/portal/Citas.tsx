import { CalendarDays, ChevronRight, FileImage, MessageSquareText, Pill } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, Badge, Card, Tabs } from '../../components/ui'
import { fechaLarga, hora } from '../../lib/format'
import { useI18n } from '../../lib/i18n'
import { usePaciente } from '../../lib/usePaciente'
import { CitaCard } from './Inicio'

export default function Citas() {
  const { t, lang } = useI18n()
  const { proximas, pasadas, ultima, esp } = usePaciente()
  const [tab, setTab] = useState<'proximas' | 'pasadas'>('proximas')

  return (
    <div>
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('citas.titulo')}</h1>
        <p className="mt-1 text-ink-500">{t('citas.sub')}</p>
      </div>

      <Tabs value={tab} onChange={setTab} items={[
        { value: 'proximas', label: t('citas.proximas'), count: proximas.length },
        { value: 'pasadas', label: t('citas.pasadas'), count: pasadas.length },
      ]} />

      <div className="mt-6 space-y-4">
        {tab === 'proximas' && (proximas.length ? proximas.map((c, i) => <CitaCard key={c.id} c={c} destacada={i === 0} />) : (
          <Card className="p-10 text-center text-ink-500"><CalendarDays className="mx-auto mb-2 size-8 text-ink-300" />{t('inicio.sinCitas')}</Card>
        ))}

        {tab === 'pasadas' && (pasadas.length ? pasadas.map((c) => {
          const e = esp(c.especialistaId)
          const esUltima = c.id === ultima?.id
          const contenido = (
            <Card className="p-5 transition hover:shadow-float">
              <div className="flex items-start gap-3">
                <Avatar name={e.nombre} src={e.foto} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{c.motivo}</p>
                    {c.tratamiento && <Badge tone="violet" icon={<Pill className="size-3" />}>{c.tratamiento.medicamentos.length}</Badge>}
                    {c.receta && <Badge tone="gray" icon={<FileImage className="size-3" />}>Rx</Badge>}
                  </div>
                  <p className="text-sm text-ink-500">{e.nombre} · {e.especialidad}</p>
                  <p className="text-sm text-ink-400">{fechaLarga(c.fecha, lang)} · {hora(c.fecha, lang)}</p>
                </div>
                {esUltima && <ChevronRight className="size-5 shrink-0 text-ink-300" />}
              </div>
              {c.overview && <p className="mt-4 text-sm leading-relaxed text-ink-700">{c.overview}</p>}
              {c.notaVisible && (
                <p className="mt-3 flex gap-2 rounded-xl bg-brand-50 p-3 text-sm text-ink-700">
                  <MessageSquareText className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <span><span className="font-bold text-brand-700">{t('exp.nota')}: </span>{c.notaVisible}</span>
                </p>
              )}
            </Card>
          )
          return esUltima && c.tratamiento ? <Link key={c.id} to="/portal/tratamiento" className="block">{contenido}</Link> : <div key={c.id}>{contenido}</div>
        }) : <Card className="p-10 text-center text-ink-500">{t('citas.sinPasadas')}</Card>)}
      </div>
    </div>
  )
}
