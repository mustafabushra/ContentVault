'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, type SavedItem } from '@/lib/firestore'
import ContentCard from '@/components/ContentCard'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

const PLATFORMS = ['الكل', 'إنستقرام', 'تيك توك', 'يوتيوب', 'تويتر', 'ويب']
const PLAT_MAP: Record<string, string> = { 'إنستقرام': 'instagram', 'تيك توك': 'tiktok', 'يوتيوب': 'youtube', 'تويتر': 'twitter', 'ويب': 'web' }

export default function SearchPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [all, setAll] = useState<SavedItem[]>([])
  const [q, setQ] = useState('')
  const [plat, setPlat] = useState('الكل')
  const [showSave, setShowSave] = useState(false)

  useEffect(() => { if (!loading && !user) router.replace('/login') }, [user, loading, router])

  useEffect(() => {
    if (user) getUserItems(user.uid).then(setAll)
  }, [user])

  const results = all.filter(it => {
    const matchQ = !q || it.title.includes(q) || it.description?.includes(q) || it.tags?.some(t => t.includes(q))
    const matchP = plat === 'الكل' || it.platform === PLAT_MAP[plat]
    return matchQ && matchP
  })

  return (
    <>
      <div className="page">
        <div style={{ padding: '20px 20px 10px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>بحث</div>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="🔍  ابحث في مكتبتك…"
            style={{ width: '100%', padding: '14px 16px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 16, fontSize: 15, fontFamily: 'inherit', outline: 'none', color: 'var(--text-primary)', direction: 'rtl', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto', scrollbarWidth: 'none', flexDirection: 'row-reverse' }}>
          {PLATFORMS.map(p => (
            <button key={p} className={`chip ${plat === p ? 'chip-active' : 'chip-inactive'}`} onClick={() => setPlat(p)}>{p}</button>
          ))}
        </div>

        {q === '' && plat === 'الكل' ? (
          <div style={{ textAlign: 'center', padding: '50px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>ابحث في مكتبتك</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>بالعنوان أو الوسم أو المنصة</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤷</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>لا نتائج</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>جرّب كلمة مختلفة</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
            {results.map(item => <ContentCard key={item.id} item={item} />)}
          </div>
        )}
      </div>

      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && <SaveModal onClose={() => setShowSave(false)} onSaved={() => user && getUserItems(user.uid).then(setAll)} />}
    </>
  )
}
