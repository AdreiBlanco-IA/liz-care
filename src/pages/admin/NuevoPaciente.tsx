import { AlertTriangle, ArrowLeft, HeartPulse, Phone, Save, Send, ShieldAlert, UserRound } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, Button, ButtonLink, Card, Field, Input, PageHeader, Select, Toggle } from '../../components/ui'
import { edad, fechaCorta, nombreCompleto, normalizar } from '../../lib/format'
import { useStore } from '../../lib/store'

const nacionalidades: [string, string][] = [
  ['Estadounidense', 'US'], ['Canadiense', 'CA'], ['Británica', 'GB'], ['Alemana', 'DE'], ['Francesa', 'FR'],
  ['Española', 'ES'], ['Italiana', 'IT'], ['Japonesa', 'JP'], ['Coreana', 'KR'], ['China', 'CN'], ['Brasileña', 'BR'],
  ['Argentina', 'AR'], ['Colombiana', 'CO'], ['Mexicana', 'MX'], ['Otra', 'XX'],
]
const idiomas = ['Inglés', 'Español', 'Francés', 'Alemán', 'Portugués', 'Italiano', 'Japonés', 'Coreano', 'Chino', 'Otro']
const parentescos = ['Esposo(a)', 'Pareja', 'Padre', 'Madre', 'Hijo(a)', 'Hermano(a)', 'Amigo(a)', 'Otro']

const vacio = {
  nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', sexo: '' as '' | 'F' | 'M' | 'X',
  nacionalidad: '', idioma: '', telefono: '', email: '', padecimientoPrincipal: '',
  emNombre: '', emParentesco: '', emTelefono: '',
}
type Form = typeof vacio
const requeridos: (keyof Form)[] = ['nombre', 'apellidoPaterno', 'fechaNacimiento', 'sexo', 'nacionalidad', 'idioma', 'telefono', 'email', 'padecimientoPrincipal', 'emNombre', 'emParentesco', 'emTelefono']

function Seccion({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>
        <div><h2 className="font-bold">{title}</h2><p className="text-sm text-ink-500">{desc}</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  )
}

