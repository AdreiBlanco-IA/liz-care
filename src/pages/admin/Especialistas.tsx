import { Building2, Languages, MapPin, Phone, Plus, Search, Stethoscope, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select, cx } from '../../components/ui'
import type { Sector } from '../../data/types'
import { useStore } from '../../lib/store'
import { buscarEspecialistas, datosEspecialistaVacios, especialidadesDe, idiomasDe, type CampoEspecialista } from '../../modules/especialistas/catalogo'

type Form = typeof datosEspecialistaVacios

function NuevoEspecialista({ especialidades, onClose }: { especialidades: string[]; onClose: () => void }) {
  const { guardarEspecialista, reportarFallo, notify } = useStore()
  const [f, setF] = useState<Form>(datosEspecialistaVacios)
  const [errores, setErrores] = useState<Partial<Record<CampoEspecialista, string>>>({})

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setF((x) => ({ ...x, [k]: e.target.value }))
    if (errores[k]) setErrores((x) => ({ ...x, [k]: undefined }))
  }

  // M11 valida y decide: sin nombre o sin especialidad no se agrega al catálogo (CA-16).
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const r = await guardarEspecialista(f)
    if (r.ok) { notify(`${r.especialista.nombre} se agregó al catálogo.`); onClose(); return }
    if (r.motivo === 'datos-invalidos') { setErrores(r.errores); return }
    if (r.motivo === 'sin-permiso') { notify('Solo la administración puede registrar especialistas.', 'error'); return }
    notify(`No se pudo guardar el especialista. Código ${reportarFallo('guardar especialista')}.`, 'error')
  }

  const inv = (k: CampoEspecialista) => ({ invalid: !!errores[k], 'aria-invalid': !!errores[k] })

  return (
    <Card className="mb-6 animate-fade-up p-5 sm:p-6">
      <form onSubmit={submit} noValidate>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Registrar especialista</h2>
            <p className="text-sm text-ink-500">Médico local al que la administración puede canalizar pacientes.</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full text-ink-500 hover:bg-ink-100" aria-label="Cerrar"><X className="size-4.5" /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" required error={errores.nombre}><Input value={f.nombre} onChange={set('nombre')} placeholder="Dra. Ana López" {...inv('nombre')} /></Field>
          <Field label="Especialidad" required error={errores.especialidad}>
            <Input value={f.especialidad} onChange={set('especialidad')} list="especialidades" {...inv('especialidad')} />
            <datalist id="especialidades">{especialidades.map((x) => <option key={x} value={x} />)}</datalist>
          </Field>
          <Field label="Hospital o clínica" required error={errores.institucion}><Input value={f.institucion} onChange={set('institucion')} {...inv('institucion')} /></Field>
          <Field label="Sector">
            <Select value={f.sector} onChange={set('sector')}><option>Privado</option><option>Público</option></Select>
          </Field>
          <Field label="Dirección" optional><Input value={f.direccion} onChange={set('direccion')} /></Field>
          <Field label="Teléfono" required error={errores.telefono}><Input type="tel" value={f.telefono} onChange={set('telefono')} {...inv('telefono')} /></Field>
          <Field label="Idiomas" required error={errores.idiomas} hint="Sepáralos con comas." className="sm:col-span-2">
            <Input value={f.idiomas} onChange={set('idiomas')} placeholder="Español, Inglés" {...inv('idiomas')} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar especialista</Button>
        </div>
      </form>
    </Card>
  )
}

export default function Especialistas() {
  const { especialistas, consultas } = useStore()
  const [q, setQ] = useState('')
  const [esp, setEsp] = useState('')
  const [idioma, setIdioma] = useState('')
  const [sector, setSector] = useState<'' | Sector>('')
  const [nuevo, setNuevo] = useState(false)
  const especialidades = especialidadesDe(especialistas)
  const idiomas = idiomasDe(especialistas)

  // M11: la búsqueda por especialidad e idioma exige ambas coincidencias; sin resultados no se sugiere a nadie.
  const lista = buscarEspecialistas(especialistas, { especialidad: esp, idioma, texto: q }).filter((e) => !sector || e.sector === sector)

  const stats = (id: string) => {
    const cs = consultas.filter((c) => c.especialistaId === id && c.estado === 'completada')
    return { consultas: cs.length, pacientes: new Set(cs.map((c) => c.pacienteId)).size }
  }

  return (
    <>
      <PageHeader title="Especialistas" subtitle="Catálogo interno de médicos locales para canalizar a tus pacientes"
        actions={!nuevo && <Button onClick={() => setNuevo(true)}><Plus className="size-4" /> Registrar especialista</Button>} />

      {nuevo && <NuevoEspecialista especialidades={especialidades} onClose={() => setNuevo(false)} />}

      <Card className="mb-6 p-3">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[1fr_230px_180px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar médico, especialidad u hospital"
              className="h-11 w-full rounded-xl border border-ink-200 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
          </div>
          <Select value={esp} onChange={(e) => setEsp(e.target.value)} aria-label="Especialidad">
            <option value="">Todas las especialidades</option>{especialidades.map((x) => <option key={x}>{x}</option>)}
          </Select>
          <Select value={idioma} onChange={(e) => setIdioma(e.target.value)} aria-label="Idioma">
            <option value="">Todos los idiomas</option>{idiomas.map((x) => <option key={x}>{x}</option>)}
          </Select>
          <div className="grid grid-cols-3 rounded-xl bg-ink-100 p-1">
            {(['', 'Público', 'Privado'] as const).map((s) => (
              <button key={s} onClick={() => setSector(s)} className={cx('rounded-lg text-xs font-bold transition', sector === s ? 'bg-white shadow-sm' : 'text-ink-500')}>{s || 'Todos'}</button>
            ))}
          </div>
        </div>
      </Card>

      {lista.length === 0 ? <Card><EmptyState icon={<Stethoscope className="size-6" />} title="Sin resultados" text={esp || idioma || q || sector ? 'Ningún especialista cumple los filtros seleccionados. Prueba quitar alguno.' : 'Aún no hay especialistas en el catálogo.'} /></Card> : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {lista.map((e) => {
            const s = stats(e.id)
            return (
              <Card key={e.id} className="p-5 transition hover:shadow-float">
                <div className="flex gap-4">
                  {e.foto ? <img src={e.foto} alt={e.nombre} className="size-24 shrink-0 rounded-2xl object-cover object-top" /> : <Avatar name={e.nombre} size={96} />}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-snug">{e.nombre}</h3>
                    <p className="text-sm font-semibold text-brand-700">{e.especialidad}</p>
                    <div className="mt-2"><Badge tone={e.sector === 'Público' ? 'blue' : 'violet'}>Sector {e.sector.toLowerCase()}</Badge></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-ink-600">
                  <p className="flex gap-2"><Building2 className="mt-0.5 size-4 shrink-0 text-ink-400" />{e.institucion}</p>
                  {e.direccion && <p className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" />{e.direccion}</p>}
                  <p className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-ink-400" />{e.telefono}</p>
                  <p className="flex gap-2"><Languages className="mt-0.5 size-4 shrink-0 text-ink-400" />{e.idiomas.join(' · ')}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-ink-100 pt-4 text-center">
                  <div className="rounded-xl bg-ink-50 py-2"><p className="text-lg font-extrabold">{s.pacientes}</p><p className="text-xs text-ink-500">Pacientes</p></div>
                  <div className="rounded-xl bg-ink-50 py-2"><p className="text-lg font-extrabold">{s.consultas}</p><p className="text-xs text-ink-500">Consultas</p></div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
