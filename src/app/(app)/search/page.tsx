'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, toggleFavorite, type SavedItem } from '@/lib/firestore'
import ContentCard from '@/components/ContentCard'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

const PLATFORMS = ['الكل', 'إنستقرام', 'تيك توك', 'يوتيوب', 'تويتر', 'ويب']
const PLAT_MAP: Record<string, string> = {
  'إنستقرام': 'instagram', 'تيك توك': 'tiktok',
  'يوتيوب': 'youtube', 'تويتر': 'twitter', 'ويب': 'web'
}

export default function SearchPage() {
  const { user } = useAuth()
  const [all, setAll] = useState<SavedItem[]>([])
  const [q, setQ] = useState('')
  const [plat, setPlat] = useState('الكل')
  const [showSave, setShowSave] = useState(false)

  useEffect(() => {
    if (user) getUserItems(user.uid).then(setAll)
  }, [user])

  async function handleFav(id: string, current: boolean) {
    await toggleFavorite(id, current)
    setAll(prev => prev.map(it => it.id === id ? { ...it, isFavorite: !current } : it))
  }

  const results = all.filter(it => {
    const matchQ = !q.trim() || it.title?.includes(q) || it.description?.includes(q) || it.tags?.some(t => t.includes(q)) || it.analysis?.topic?.includes(q)
    const matchP = plat === 'الكل' || it.platform === PLAT_MAP[plat]
    return matchQ && matchP
  })

  return (
    <>
      <div className="page">
        <div style={{ padding: '20px 20px 12px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>بحث</div>
          <div style={{ position: 'relative' }}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="ابحث بالعنوان أو الوسم أو الموضوع…"
              style={{ width: '100%', padding: '14px 44px 14px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 16, fontSize: 15, fontFamily: 'inherit', outline: 'none', color: 'var(--text-primary)', direction: 'rtl', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'border-color 0.2s' }} />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>
            {q && (
              <button onClick={() => setQ('')}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--bg)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>✕</button>
            )}
          </div>
        </div>

        {/* Platform chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto', scrollbarWidth: 'none', flexDirection: 'row-reverse' }}>
          {PLATFORMS.map(p => (
            <button key={p} className={`chip ${plat === p ? 'chip-active' : 'chip-inactive'}`}
              onClick={() => setPlat(p)}>{p}</button>
          ))}
        </div>

        {/* Results */}
        {!q.trim() && plat === 'الكل' ? (
          <div style={{ textAlign: 'center', padding: '50px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.4 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>ابحث في مكتبتك</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              بالعنوان أو الوسم أو الموضوع أو المنصة
            </div>
            {all.length > 0 && (
              <div style={{ marginTop: 24, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                {all.length} عنصر في مكتبتك
              </div>
            )}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤷</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>لا نتائج</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>جرّب كلمة مختلفة</div>
            <button onClick={() => { setQ(''); setPlat('الكل') }} className="chip chip-active">مسح الفلاتر</button>
          </div>
        ) : (
          <>
            <div style={{ padding: '0 20px 10px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              {results.length} نتيجة
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
              {results.map(item => <ContentCard key={item.id} item={item} onFav={handleFav} />)}
            </div>
          </>
        )}
      </div>

      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && <SaveModal onClose={() => setShowSave(false)} onSaved={() => user && getUserItems(user.uid).then(setAll)} />}
    </>
  )
}
