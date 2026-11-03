import { useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from './components/ui'
import type { Rol } from './data/types'
import AdminLayout from './layouts/AdminLayout'
import PortalLayout from './layouts/PortalLayout'
import { useStore } from './lib/store'
import Agenda from './pages/admin/Agenda'
import Dashboard from './pages/admin/Dashboard'
import Especialistas from './pages/admin/Especialistas'
import NuevaConsulta from './pages/admin/NuevaConsulta'
import NuevoPaciente from './pages/admin/NuevoPaciente'
import PacienteDetalle from './pages/admin/PacienteDetalle'
import Pacientes from './pages/admin/Pacientes'
import Citas from './pages/portal/Citas'
import Expediente from './pages/portal/Expediente'
import HistorialForm from './pages/portal/HistorialForm'
import Inicio from './pages/portal/Inicio'
import Tratamiento from './pages/portal/Tratamiento'
import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import NotFound from './pages/public/NotFound'

function RequireRol({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { sesion } = useStore()
  const loc = useLocation()
  if (!sesion) return <Navigate to={`/login?rol=${rol}`} replace state={{ from: loc.pathname }} />
  if (sesion.rol !== rol) return <Navigate to={sesion.rol === 'admin' ? '/admin' : '/portal'} replace />
  return <>{children}</>
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<RequireRol rol="admin"><AdminLayout /></RequireRol>}>
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="pacientes/nuevo" element={<NuevoPaciente />} />
          <Route path="pacientes/:id" element={<PacienteDetalle />} />
          <Route path="consultas/nueva" element={<NuevaConsulta />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="especialistas" element={<Especialistas />} />
        </Route>
        <Route path="/portal" element={<RequireRol rol="paciente"><PortalLayout /></RequireRol>}>
          <Route index element={<Inicio />} />
          <Route path="citas" element={<Citas />} />
          <Route path="tratamiento" element={<Tratamiento />} />
          <Route path="expediente" element={<Expediente />} />
          <Route path="historial-inicial" element={<HistorialForm />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
