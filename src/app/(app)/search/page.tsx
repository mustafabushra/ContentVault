'use client'
import { useState, useMemo } from 'react'
import { useItems } from '@/contexts/ItemsContext'
import ContentCard from '@/components/ContentCard'

const PLATFORMS = [
  { label: 'الكل', value: '' },
  { label: 'إنستقرام', value: 'instagram' },
  { label: 'تيك توك', value: 'tiktok' },
  { label: 'يوتيوب', value: 'youtube' },
  { label: 'تويتر', value: 'twitter' },
  { label: 'ويب', value: 'web' },
]

export default function SearchPage() {
  const { items, toggleFav } = useItems()
  const [q, setQ] = useState('')
  const [plat, setPlat] = useState('')

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter(it => {
      const matchQ = !term
        || it.title?.toLowerCase().includes(term)
        || it.description?.toLowerCase().includes(term)
        || it.tags?.some(t => t.toLowerCase().includes(term))
        || it.analysis?.topic?.toLowerCase().includes(term)
        || it.analysis?.mood?.toLowerCase().includes(term)
      const matchP = !plat || it.platform === plat
      return matchQ && matchP
    })
  }, [items, q, plat])

  return (
    <div className="page">
      <div style={{ padding: '20px 20px 12px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>بحث</h1>
        <div style={{ position: 'relative' }}>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="ابحث بالعنوان أو الوسم أو الموضوع…"
            style={{ width: '100%', padding: '13px 44px 13px 40px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 16, fontSize: 15, fontFamily: 'inherit', outline: 'none', color: 'var(--text-primary)', direction: 'rtl', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>
          {q && (
            <button onClick={() => setQ('')}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'var(--border)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px', overflowX: 'auto', scrollbarWidth: 'none', flexDirection: 'row-reverse' }}>
        {PLATFORMS.map(p => (
          <button key={p.value} className={`chip ${plat === p.value ? 'chip-active' : 'chip-inactive'}`}
            onClick={() => setPlat(p.value)}>{p.label}</button>
        ))}
      </div>

      {!q && !plat ? (
        <div style={{ textAlign: 'center', padding: '50px 40px' }}>
          <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.35 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>ابحث في مكتبتك</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            بالعنوان أو الوسم أو الموضوع أو المزاج
          </div>
          {items.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              {items.length} عنصر في مكتبتك
            </div>
          )}
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🤷</div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>لا نتائج</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>جرّب كلمة مختلفة</div>
          <button onClick={() => { setQ(''); setPlat('') }} className="chip chip-active">مسح الفلاتر</button>
        </div>
      ) : (
        <>
          <div style={{ padding: '0 20px 10px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {results.length} نتيجة
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
            {results.map(item => <ContentCard key={item.id} item={item} onFav={toggleFav} />)}
          </div>
        </>
      )}
    </div>
  )
}