export default function NuevoPaciente() {
  const { pacientes, agregarPaciente, notify } = useStore()
  const navigate = useNavigate()
  const [f, setF] = useState<Form>(vacio)
  const [errores, setErrores] = useState<Partial<Record<keyof Form, string>>>({})
  const [invitar, setInvitar] = useState(true)
  const [confirmarDuplicado, setConfirmarDuplicado] = useState(false)

  const set = (k: keyof Form) => (e: { target: { value: string } }) => {
    setF((x) => ({ ...x, [k]: e.target.value }))
    if (errores[k]) setErrores((x) => ({ ...x, [k]: undefined }))
    setConfirmarDuplicado(false)
  }

  const duplicados = useMemo(() => {
    const nom = normalizar(`${f.nombre} ${f.apellidoPaterno}`)
    const mail = normalizar(f.email)
    if (nom.length < 4 && !mail.includes('@')) return []
    return pacientes.filter((p) => {
      const mismoNombre = nom.length >= 4 && normalizar(`${p.nombre} ${p.apellidoPaterno}`) === nom
      const mismoCorreo = mail.includes('@') && normalizar(p.email) === mail
      const mismaFecha = !!f.fechaNacimiento && p.fechaNacimiento === f.fechaNacimiento
      return mismoCorreo || (mismoNombre && (mismaFecha || !f.fechaNacimiento))
    })
  }, [f.nombre, f.apellidoPaterno, f.email, f.fechaNacimiento, pacientes])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errores = {}
    requeridos.forEach((k) => { if (!String(f[k]).trim()) errs[k] = 'Este campo es obligatorio.' })
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) errs.email = 'Escribe un correo válido.'
    if (f.fechaNacimiento && new Date(f.fechaNacimiento) > new Date()) errs.fechaNacimiento = 'La fecha no puede ser futura.'
    setErrores(errs)
    if (Object.keys(errs).length) {
      notify('Revisa los campos marcados en rojo.', 'error')
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (duplicados.length && !confirmarDuplicado) {
      setConfirmarDuplicado(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const pais = nacionalidades.find(([n]) => n === f.nacionalidad)?.[1] ?? 'XX'
    const p = agregarPaciente({
      nombre: f.nombre.trim(), apellidoPaterno: f.apellidoPaterno.trim(), apellidoMaterno: f.apellidoMaterno.trim() || undefined,
      fechaNacimiento: f.fechaNacimiento, sexo: f.sexo as 'F' | 'M' | 'X', nacionalidad: f.nacionalidad, pais, idioma: f.idioma,
      telefono: f.telefono.trim(), email: f.email.trim().toLowerCase(), padecimientoPrincipal: f.padecimientoPrincipal.trim(),
      contactoEmergencia: { nombre: f.emNombre.trim(), parentesco: f.emParentesco, telefono: f.emTelefono.trim() },
      activo: true, portal: invitar ? 'invitado' : 'sin acceso',
    })
    notify(invitar ? `${p.nombre} fue registrado. Se envió la invitación al portal.` : `${p.nombre} fue registrado correctamente.`)
    navigate(`/admin/pacientes/${p.id}`)
  }

  const inv = (k: keyof Form) => ({ invalid: !!errores[k], 'aria-invalid': !!errores[k] })

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        back={<Link to="/admin/pacientes" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft className="size-4" /> Pacientes</Link>}
        title="Registrar paciente"
        subtitle="Captura la información básica. El historial médico lo llenará el paciente desde su portal."
      />

      {duplicados.length > 0 && (
        <div className={`mb-6 animate-fade-up rounded-2xl border p-4 sm:p-5 ${confirmarDuplicado ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`} role="alert">
          <div className="flex gap-3">
            <AlertTriangle className={`size-5 shrink-0 ${confirmarDuplicado ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="flex-1">
              <p className="font-bold text-ink-900">Posible paciente duplicado</p>
              <p className="text-sm text-ink-600">
                {confirmarDuplicado
                  ? 'Confirma que se trata de una persona distinta. Presiona “Guardar paciente” otra vez para registrarlo de todos modos.'
                  : 'Ya existe un paciente con datos muy parecidos. Verifica antes de guardar.'}
              </p>
              <div className="mt-3 space-y-2">
                {duplicados.map((p) => (
                  <Link key={p.id} to={`/admin/pacientes/${p.id}`} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm hover:ring-2 hover:ring-brand-200">
                    <Avatar name={nombreCompleto(p)} color={p.color} size={36} />
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-semibold">{nombreCompleto(p)}</p>
                      <p className="truncate text-ink-500">{p.email} · {edad(p.fechaNacimiento)} años · alta {fechaCorta(p.altaEl)}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-brand-600">Ver expediente</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Seccion icon={<UserRound className="size-5" />} title="Datos personales" desc="Nombre como aparece en su pasaporte o identificación.">
            <Field label="Nombre(s)" required error={errores.nombre}><Input value={f.nombre} onChange={set('nombre')} placeholder="Emily" {...inv('nombre')} /></Field>
            <Field label="Primer apellido" required error={errores.apellidoPaterno}><Input value={f.apellidoPaterno} onChange={set('apellidoPaterno')} placeholder="Carter" {...inv('apellidoPaterno')} /></Field>
            <Field label="Segundo apellido" optional hint="Muchos pacientes extranjeros solo tienen un apellido."><Input value={f.apellidoMaterno} onChange={set('apellidoMaterno')} /></Field>
            <Field label="Fecha de nacimiento" required error={errores.fechaNacimiento}><Input type="date" value={f.fechaNacimiento} onChange={set('fechaNacimiento')} max={new Date().toISOString().slice(0, 10)} {...inv('fechaNacimiento')} /></Field>
            <Field label="Sexo" required error={errores.sexo}>
              <Select value={f.sexo} onChange={set('sexo')} {...inv('sexo')}>
                <option value="">Selecciona</option><option value="F">Femenino</option><option value="M">Masculino</option><option value="X">Prefiere no decir</option>
              </Select>
            </Field>
            <Field label="Nacionalidad" required error={errores.nacionalidad}>
              <Select value={f.nacionalidad} onChange={set('nacionalidad')} {...inv('nacionalidad')}>
                <option value="">Selecciona</option>{nacionalidades.map(([n]) => <option key={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Idioma preferido" required error={errores.idioma} hint="Define si necesitará traducción en sus consultas.">
              <Select value={f.idioma} onChange={set('idioma')} {...inv('idioma')}>
                <option value="">Selecciona</option>{idiomas.map((n) => <option key={n}>{n}</option>)}
              </Select>
            </Field>
          </Seccion>

          <Seccion icon={<Phone className="size-5" />} title="Contacto" desc="Por aquí recibirá su acceso al portal y recordatorios.">
            <Field label="Teléfono / WhatsApp" required error={errores.telefono}><Input type="tel" value={f.telefono} onChange={set('telefono')} placeholder="+1 512 555 0142" {...inv('telefono')} /></Field>
            <Field label="Correo electrónico" required error={errores.email}><Input type="email" value={f.email} onChange={set('email')} placeholder="paciente@correo.com" {...inv('email')} /></Field>
          </Seccion>

          <Seccion icon={<ShieldAlert className="size-5" />} title="Contacto de emergencia" desc="Persona a quien llamar si el paciente no puede comunicarse.">
            <Field label="Nombre completo" required error={errores.emNombre}><Input value={f.emNombre} onChange={set('emNombre')} {...inv('emNombre')} /></Field>
            <Field label="Parentesco" required error={errores.emParentesco}>
              <Select value={f.emParentesco} onChange={set('emParentesco')} {...inv('emParentesco')}>
                <option value="">Selecciona</option>{parentescos.map((n) => <option key={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Teléfono" required error={errores.emTelefono}><Input type="tel" value={f.emTelefono} onChange={set('emTelefono')} {...inv('emTelefono')} /></Field>
          </Seccion>

          <Seccion icon={<HeartPulse className="size-5" />} title="Información médica" desc="Solo el motivo principal. El resto lo captura el paciente en su historial inicial.">
            <Field label="Padecimiento principal" required error={errores.padecimientoPrincipal} className="sm:col-span-2">
              <Input value={f.padecimientoPrincipal} onChange={set('padecimientoPrincipal')} placeholder="Ej. Hipertensión arterial, control prenatal, dolor lumbar…" {...inv('padecimientoPrincipal')} />
            </Field>
          </Seccion>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-5">
            <h3 className="font-bold">Acceso al portal</h3>
            <p className="mt-1 text-sm text-ink-500">El paciente recibirá un correo para crear su contraseña y llenar su historial médico inicial.</p>
            <div className="mt-4"><Toggle checked={invitar} onChange={setInvitar} label="Enviar invitación al portal" description={f.email || 'Al correo registrado'} /></div>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-ink-500">Los campos con <span className="font-bold text-brand-600">*</span> son obligatorios. Solo se guardan los datos necesarios para la atención del paciente (LFPDPPP).</p>
            <div className="mt-4 grid gap-2">
              <Button type="submit" size="lg">{invitar ? <Send className="size-4.5" /> : <Save className="size-4.5" />} Guardar paciente</Button>
              <ButtonLink to="/admin/pacientes" variant="ghost">Cancelar</ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}
