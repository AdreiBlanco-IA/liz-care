import { Compass } from 'lucide-react'
import { ButtonLink } from '../../components/ui'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Compass className="size-8" /></div>
        <h1 className="mt-6 text-3xl font-extrabold">Página no encontrada</h1>
        <p className="mt-2 text-ink-500">La dirección que buscas no existe o no tienes acceso a ella.</p>
        <ButtonLink to="/" className="mt-6">Volver al inicio</ButtonLink>
      </div>
    </div>
  )
}
