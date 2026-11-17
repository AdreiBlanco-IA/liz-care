import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { Badge, Card } from '../../components/ui'
import { INVENTARIO, type Entidad } from '../../modules/privacidad/inventario'

const TITULOS: Record<Entidad, string> = {
  paciente: 'Datos del paciente',
  historial: 'Historial médico inicial',
  consulta: 'Citas y consultas',
  medicamento: 'Tratamiento y medicamentos',
  receta: 'Foto de la receta',
  especialista: 'Especialistas (catálogo interno)',
}

const ROL = { admin: 'Administración', paciente: 'Paciente' } as const

/** M10 · RNF-03 / CA-14: qué datos se guardan, para qué y quién los ve. Se genera del mismo inventario que verifican las pruebas. */
export default function Privacidad() {
  return (
    <div className="min-h-dvh bg-ink-50/50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft className="size-4" /> Volver al inicio</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 max-w-2xl">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><ShieldCheck className="size-6" /></span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Aviso de privacidad y datos que guardamos</h1>
          <p className="mt-3 text-ink-600">
            Liz Care solo guarda los datos necesarios para coordinar la atención médica del paciente. Cada dato tiene una finalidad, y
            cada persona ve únicamente lo que le corresponde: el paciente, su propia información; la administración, la de todos sus pacientes.
          </p>
          <p className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
            <Lock className="mt-0.5 size-4.5 shrink-0 text-amber-600" />
            Borrador del prototipo: describe las medidas de diseño del sistema. El texto legal definitivo conforme a la LFPDPPP lo valida el responsable del proyecto antes de usar datos reales.
          </p>
        </div>

        <div className="space-y-6">
          {(Object.keys(INVENTARIO) as Entidad[]).map((entidad) => (
            <Card key={entidad} className="overflow-hidden">
              <h2 className="border-b border-ink-100 bg-ink-50 px-5 py-3 text-sm font-bold">{TITULOS[entidad]}</h2>
              <ul className="divide-y divide-ink-100">
                {INVENTARIO[entidad].map((d) => (
                  <li key={d.campo} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[180px_1fr_auto] sm:gap-4">
                    <p className="font-mono text-xs font-semibold text-ink-700">{d.campo}</p>
                    <p className="text-ink-600">{d.finalidad}</p>
                    <p className="flex flex-wrap items-start gap-1.5 sm:justify-end">
                      {d.sensible && <Badge tone="amber">Dato de salud</Badge>}
                      {d.ven.map((r) => <Badge key={r} tone={r === 'admin' ? 'violet' : 'blue'}>{ROL[r]}</Badge>)}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
