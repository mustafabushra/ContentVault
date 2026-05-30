'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, toggleFavorite, type SavedItem } from '@/lib/firestore'
import ContentCard from '@/components/ContentCard'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

const FILTERS = ['الكل', 'تصوير', 'ريادة', 'كتابة', 'تحفيز', 'تعليمي']

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<SavedItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('الكل')
  const [showSave, setShowSave] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const loadItems = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const data = await getUserItems(user.uid)
      setItems(data)
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => { loadItems() }, [loadItems])

  async function handleFav(id: string, current: boolean) {
    await toggleFavorite(id, current)
    setItems(prev => prev.map(it => it.id === id ? { ...it, isFavorite: !current } : it))
  }

  if (loading || !user) return null

  return (
    <>
      <div className="page">
        {/* Header */}
        <div style={{ padding: '20px 20px 10px', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>مكتبتي</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {items.length} عنصر محفوظ
              </div>
            </div>
            <button onClick={() => router.push('/search')} style={{ width: 40, height: 40, borderRadius: 12, background: 'white', border: 'none', cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>🔍</button>
          </div>
        </div>

        {/* Orange banner */}
        <div onClick={() => setShowSave(true)} style={{ margin: '0 20px 16px', background: 'var(--accent)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.4 }}>
            شفت محتوى مثير؟ احفظه هنا ←
          </div>
          <div style={{ fontSize: 18, display: 'flex', gap: 4 }}>📱 🎬 🐦</div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto', scrollbarWidth: 'none', flexDirection: 'row-reverse' }}>
          {FILTERS.map(f => (
            <button key={f} className={`chip ${filter === f ? 'chip-active' : 'chip-inactive'}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>📭</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>مكتبتك فارغة</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
              ابدأ بحفظ محتوى ملهم من أي منصة
            </div>
            <button onClick={() => setShowSave(true)} style={{ padding: '12px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ＋ احفظ أول محتوى
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
            {items.map(item => (
              <ContentCard key={item.id} item={item} onFav={handleFav} />
            ))}
          </div>
        )}
      </div>

      <BottomNav onAdd={() => setShowSave(true)} />

      {showSave && (
        <SaveModal onClose={() => setShowSave(false)} onSaved={loadItems} />
      )}
    </>
  )
}
