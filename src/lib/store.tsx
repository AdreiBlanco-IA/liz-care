import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { administradores, consultasIniciales, credencialesDemo, especialistas as especialistasIniciales, pacientesIniciales } from '../data/mock'
import { insertarPaciente, listarPacientes } from '../data/pacientesSupabase'
import { supabase } from '../data/supabase'
import type { Consulta, Especialista, HistorialInicial, Paciente, Rol, Sesion } from '../data/types'

interface Toast { id: number; msg: string; tipo: 'ok' | 'error' }

interface Store {
  pacientes: Paciente[]
  consultas: Consulta[]
  especialistas: Especialista[]
  sesion: Sesion | null
  toasts: Toast[]
  login: (email: string, password: string, rol: Rol) => Promise<boolean>
  logout: () => void
  agregarPaciente: (p: Omit<Paciente, 'id' | 'altaEl' | 'color'>) => Promise<Paciente>
  agregarEspecialista: (e: Omit<Especialista, 'id'>) => Especialista
  agregarConsulta: (c: Omit<Consulta, 'id'>) => Consulta
  actualizarConsulta: (c: Consulta) => void
  guardarHistorial: (pacienteId: string, h: HistorialInicial) => void
  notify: (msg: string, tipo?: Toast['tipo']) => void
}

const Ctx = createContext<Store | null>(null)
const SESSION_KEY = 'lizcare.sesion'
const COLORES = ['#00a58c', '#3b6fd8', '#d1497b', '#e0812b', '#7b5cd6', '#0f8fb3', '#2f9e5b']

function leerSesion(): Sesion | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Sesion) : null
  } catch {
    return null
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState(pacientesIniciales)
  const [consultas, setConsultas] = useState(consultasIniciales)
  const [especialistas, setEspecialistas] = useState(especialistasIniciales)
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((msg: string, tipo: Toast['tipo'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, tipo }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  // Con Supabase, la administración se lee de la base; los pacientes de demostración se conservan
  // porque las consultas, la agenda y el portal todavía dependen de ellos.
  useEffect(() => {
    if (!supabase || sesion?.rol !== 'admin') return
    let vigente = true
    listarPacientes(supabase)
      .then((remotos) => { if (vigente) setPacientes([...remotos, ...pacientesIniciales]) })
      .catch(() => notify('No se pudieron cargar los pacientes guardados.', 'error'))
    return () => { vigente = false }
  }, [sesion?.rol, notify])

  const login = useCallback(async (email: string, password: string, rol: Rol) => {
    const e = email.trim().toLowerCase()
    let s: Sesion | null = null
    if (rol === 'admin' && supabase) {
      // M01: la administradora entra con Supabase Auth y su rol se toma de public.perfil.
      const { data, error } = await supabase.auth.signInWithPassword({ email: e, password })
      if (error || !data.user) return false
      const { data: perfil } = await supabase.from('perfil').select('nombre, rol').eq('usuario_id', data.user.id).maybeSingle()
      if (perfil?.rol !== 'administrador') { await supabase.auth.signOut(); return false }
      s = { rol, nombre: perfil.nombre, email: e }
    } else if (rol === 'admin' && password === credencialesDemo.admin.password) {
      const a = administradores.find((x) => x.email === e)
      if (a) s = { rol, nombre: a.nombre, email: e }
    }
    if (rol === 'paciente' && password === 'demo123') {
      const p = pacientes.find((x) => x.email.toLowerCase() === e && x.portal === 'activo')
      if (p) s = { rol, nombre: `${p.nombre} ${p.apellidoPaterno}`, email: e, pacienteId: p.id }
    }
    if (!s) return false
    setSesion(s)
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* modo privado */ }
    return true
  }, [pacientes])

  const logout = useCallback(() => {
    void supabase?.auth.signOut()
    setPacientes(pacientesIniciales)
    setSesion(null)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* modo privado */ }
  }, [])

  const agregarPaciente = useCallback(async (p: Omit<Paciente, 'id' | 'altaEl' | 'color'>) => {
    if (supabase && sesion?.rol === 'admin') {
      const guardado = await insertarPaciente(supabase, p)
      setPacientes((ps) => [guardado, ...ps])
      return guardado
    }
    const nuevo: Paciente = {
      ...p,
      id: `p${Date.now()}`,
      altaEl: new Date().toISOString(),
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
    }
    setPacientes((ps) => [nuevo, ...ps])
    return nuevo
  }, [sesion?.rol])

  const agregarEspecialista = useCallback((e: Omit<Especialista, 'id'>) => {
    const nuevo: Especialista = { ...e, id: `e${Date.now()}` }
    setEspecialistas((es) => [...es, nuevo])
    return nuevo
  }, [])

  const agregarConsulta = useCallback((c: Omit<Consulta, 'id'>) => {
    const nueva: Consulta = { ...c, id: `c${Date.now()}` }
    setConsultas((cs) => [...cs, nueva])
    return nueva
  }, [])

  const actualizarConsulta = useCallback((c: Consulta) => {
    setConsultas((cs) => cs.map((x) => (x.id === c.id ? c : x)))
  }, [])

  const guardarHistorial = useCallback((pacienteId: string, h: HistorialInicial) => {
    setPacientes((ps) => ps.map((p) => (p.id === pacienteId ? { ...p, historialInicial: h } : p)))
  }, [])

  const value = useMemo<Store>(() => ({
    pacientes, consultas, especialistas, sesion, toasts,
    login, logout, agregarPaciente, agregarEspecialista, agregarConsulta, actualizarConsulta, guardarHistorial, notify,
  }), [pacientes, consultas, especialistas, sesion, toasts, login, logout, agregarPaciente, agregarEspecialista, agregarConsulta, actualizarConsulta, guardarHistorial, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}
