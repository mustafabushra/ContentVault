'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useItems } from '@/contexts/ItemsContext'
import ContentCard from '@/components/ContentCard'

const FILTERS = [
  { label: 'الكل', value: '' },
  { label: 'إنستقرام', value: 'instagram' },
  { label: 'تيك توك', value: 'tiktok' },
  { label: 'يوتيوب', value: 'youtube' },
  { label: 'تويتر', value: 'twitter' },
  { label: 'ويب', value: 'web' },
]

export default function HomePage() {
  const { items, loading, toggleFav } = useItems()
  const router = useRouter()
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() =>
    filter ? items.filter(it => it.platform === filter) : items,
    [items, filter]
  )

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '20px 20px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>مكتبتي</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            {loading ? '...' : items.length > 0 ? `${items.length} عنصر محفوظ` : 'ابدأ بحفظ محتواك'}
          </p>
        </div>
        <button onClick={() => router.push('/search')}
          style={{ width: 40, height: 40, borderRadius: 12, background: 'white', border: 'none', cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0 }}>
          🔍
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 20px 12px', overflowX: 'auto', scrollbarWidth: 'none', flexDirection: 'row-reverse' }}>
        {FILTERS.map(f => (
          <button key={f.value} className={`chip ${filter === f.value ? 'chip-active' : 'chip-inactive'}`}
            onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>لا يوجد محتوى من هذه المنصة</div>
          <button className="chip chip-active" onClick={() => setFilter('')}>عرض الكل</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
          {filtered.map(item => (
            <ContentCard key={item.id} item={item} onFav={toggleFav} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ padding: '24px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>📭</div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>مكتبتك فارغة</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        احفظ محتوى من أي منصة وAI يحلله فوراً
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: 16, textAlign: 'right', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>كيف تستخدم ContentVault؟</div>
        {[
          { n: '1', text: 'انسخ رابط من إنستقرام أو تيك توك أو أي منصة' },
          { n: '2', text: 'اضغط ＋ وألصق الرابط' },
          { n: '3', text: 'AI يحلل ويولّد كابشن وهوك وسكريبت' },
        ].map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{s.n}</div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 118, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: 10 }}>
        <div style={{ height: 11, background: '#f0f0f0', borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 11, background: '#f0f0f0', borderRadius: 6, width: '65%' }} />
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}
