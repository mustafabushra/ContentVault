'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, type SavedItem } from '@/lib/firestore'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<SavedItem[]>([])
  const [notif, setNotif] = useState(true)
  const [dark, setDark] = useState(false)
  const [showSave, setShowSave] = useState(false)

  useEffect(() => { if (!loading && !user) router.replace('/login') }, [user, loading, router])
  useEffect(() => { if (user) getUserItems(user.uid).then(setItems) }, [user])

  const favorites = items.filter(it => it.isFavorite).length

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  if (!user) return null

  return (
    <>
      <div className="page">
        {/* Profile header */}
        <div style={{ background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px 20px', marginBottom: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', marginBottom: 12, boxShadow: '0 4px 16px rgba(255,122,0,0.25)' }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#FF7A00,#FF4500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
            }
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{user.displayName || 'مستخدم'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{user.email}</div>
          <div style={{ background: 'linear-gradient(135deg,#FF7A00,#FFD700)', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
            ⭐ Creator Free
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: 'white', display: 'flex', justifyContent: 'space-around', padding: '16px 20px', marginBottom: 8 }}>
          {[
            { num: items.length, label: 'محفوظات' },
            { num: favorites, label: 'مفضلة' },
            { num: items.filter(it => it.analysis).length, label: 'محللة' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div style={{ background: 'white', borderRadius: 16, margin: '0 16px 12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {[
            { icon: '🔔', label: 'الإشعارات', right: <Toggle on={notif} toggle={() => setNotif(n => !n)} /> },
            { icon: '🌙', label: 'الوضع الداكن', right: <Toggle on={dark} toggle={() => setDark(d => !d)} /> },
            { icon: '🌐', label: 'اللغة', right: <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>عربي ›</span> },
            { icon: '🔒', label: 'الخصوصية', right: <span style={{ fontSize: 18, color: 'var(--text-secondary)', transform: 'scaleX(-1)', display: 'inline-block' }}>›</span> },
            { icon: '❓', label: 'المساعدة والدعم', right: <span style={{ fontSize: 18, color: 'var(--text-secondary)', transform: 'scaleX(-1)', display: 'inline-block' }}>›</span> },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</span>
              </div>
              {item.right}
            </div>
          ))}
        </div>

        {/* Upgrade card */}
        <div style={{ margin: '0 16px 16px', background: 'linear-gradient(135deg,#FF7A00,#FF4500)', borderRadius: 16, padding: '20px 18px', color: 'white' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>🚀 ترقّ إلى Creator Pro</div>
          <div style={{ fontSize: 13, opacity: 0.88, marginBottom: 16, lineHeight: 1.5 }}>
            توليد غير محدود، تحليل متقدم، دعم اللهجات، وأولوية في الذكاء الاصطناعي
          </div>
          <button style={{ background: 'white', color: 'var(--accent)', border: 'none', padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
            عرض الخطط
          </button>
        </div>

        {/* Logout */}
        <div style={{ background: 'white', borderRadius: 16, margin: '0 16px 24px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div onClick={handleLogout} style={{ textAlign: 'center', padding: '16px', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#E53935' }}>
            تسجيل الخروج
          </div>
        </div>
      </div>

      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && <SaveModal onClose={() => setShowSave(false)} onSaved={() => {}} />}
    </>
  )
}

function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  return (
    <div onClick={e => { e.stopPropagation(); toggle() }}
      style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'var(--accent)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
      <div style={{ position: 'absolute', width: 20, height: 20, background: 'white', borderRadius: '50%', top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  )
}
