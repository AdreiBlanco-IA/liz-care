import { ChevronRight, Filter, Search, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Avatar, Badge, ButtonLink, Card, EmptyState, PageHeader, cx } from '../../components/ui'
import type { Paciente } from '../../data/types'
import { edad, fechaCorta, nombreCompleto, normalizar, porFechaAsc, porFechaDesc } from '../../lib/format'
import { useStore } from '../../lib/store'

type Filtro = 'todos' | 'activos' | 'pendiente' | 'inactivos'

function EstadoHistorial({ p }: { p: Paciente }) {
  return p.historialInicial
    ? <Badge tone="brand">Historial completo</Badge>
    : <Badge tone="amber">Historial pendiente</Badge>
}

export default function Pacientes() {
  const { pacientes, consultas, especialistas } = useStore()
  const [params, setParams] = useSearchParams()
  const filtro = (params.get('filtro') as Filtro) || 'activos'
  const [q, setQ] = useState('')

  const info = useMemo(() => {
    const ahora = new Date()
    return Object.fromEntries(pacientes.map((p) => {
      const cs = consultas.filter((c) => c.pacienteId === p.id)
      const proxima = cs.filter((c) => c.estado === 'programada' && new Date(c.fecha) >= ahora).sort(porFechaAsc)[0]
      const ultima = cs.filter((c) => c.estado === 'completada').sort(porFechaDesc)[0]
      return [p.id, { proxima, ultima, total: cs.filter((c) => c.estado === 'completada').length }]
    }))
  }, [pacientes, consultas])

  const lista = pacientes.filter((p) => {
    if (filtro === 'activos' && !p.activo) return false
    if (filtro === 'inactivos' && p.activo) return false
    if (filtro === 'pendiente' && (p.historialInicial || !p.activo)) return false
    const n = normalizar(q)
    return !n || normalizar(`${nombreCompleto(p)} ${p.email} ${p.padecimientoPrincipal} ${p.nacionalidad}`).includes(n)
  })

  const filtros: { v: Filtro; l: string; n: number }[] = [
    { v: 'activos', l: 'Activos', n: pacientes.filter((p) => p.activo).length },
    { v: 'pendiente', l: 'Historial pendiente', n: pacientes.filter((p) => p.activo && !p.historialInicial).length },
    { v: 'inactivos', l: 'Servicio terminado', n: pacientes.filter((p) => !p.activo).length },
    { v: 'todos', l: 'Todos', n: pacientes.length },
  ]

  const esp = (id?: string) => especialistas.find((e) => e.id === id)

  return (
    <>
      <PageHeader title="Pacientes" subtitle={`${pacientes.filter((p) => p.activo).length} pacientes activos`}
        actions={<ButtonLink to="/admin/pacientes/nuevo"><UserPlus className="size-4" /> Registrar paciente</ButtonLink>} />

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo, padecimiento o nacionalidad"
              className="h-11 w-full rounded-xl border border-ink-200 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15" />
          </div>
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto">
            <Filter className="size-4 shrink-0 text-ink-400" />
            {filtros.map((f) => (
              <button key={f.v} onClick={() => setParams({ filtro: f.v }, { replace: true })}
                className={cx('flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
                  filtro === f.v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300')}>
                {f.l}<span className="text-xs opacity-70">{f.n}</span>
              </button>
            ))}
          </div>
        </div>

        {lista.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="No encontramos pacientes" text="Prueba con otro término de búsqueda o cambia el filtro." />
        ) : (
          <>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="text-xs font-bold uppercase tracking-wider text-ink-400">
                <tr className="border-b border-ink-100">
                  <th className="px-5 py-3">Paciente</th>
                  <th className="px-3 py-3">Padecimiento principal</th>
                  <th className="hidden px-3 py-3 xl:table-cell">Última consulta</th>
                  <th className="px-3 py-3">Próxima cita</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {lista.map((p) => {
                  const i = info[p.id]; const e = esp(i.proxima?.especialistaId)
                  return (
                    <tr key={p.id} className="group cursor-pointer transition hover:bg-ink-50/70">
                      <td className="px-5 py-3.5">
                        <Link to={`/admin/pacientes/${p.id}`} className="flex items-center gap-3">
                          <Avatar name={nombreCompleto(p)} color={p.color} size={40} />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-ink-900 group-hover:text-brand-700">{nombreCompleto(p)}</p>
                            <p className="truncate text-xs text-ink-500">{edad(p.fechaNacimiento)} años · {p.nacionalidad} · {p.idioma}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-ink-700">{p.padecimientoPrincipal}</td>
                      <td className="hidden px-3 py-3.5 text-ink-600 xl:table-cell">{i.ultima ? fechaCorta(i.ultima.fecha) : <span className="text-ink-400">—</span>}</td>
                      <td className="px-3 py-3.5">
                        {i.proxima && e ? (
                          <div><p className="font-semibold text-ink-800">{fechaCorta(i.proxima.fecha)}</p><p className="text-xs text-ink-500">{e.especialidad}</p></div>
                        ) : <span className="text-ink-400">Sin cita</span>}
                      </td>
                      <td className="px-3 py-3.5">{p.activo ? <EstadoHistorial p={p} /> : <Badge>Inactivo</Badge>}</td>
                      <td className="pr-4"><Link to={`/admin/pacientes/${p.id}`} aria-label={`Abrir ${nombreCompleto(p)}`}><ChevronRight className="size-5 text-ink-300 group-hover:text-brand-500" /></Link></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <ul className="divide-y divide-ink-100 md:hidden">
              {lista.map((p) => {
                const i = info[p.id]
                return (
                  <li key={p.id}>
                    <Link to={`/admin/pacientes/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-ink-50">
                      <Avatar name={nombreCompleto(p)} color={p.color} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{nombreCompleto(p)}</p>
                        <p className="truncate text-sm text-ink-500">{p.padecimientoPrincipal}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {p.activo ? <EstadoHistorial p={p} /> : <Badge>Inactivo</Badge>}
                          {i.proxima && <Badge tone="gray">Cita {fechaCorta(i.proxima.fecha)}</Badge>}
                        </div>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-ink-300" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Card>
    </>
  )
}
