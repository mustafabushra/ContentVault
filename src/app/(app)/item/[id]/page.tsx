'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getItemById, deleteItem, type SavedItem } from '@/lib/firestore'

const GEN_TYPES = ['كابشن', 'هوك', 'سكريبت', 'خيط'] as const
const GEN_MAP: Record<string, 'caption' | 'hook' | 'script' | 'thread'> = {
  كابشن: 'caption', هوك: 'hook', سكريبت: 'script', خيط: 'thread'
}
const PLAT_LABELS: Record<string, string> = {
  instagram: 'إنستقرام', tiktok: 'تيك توك', twitter: 'تويتر',
  youtube: 'يوتيوب', linkedin: 'لينكدإن', web: 'ويب',
}
const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8']

export default function ItemPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<SavedItem | null>(null)
  const [fetching, setFetching] = useState(true)
  const [genType, setGenType] = useState<typeof GEN_TYPES[number]>('كابشن')
  const [generated, setGenerated] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAction, setShowAction] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!id) return
    getItemById(id).then(data => { setItem(data); setFetching(false) })
  }, [id])

  async function generate() {
    if (!item?.analysis) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: GEN_MAP[genType], title: item.title, analysis: item.analysis }),
      })
      const data = await res.json()
      setGenerated(data.content || '')
    } finally {
      setGenerating(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!confirm('حذف هذا المحتوى نهائياً؟')) return
    await deleteItem(id)
    router.replace('/home')
  }

  if (loading || fetching) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!item) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>المحتوى غير موجود</div>
      <button onClick={() => router.replace('/home')} style={{ marginTop: 16, padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>العودة</button>
    </div>
  )

  const g = GRADIENTS[(item.id || '').charCodeAt(0) % 8]

  return (
    <div style={{ height: '100dvh', overflowY: 'auto' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ width: 40, height: 40, background: 'white', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>→</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            🧠 AI مساعد
          </button>
          <button onClick={() => setShowAction(true)} style={{ width: 40, height: 40, background: 'white', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>⋯</button>
        </div>
      </div>

      {/* Hero */}
      <div className={g} style={{ height: 220, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ fontSize: 80 }}>📄</span>
        }
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to bottom, transparent, var(--bg))' }} />
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px 40px' }}>
        <span className={`plat-${item.platform}`} style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 10 }}>
          {PLAT_LABELS[item.platform] || item.platform}
        </span>

        <h1 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.45, marginBottom: 8 }}>{item.title}</h1>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          📅 <span>{item.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') || ''}</span>
          {item.url && <><span style={{ color: 'var(--border)' }}>•</span><a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12 }}>فتح الرابط ↗</a></>}
        </div>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20, flexDirection: 'row-reverse' }}>
            {item.tags.map(tag => (
              <span key={tag} style={{ padding: '5px 12px', background: 'var(--bg)', borderRadius: 20, fontSize: 12, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Analysis */}
        {item.analysis && (
          <div style={{ background: 'rgba(255,122,0,0.08)', borderRadius: 16, padding: 16, marginBottom: 20, border: '1px solid rgba(255,122,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>🧠</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>تحليل الذكاء الاصطناعي</span>
            </div>
            {[
              { label: 'الموضوع', value: item.analysis.topic },
              { label: 'الهوك',   value: item.analysis.hook },
              { label: 'الفورمات',value: item.analysis.format },
              { label: 'المزاج',  value: item.analysis.mood },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,122,0,0.12)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 60, fontWeight: 500, paddingTop: 1 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Generate */}
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>توليد المحتوى</div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
          {GEN_TYPES.map(t => (
            <button key={t} className={`chip ${genType === t ? 'chip-active' : 'chip-inactive'}`} onClick={() => setGenType(t)}>{t}</button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={generating || !item.analysis}
          style={{ width: '100%', padding: 14, background: generating ? '#ccc' : 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', marginBottom: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {generating ? (
            <><div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> يتم التوليد…</>
          ) : (
            <><span>✨</span> توليد {genType}</>
          )}
        </button>

        {generated && (
          <div style={{ background: 'white', borderRadius: 16, padding: 14, marginBottom: 20, border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 10, whiteSpace: 'pre-wrap' }}>{generated}</div>
            <button onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-secondary)' }}>
              {copied ? '✅ تم النسخ!' : '📋 نسخ'}
            </button>
          </div>
        )}

        {!item.analysis && (
          <div style={{ border: '1.5px dashed var(--border)', borderRadius: 16, padding: '20px 16px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>لا يوجد تحليل لهذا المحتوى بعد</div>
          </div>
        )}
      </div>

      {/* Action Sheet */}
      {showAction && (
        <div className="sheet-overlay" onClick={() => setShowAction(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: '12px 20px 14px', fontSize: 18, fontWeight: 800 }}>خيارات</div>
            {[
              { icon: '📤', bg: '#E3F2FD', label: 'مشاركة', action: () => navigator.share?.({ url: item.url, title: item.title }) },
              { icon: '📋', bg: '#E8F5E9', label: 'نسخ الرابط', action: () => navigator.clipboard.writeText(item.url) },
              { icon: '🗑️', bg: '#FFEBEE', label: 'حذف', danger: true, action: handleDelete },
            ].map((opt, i) => (
              <div key={i} onClick={() => { opt.action(); setShowAction(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', cursor: 'pointer' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{opt.icon}</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: opt.danger ? '#E53935' : 'var(--text-primary)' }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
