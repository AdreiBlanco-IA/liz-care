import { Languages } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { cx } from './ui'

export function LangToggle({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useI18n()
  return (
    <div className={cx('flex items-center gap-1 rounded-full p-1', dark ? 'bg-white/10' : 'bg-ink-100')} role="group" aria-label="Idioma / Language">
      <Languages className={cx('ml-1.5 mr-0.5 size-4', dark ? 'text-white/70' : 'text-ink-500')} />
      {(['es', 'en'] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={cx('h-7 rounded-full px-2.5 text-xs font-bold uppercase transition',
            lang === l ? (dark ? 'bg-white text-ink-900' : 'bg-white text-ink-900 shadow-sm') : (dark ? 'text-white/70 hover:text-white' : 'text-ink-500 hover:text-ink-800'))}>
          {l}
        </button>
      ))}
    </div>
  )
}
