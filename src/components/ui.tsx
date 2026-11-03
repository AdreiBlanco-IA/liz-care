import { CheckCircle2, XCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import type { Especialista } from '../data/types'
import { iniciales } from '../lib/format'
import { useStore } from '../lib/store'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'white'
type Size = 'sm' | 'md' | 'lg'

export function btn(variant: Variant = 'primary', size: Size = 'md') {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap',
    size === 'sm' && 'h-9 px-4 text-sm',
    size === 'md' && 'h-11 px-5 text-sm',
    size === 'lg' && 'h-13 px-7 text-base',
    variant === 'primary' && 'bg-brand-500 text-white shadow-sm shadow-brand-500/30 hover:bg-brand-600',
    variant === 'secondary' && 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    variant === 'outline' && 'border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50',
    variant === 'ghost' && 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    variant === 'dark' && 'bg-ink-900 text-white hover:bg-ink-800',
    variant === 'white' && 'bg-white text-ink-900 shadow-sm hover:bg-ink-50',
  )
}

export function Button({ variant, size, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button {...p} className={cx(btn(variant, size), className)} />
}

export function ButtonLink({ variant, size, className, ...p }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link {...p} className={cx(btn(variant, size), className)} />
}

export function Card({ className, children, ...p }: { className?: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cx('rounded-2xl border border-ink-100 bg-white shadow-card', className)}>{children}</div>
}

export function CardHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</div>}
        <div className="min-w-0">
          <h3 className="truncate font-bold text-ink-900">{title}</h3>
          {subtitle && <p className="truncate text-sm text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

type Tone = 'brand' | 'gray' | 'amber' | 'red' | 'blue' | 'violet'
export function Badge({ tone = 'gray', children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
      tone === 'brand' && 'bg-brand-50 text-brand-700',
      tone === 'gray' && 'bg-ink-100 text-ink-600',
      tone === 'amber' && 'bg-amber-50 text-amber-700',
      tone === 'red' && 'bg-red-50 text-red-700',
      tone === 'blue' && 'bg-sky-50 text-sky-700',
      tone === 'violet' && 'bg-violet-50 text-violet-700',
      className,
    )}>{icon}{children}</span>
  )
}

export function Avatar({ name, src, color = '#00a58c', size = 40, className }: { name: string; src?: string; color?: string; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: size * 0.36 }
  if (src) return <img src={src} alt={name} style={style} className={cx('shrink-0 rounded-full object-cover object-top ring-2 ring-white', className)} />
  return (
    <div style={{ ...style, backgroundColor: `${color}1f`, color }} className={cx('grid shrink-0 place-items-center rounded-full font-bold ring-2 ring-white', className)}>
      {iniciales(name)}
    </div>
  )
}

export function Field({ label, hint, error, required, optional, children, className }: {
  label: string; hint?: string; error?: string; required?: boolean; optional?: boolean; children: ReactNode; className?: string
}) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink-800">
        {label}
        {required && <span className="text-brand-600">*</span>}
        {optional && <span className="font-normal text-ink-400">(opcional)</span>}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>
        : hint ? <span className="mt-1.5 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  )
}

const inputBase = 'w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-400 transition focus:outline-none focus:ring-4'
const inputOk = 'border-ink-200 focus:border-brand-500 focus:ring-brand-500/15'
const inputErr = 'border-red-400 focus:border-red-500 focus:ring-red-500/15'

export function Input({ invalid, className, ...p }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...p} className={cx(inputBase, 'h-11', invalid ? inputErr : inputOk, className)} />
}

export function Select({ invalid, className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select {...p} className={cx(inputBase, 'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2020%2020%27%20fill=%27%235d7385%27%3E%3Cpath%20d=%27M5.5%207.5l4.5%204.5%204.5-4.5%27%20stroke=%27%235d7385%27%20stroke-width=%271.6%27%20fill=%27none%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10', invalid ? inputErr : inputOk, className)}>{children}</select>
}

export function Textarea({ invalid, className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea {...p} className={cx(inputBase, 'min-h-24 py-2.5', invalid ? inputErr : inputOk, className)} />
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-start gap-3 text-left">
      <span className={cx('relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-brand-500' : 'bg-ink-200')}>
        <span className={cx('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-5.5' : 'left-0.5')} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        {description && <span className="block text-xs text-ink-500">{description}</span>}
      </span>
    </button>
  )
}

export function DoctorChip({ e, size = 40, sub }: { e: Especialista; size?: number; sub?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={e.nombre} src={e.foto} size={size} />
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{e.nombre}</p>
        <p className="truncate text-sm text-ink-500">{sub ?? e.especialidad}</p>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, actions, back }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6 animate-fade-up">
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <p className="font-bold text-ink-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Toaster() {
  const { toasts } = useStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex max-w-md animate-fade-up items-center gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-float">
          {t.tipo === 'ok' ? <CheckCircle2 className="size-5 shrink-0 text-brand-300" /> : <XCircle className="size-5 shrink-0 text-red-300" />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b border-ink-100 px-1">
      {items.map((i) => (
        <button key={i.value} onClick={() => onChange(i.value)}
          className={cx('relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 text-sm font-semibold transition',
            value === i.value ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800')}>
          {i.label}
          {i.count !== undefined && <span className={cx('rounded-full px-1.5 text-xs', value === i.value ? 'bg-brand-50' : 'bg-ink-100')}>{i.count}</span>}
          {value === i.value && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-500" />}
        </button>
      ))}
    </div>
  )
}
