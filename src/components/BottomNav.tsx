'use client'
import { usePathname, useRouter } from 'next/navigation'

const ITEMS = [
  { href: '/home',        icon: '🏠', label: 'الرئيسية' },
  { href: '/search',      icon: '🔍', label: 'بحث' },
  { href: '/collections', icon: '💡', label: 'أفكار' },
  { href: '/profile',     icon: '👤', label: 'حسابي' },
]

export default function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav style={{
      position: 'fixed', bottom: 0,
      width: '390px', height: 'var(--nav-h)',
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '0 6px 8px', zIndex: 100,
    }}
    className="bottom-nav-bar"
    >
      <style>{`.bottom-nav-bar { width: 390px; } @media(max-width:430px){.bottom-nav-bar{width:100%;}}`}</style>

      {ITEMS.slice(0, 2).map(item => (
        <NavBtn key={item.href} item={item} active={pathname === item.href} onClick={() => router.push(item.href)} />
      ))}

      {/* Add button */}
      <button onClick={onAdd} style={{
        width: 50, height: 50,
        background: 'var(--accent)',
        borderRadius: 15, border: 'none',
        fontSize: 28, color: 'white',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(255,122,0,0.45)',
        transition: 'transform 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >＋</button>

      {ITEMS.slice(2).map(item => (
        <NavBtn key={item.href} item={item} active={pathname === item.href} onClick={() => router.push(item.href)} />
      ))}
    </nav>
  )
}

function NavBtn({ item, active, onClick }: { item: typeof ITEMS[0]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 3, padding: '6px 14px', border: 'none',
      background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
      borderRadius: 12,
    }}>
      <span style={{ fontSize: 22, color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>{item.icon}</span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>{item.label}</span>
    </button>
  )
}
