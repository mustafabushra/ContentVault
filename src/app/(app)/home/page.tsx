'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, toggleFavorite, type SavedItem } from '@/lib/firestore'
import ContentCard from '@/components/ContentCard'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

const FILTERS = ['الكل', 'إنستقرام', 'تيك توك', 'يوتيوب', 'تويتر', 'ويب']
const PLAT_MAP: Record<string, string> = {
  'إنستقرام': 'instagram', 'تيك توك': 'tiktok',
  'يوتيوب': 'youtube', 'تويتر': 'twitter', 'ويب': 'web'
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<SavedItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('الكل')
  const [showSave, setShowSave] = useState(false)

  const loadItems = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try { setItems(await getUserItems(user.uid)) }
    finally { setFetching(false) }
  }, [user])

  useEffect(() => { loadItems() }, [loadItems])

  async function handleFav(id: string, current: boolean) {
    await toggleFavorite(id, current)
    setItems(prev => prev.map(it => it.id === id ? { ...it, isFavorite: !current } : it))
  }

  const filtered = filter === 'الكل'
    ? items
    : items.filter(it => it.platform === PLAT_MAP[filter])

  return (
    <>
      <div className="page">
        {/* Header */}
        <div style={{ padding: '20px 20px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>مكتبتي</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {items.length > 0 ? `${items.length} عنصر محفوظ` : 'ابدأ بحفظ محتواك'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => router.push('/search')}
              style={{ width: 40, height: 40, borderRadius: 12, background: 'white', border: 'none', cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>🔍</button>
          </div>
        </div>

        {/* Orange banner */}
        <div onClick={() => setShowSave(true)}
          style={{ margin: '0 20px 16px', background: 'var(--accent)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'transform 0.15s' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>شفت محتوى مثير؟ احفظه هنا ←</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>الصق الرابط وAI يحلله فوراً</div>
          </div>
          <div style={{ fontSize: 20, display: 'flex', gap: 4 }}>📱🎬🐦</div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', overflowX: 'auto', scrollbarWidth: 'none', flexDirection: 'row-reverse' }}>
          {FILTERS.map(f => (
            <button key={f} className={`chip ${filter === f ? 'chip-active' : 'chip-inactive'}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {/* Content */}
        {fetching ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 && items.length === 0 ? (
          <EmptyState onAdd={() => setShowSave(true)} />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>لا يوجد محتوى من هذه المنصة</div>
            <button className="chip chip-active" onClick={() => setFilter('الكل')}>عرض الكل</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
            {filtered.map(item => (
              <ContentCard key={item.id} item={item} onFav={handleFav} />
            ))}
          </div>
        )}
      </div>

      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && <SaveModal onClose={() => setShowSave(false)} onSaved={loadItems} />}
    </>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>📭</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>مكتبتك فارغة</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
        احفظ محتوى من أي منصة وAI يحلله فوراً
      </div>
      {/* How it works */}
      <div style={{ background: 'white', borderRadius: 16, padding: 16, marginBottom: 24, textAlign: 'right', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>كيف تستخدم ContentVault؟</div>
        {[
          { n: '1', text: 'افتح إنستقرام أو تيك توك وانسخ الرابط' },
          { n: '2', text: 'الصقه في التطبيق واضغط حفظ' },
          { n: '3', text: 'AI يحلل المحتوى ويولّد كابشن وهوك وسكريبت' },
        ].map(step => (
          <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{step.n}</div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step.text}</span>
          </div>
        ))}
      </div>
      <button onClick={onAdd}
        style={{ padding: '14px 32px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%', boxShadow: '0 4px 16px rgba(255,122,0,0.35)' }}>
        ＋ احفظ أول محتوى
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 118, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: 10 }}>
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 12, background: '#f0f0f0', borderRadius: 6, width: '70%' }} />
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
