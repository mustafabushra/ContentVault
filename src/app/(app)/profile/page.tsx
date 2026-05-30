'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useItems } from '@/contexts/ItemsContext'

export default function ProfilePage() {
  const { user, isAnonymous, upgradeToGoogle, logout } = useAuth()
  const { items } = useItems()
  const router = useRouter()
  const [notif, setNotif] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  if (!user) return null

  const stats = [
    { num: items.length, label: 'محفوظات', icon: '📚' },
    { num: items.filter(it => it.isFavorite).length, label: 'مفضلة', icon: '❤️' },
    { num: items.filter(it => it.analysis).length, label: 'محللة', icon: '🧠' },
  ]

  async function handleUpgrade() {
    setUpgrading(true)
    try { await upgradeToGoogle() }
    finally { setUpgrading(false) }
  }

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 24px', marginBottom: 8 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', marginBottom: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
          {user.photoURL
            ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', background: isAnonymous ? '#E8E8F0' : 'linear-gradient(135deg,#FF7A00,#FF4500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                {isAnonymous ? '👤' : (user.displayName?.[0]?.toUpperCase() ?? '😊')}
              </div>
          }
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>
          {isAnonymous ? 'زائر' : (user.displayName ?? 'مستخدم')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          {isAnonymous ? 'غير مسجّل الدخول' : user.email}
        </div>
        <div style={{ padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800, background: isAnonymous ? 'var(--border)' : 'linear-gradient(135deg,#FF7A00,#FFD700)', color: isAnonymous ? 'var(--text-secondary)' : 'white' }}>
          {isAnonymous ? '🕐 وضع الضيف' : '⭐ Creator Free'}
        </div>
      </div>

      {/* Guest upgrade banner */}
      {isAnonymous && (
        <div style={{ margin: '0 16px 12px', background: 'linear-gradient(135deg,#FF7A00,#FF4500)', borderRadius: 16, padding: '18px 16px', color: 'white' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 5 }}>💾 لا تفقد بياناتك!</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 14, lineHeight: 1.5 }}>
            سجّل دخولك بـ Google لتحفظ محتواك على جميع أجهزتك
          </div>
          <button onClick={handleUpgrade} disabled={upgrading}
            style={{ background: 'white', color: 'var(--accent)', border: 'none', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: upgrading ? 0.7 : 1 }}>
            {upgrading ? 'جاري الربط...' : '🔗 ربط بـ Google'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ background: 'white', display: 'flex', padding: '16px 0', marginBottom: 8 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{s.num}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <SettingsSection>
        <SettingsRow icon="🔔" label="الإشعارات" right={<Toggle on={notif} onToggle={() => setNotif(n => !n)} />} />
        <SettingsRow icon="🌐" label="اللغة" right={<span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>عربي ›</span>} />
        <SettingsRow icon="🔒" label="الخصوصية" right={<ChevronIcon />} />
        <SettingsRow icon="❓" label="المساعدة والدعم" right={<ChevronIcon />} last />
      </SettingsSection>

      {/* Upgrade card */}
      {!isAnonymous && (
        <div style={{ margin: '0 16px 12px', background: 'linear-gradient(135deg,#1A1A2E,#2D2D4E)', borderRadius: 16, padding: '20px 18px', color: 'white' }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 5 }}>🚀 Creator Pro</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 16, lineHeight: 1.5 }}>
            توليد غير محدود • دعم اللهجات • تحليل متقدم • أولوية AI
          </div>
          <button style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            ترقّ الآن
          </button>
        </div>
      )}

      {/* Version + Logout */}
      <div style={{ padding: '8px 20px 4px', textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)' }}>
        ContentVault v1.0.0
      </div>
      {!isAnonymous && (
        <SettingsSection style={{ marginBottom: 32 }}>
          <div onClick={handleLogout} style={{ textAlign: 'center', padding: 16, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#E53935' }}>
            تسجيل الخروج
          </div>
        </SettingsSection>
      )}
    </div>
  )
}

function SettingsSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, margin: '0 16px 10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}>
      {children}
    </div>
  )
}

function SettingsRow({ icon, label, right, last }: { icon: string; label: string; right: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{icon}</div>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
      </div>
      {right}
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={e => { e.stopPropagation(); onToggle() }}
      style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'var(--accent)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 20, height: 20, background: 'white', borderRadius: '50%', top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  )
}

function ChevronIcon() {
  return <span style={{ fontSize: 18, color: 'var(--text-secondary)', transform: 'scaleX(-1)', display: 'inline-block' }}>›</span>
}
