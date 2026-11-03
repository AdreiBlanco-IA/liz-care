import { Link } from 'react-router-dom'
import { cx } from './ui'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cx('size-9', className)} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#00a58c" />
      <path d="M32 49s-15-9.2-15-20.3C17 23 21.2 19 26.3 19c2.5 0 4.4 1.1 5.7 3 1.3-1.9 3.2-3 5.7-3C42.8 19 47 23 47 28.7 47 39.8 32 49 32 49z" fill="#fff" />
      <path d="M24 31h5l2-4 3 8 2-4h4" fill="none" stroke="#00a58c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ to = '/', light, sub }: { to?: string; light?: boolean; sub?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="Liz Care, inicio">
      <LogoMark />
      <span className="leading-none">
        <span className={cx('block text-xl font-extrabold tracking-tight', light ? 'text-white' : 'text-ink-900')}>
          liz<span className="text-brand-500">care</span>
        </span>
        {sub && <span className={cx('mt-0.5 block whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]', light ? 'text-white/60' : 'text-ink-400')}>{sub}</span>}
      </span>
    </Link>
  )
}
