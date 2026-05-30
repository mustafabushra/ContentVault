'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { saveContent, type SavedItem } from '@/lib/firestore'
import { Timestamp } from 'firebase/firestore'

interface Props { onClose: () => void; onSaved: () => void }

type Step = 'input' | 'manual' | 'fetching' | 'analyzing' | 'done' | 'error'
type Method = 'url' | 'manual'

const PLATFORMS = [
  { id: 'instagram', label: 'إنستقرام', icon: '📷' },
  { id: 'tiktok',    label: 'تيك توك',  icon: '🎵' },
  { id: 'youtube',   label: 'يوتيوب',   icon: '▶️' },
  { id: 'twitter',   label: 'تويتر',    icon: '🐦' },
  { id: 'web',       label: 'ويب',      icon: '🌐' },
]

export default function SaveModal({ onClose, onSaved }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('input')
  const [method, setMethod] = useState<Method>('url')
  const [url, setUrl] = useState('')
  const [manualTitle, setManualTitle] = useState('')
  const [manualDesc, setManualDesc] = useState('')
  const [manualPlat, setManualPlat] = useState<SavedItem['platform']>('instagram')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSaveUrl() {
    if (!url.trim() || !user) return
    setStep('fetching')
    try {
      const metaRes = await fetch('/api/fetch-meta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const meta = await metaRes.json()
      setStep('analyzing')

      const aiRes = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: meta.url, title: meta.title, description: meta.description }),
      })
      const analysis = await aiRes.json()

      await saveContent({
        userId: user.uid,
        url: meta.url || url,
        title: meta.title || url,
        description: meta.description || '',
        thumbnail: meta.thumbnail || '',
        platform: (analysis.platform || meta.platform || 'web') as SavedItem['platform'],
        tags: analysis.tags || [],
        isFavorite: false,
        analysis: { topic: analysis.topic || '', hook: analysis.hook || '', format: analysis.format || '', mood: analysis.mood || '' },
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
      })
      setStep('done')
      setTimeout(() => { onSaved(); onClose() }, 1600)
    } catch {
      setErrorMsg('تعذّر جلب الرابط. تحقق منه وحاول مجدداً.')
      setStep('error')
    }
  }

  async function handleSaveManual() {
    if (!manualTitle.trim() || !user) return
    setStep('analyzing')
    try {
      const aiRes = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '', title: manualTitle, description: manualDesc }),
      })
      const analysis = await aiRes.json()

      await saveContent({
        userId: user.uid, url: '', title: manualTitle,
        description: manualDesc, thumbnail: '',
        platform: manualPlat, tags: analysis.tags || [],
        isFavorite: false,
        analysis: { topic: analysis.topic || '', hook: analysis.hook || '', format: analysis.format || '', mood: analysis.mood || '' },
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
      })
      setStep('done')
      setTimeout(() => { onSaved(); onClose() }, 1600)
    } catch {
      setErrorMsg('حدث خطأ أثناء الحفظ.')
      setStep('error')
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 14px' }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>حفظ محتوى</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>✕</button>
        </div>

        {/* Loading / Done / Error */}
        {(step === 'fetching' || step === 'analyzing' || step === 'done') && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            {step === 'done' ? (
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>تم الحفظ!</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>أُضيف المحتوى لمكتبتك مع التحليل</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 0.9s ease-in-out ${i*0.18}s infinite` }} />)}
                </div>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  {step === 'fetching' ? 'جاري جلب المحتوى…' : 'AI يحلل المحتوى…'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {step === 'fetching' ? 'يستخرج العنوان والوصف والصورة' : 'يستخرج الموضوع والهوك والتصنيف'}
                </div>
              </>
            )}
          </div>
        )}

        {step === 'error' && (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>حدث خطأ</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>{errorMsg}</div>
            <button onClick={() => setStep('input')}
              style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              حاول مجدداً
            </button>
          </div>
        )}

        {/* Manual input */}
        {step === 'manual' && (
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>العنوان *</label>
              <input value={manualTitle} onChange={e => setManualTitle(e.target.value)}
                placeholder="عنوان المحتوى"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>الوصف (اختياري)</label>
              <textarea value={manualDesc} onChange={e => setManualDesc(e.target.value)}
                placeholder="وصف مختصر للمحتوى…"
                rows={3}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', color: 'var(--text-primary)', resize: 'none' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>المنصة</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setManualPlat(p.id as SavedItem['platform'])}
                    className={`chip ${manualPlat === p.id ? 'chip-active' : 'chip-inactive'}`}>
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setStep('input')}
                style={{ flex: 1, padding: 13, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                رجوع
              </button>
              <button onClick={handleSaveManual} disabled={!manualTitle.trim()}
                style={{ flex: 2, padding: 13, background: manualTitle.trim() ? 'var(--accent)' : '#ccc', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: manualTitle.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                ✨ حفظ وتحليل
              </button>
            </div>
          </div>
        )}

        {/* Main input */}
        {step === 'input' && (
          <>
            {/* Method toggle */}
            <div style={{ display: 'flex', background: 'var(--border)', borderRadius: 20, padding: 3, margin: '0 20px 16px' }}>
              {(['url','manual'] as Method[]).map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 17, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: method === m ? 'white' : 'transparent', color: method === m ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: method === m ? '0 1px 6px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
                  {m === 'url' ? '🔗 من رابط' : '✏️ يدوي'}
                </button>
              ))}
            </div>

            {method === 'url' ? (
              <>
                <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 16 }}>
                  <input value={url} onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
                    placeholder="https://www.instagram.com/reel/…"
                    style={{ flex: 1, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'ltr', color: 'var(--text-primary)' }} />
                  <button onClick={handleSaveUrl} disabled={!url.trim()}
                    style={{ padding: '12px 18px', background: url.trim() ? 'var(--accent)' : '#ccc', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                    حفظ
                  </button>
                </div>

                {/* Platforms */}
                <div style={{ display: 'flex', gap: 10, padding: '0 20px 16px', justifyContent: 'center' }}>
                  {PLATFORMS.slice(0,4).map(p => (
                    <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div className={`plat-${p.id}`} style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white' }}>{p.icon}</div>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '0 20px 16px' }}>
                <button onClick={() => setStep('manual')}
                  style={{ width: '100%', padding: 14, background: 'var(--bg)', border: '1.5px dashed var(--border)', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-primary)' }}>
                  ✏️ أدخل المعلومات يدوياً ←
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>يدعم أيضاً</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {[
              { icon: '📷', bg: '#FCE4EC', title: 'مسح صورة/سكريشوت', sub: 'قريباً' },
              { icon: '📋', bg: '#F3E5F5', title: 'مشاركة من التطبيق', sub: 'شارك مباشرة من إنستقرام أو تيك توك' },
            ].map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', opacity: i === 0 ? 0.5 : 1 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{opt.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.sub}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
