'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { saveContent, type SavedItem } from '@/lib/firestore'
import { Timestamp } from 'firebase/firestore'

interface Props { onClose: () => void; onSaved: () => void }

const OPTIONS = [
  { icon: '📱', bg: '#E3F2FD', title: 'من السوشيال ميديا', sub: 'إنستقرام • تيك توك • يوتيوب' },
  { icon: '🌐', bg: '#E8F5E9', title: 'من الويب', sub: 'أي مقال أو موقع' },
  { icon: '✏️', bg: '#FFF3E0', title: 'إضافة يدوية', sub: 'أدخل المعلومات بنفسك' },
]

type Step = 'input' | 'fetching' | 'analyzing' | 'done' | 'error'

export default function SaveModal({ onClose, onSaved }: Props) {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSave() {
    if (!url.trim() || !user) return
    setStep('fetching')
    try {
      const metaRes = await fetch('/api/fetch-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const meta = await metaRes.json()

      setStep('analyzing')

      const aiRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: meta.url, title: meta.title, description: meta.description }),
      })
      const analysis = await aiRes.json()

      const platform = (analysis.platform || meta.platform || 'web') as SavedItem['platform']

      await saveContent({
        userId: user.uid,
        url: meta.url || url,
        title: meta.title || url,
        description: meta.description || '',
        thumbnail: meta.thumbnail || '',
        platform,
        tags: analysis.tags || [],
        isFavorite: false,
        analysis: {
          topic: analysis.topic || '',
          hook: analysis.hook || '',
          format: analysis.format || '',
          mood: analysis.mood || '',
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      setStep('done')
      setTimeout(() => { onSaved(); onClose() }, 1600)
    } catch {
      setErrorMsg('حدث خطأ. تحقق من الرابط وحاول مجدداً.')
      setStep('error')
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 14px' }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>حفظ محتوى</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>✕</button>
        </div>

        {/* Loading / Done / Error states */}
        {(step === 'fetching' || step === 'analyzing' || step === 'done') && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            {step === 'done' ? (
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>تم الحفظ!</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>أُضيف المحتوى لمكتبتك</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 0.9s ease-in-out ${i * 0.18}s infinite` }} />
                  ))}
                </div>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🧠</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  {step === 'fetching' ? 'جاري جلب المحتوى…' : 'الذكاء الاصطناعي يحلل…'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {step === 'fetching' ? 'نسترد معلومات الرابط' : 'يستخرج الموضوع والهوك والتصنيف'}
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
            <button onClick={() => setStep('input')} style={{ padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              حاول مجدداً
            </button>
          </div>
        )}

        {step === 'input' && (
          <>
            <div style={{ display: 'flex', gap: 8, padding: '0 20px', marginBottom: 16 }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="الصق الرابط هنا…"
                style={{ flex: 1, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', color: 'var(--text-primary)' }}
              />
              <button onClick={handleSave} style={{ padding: '12px 18px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                حفظ
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>أو اختر طريقة</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {OPTIONS.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', cursor: 'pointer' }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {opt.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{opt.sub}</div>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: 18 }}>‹</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
