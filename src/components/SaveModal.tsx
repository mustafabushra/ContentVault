'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { saveContent, type SavedItem } from '@/lib/firestore'
import { Timestamp } from 'firebase/firestore'

interface Props { onClose: () => void; onSaved: () => void }

type Step = 'input' | 'manual' | 'need-desc' | 'fetching' | 'analyzing' | 'done' | 'error'

const PLATFORMS = [
  { id: 'instagram', label: 'إنستقرام', icon: '📷', color: '#FCE4EC' },
  { id: 'tiktok',    label: 'تيك توك',  icon: '🎵', color: '#E3F2FD' },
  { id: 'youtube',   label: 'يوتيوب',   icon: '▶️', color: '#FFEBEE' },
  { id: 'twitter',   label: 'تويتر',    icon: '🐦', color: '#E3F2FD' },
  { id: 'web',       label: 'ويب',      icon: '🌐', color: '#F3E5F5' },
]

export default function SaveModal({ onClose, onSaved }: Props) {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [extraDesc, setExtraDesc] = useState('')   // user-added description
  const [fetchedMeta, setFetchedMeta] = useState<Record<string, unknown> | null>(null)
  // Manual fields
  const [manualTitle, setManualTitle] = useState('')
  const [manualDesc,  setManualDesc]  = useState('')
  const [manualPlat,  setManualPlat]  = useState<SavedItem['platform']>('instagram')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSaveUrl() {
    if (!url.trim() || !user) return
    setStep('fetching')

    // 1. Fetch metadata
    let meta: Record<string, unknown> = { url, platform: 'web', title: '', description: '', thumbnail: '' }
    try {
      const res = await fetch('/api/fetch-meta', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (res.ok) meta = { ...meta, ...(await res.json()) }
    } catch { /* continue */ }

    // Instagram can't be scraped — ask user for description
    if (meta.needsManualDescription && !extraDesc) {
      setFetchedMeta(meta)
      setStep('need-desc')
      return
    }

    await doAnalyzeAndSave(meta, extraDesc)
  }

  async function doAnalyzeAndSave(meta: Record<string, unknown>, extraDescription = '') {
    setStep('analyzing')

    const fullDescription = [meta.description, extraDescription].filter(Boolean).join('\n')

    // 2. AI analysis
    let analysis: Record<string, unknown> = { topic: '', hook: '', format: '', mood: '', tags: [], platform: meta.platform }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: meta.url, title: meta.title || url, description: fullDescription }),
      })
      if (res.ok) analysis = { ...analysis, ...(await res.json()) }
    } catch { /* save without analysis */ }

    // 3. Save
    try {
      await saveContent({
        userId: user!.uid,
        url: String(meta.url ?? url),
        title: String(meta.title ?? url),
        description: fullDescription,
        thumbnail: String(meta.thumbnail ?? ''),
        platform: (analysis.platform || meta.platform || 'web') as SavedItem['platform'],
        tags: (analysis.tags as string[]) || [],
        isFavorite: false,
        analysis: {
          topic:  String(analysis.topic  ?? ''),
          hook:   String(analysis.hook   ?? ''),
          format: String(analysis.format ?? ''),
          mood:   String(analysis.mood   ?? ''),
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      setStep('done')
      setTimeout(() => { onSaved(); onClose() }, 1600)
    } catch (e) {
      setErrorMsg('فشل الحفظ. تأكد من اتصال الإنترنت.')
      setStep('error')
    }
  }

  async function handleSaveManual() {
    if (!manualTitle.trim() || !user) return
    setStep('analyzing')

    let analysis: Record<string, unknown> = { topic: '', hook: '', format: '', mood: '', tags: [], platform: manualPlat }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '', title: manualTitle, description: manualDesc }),
      })
      if (res.ok) analysis = { ...analysis, ...(await res.json()) }
    } catch { /* save without analysis */ }

    try {
      await saveContent({
        userId: user.uid, url: '', title: manualTitle,
        description: manualDesc, thumbnail: '', platform: manualPlat,
        tags: (analysis.tags as string[]) || [], isFavorite: false,
        analysis: { topic: String(analysis.topic ?? ''), hook: String(analysis.hook ?? ''), format: String(analysis.format ?? ''), mood: String(analysis.mood ?? '') },
        createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
      })
      setStep('done')
      setTimeout(() => { onSaved(); onClose() }, 1600)
    } catch {
      setErrorMsg('فشل الحفظ.')
      setStep('error')
    }
  }

  // ─── Loading / Done / Error ───────────────────────────────
  if (step === 'fetching' || step === 'analyzing' || step === 'done') {
    return (
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div style={{ padding: '40px 20px 48px', textAlign: 'center' }}>
            {step === 'done' ? (
              <>
                <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>تم الحفظ!</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>أُضيف المحتوى لمكتبتك مع التحليل</div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 0.9s ease-in-out ${i*0.18}s infinite` }} />)}
                </div>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🧠</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  {step === 'fetching' ? 'جاري جلب البيانات…' : 'AI يحلل المحتوى…'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {step === 'fetching'
                    ? 'نستخرج العنوان والكابشن من المنصة'
                    : 'يستخرج الموضوع، الهوك، التصنيف، والمزاج'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>حدث خطأ</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>{errorMsg}</div>
            <button onClick={() => setStep('input')}
              style={{ padding: '11px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              حاول مجدداً
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Instagram needs description ─────────────────────────
  if (step === 'need-desc') {
    return (
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div style={{ padding: '12px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#FCE4EC', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📷</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>منشور إنستقرام</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>إنستقرام يحجب الجلب التلقائي</div>
            </div>
          </div>

          <div style={{ margin: '0 20px 14px', background: '#FFF3E0', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <div style={{ fontSize: 13, color: '#E65100', lineHeight: 1.5 }}>
              افتح المنشور في إنستقرام، انسخ الكابشن أو أي وصف، وألصقه هنا — AI يحلله فوراً
            </div>
          </div>

          <div style={{ padding: '0 20px 20px' }}>
            <textarea
              value={extraDesc}
              onChange={e => setExtraDesc(e.target.value)}
              placeholder="الصق الكابشن أو وصف الفيديو هنا… (اختياري)"
              rows={4}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', resize: 'none', lineHeight: 1.6 }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setStep('input')}
                style={{ flex: 1, padding: 13, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                رجوع
              </button>
              <button onClick={() => doAnalyzeAndSave(fetchedMeta!, extraDesc)}
                style={{ flex: 2, padding: 13, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {extraDesc.trim() ? '✨ حفظ وتحليل' : '💾 حفظ بدون وصف'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Manual input ─────────────────────────────────────────
  if (step === 'manual') {
    return (
      <div className="sheet-overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>إضافة يدوية</span>
            <button onClick={() => setStep('input')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ padding: '0 20px 28px' }}>
            <input value={manualTitle} onChange={e => setManualTitle(e.target.value)}
              placeholder="العنوان أو موضوع المحتوى *"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', marginBottom: 12 }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <textarea value={manualDesc} onChange={e => setManualDesc(e.target.value)}
              placeholder="الكابشن أو وصف المحتوى (اختياري)"
              rows={3}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', resize: 'none', marginBottom: 14 }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>المنصة</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexDirection: 'row-reverse', marginBottom: 20 }}>
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setManualPlat(p.id as SavedItem['platform'])}
                  className={`chip ${manualPlat === p.id ? 'chip-active' : 'chip-inactive'}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            <button onClick={handleSaveManual} disabled={!manualTitle.trim()}
              style={{ width: '100%', padding: 14, background: manualTitle.trim() ? 'var(--accent)' : '#ccc', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: manualTitle.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              ✨ حفظ وتحليل
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main input ───────────────────────────────────────────
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 14px' }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>حفظ محتوى</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>✕</button>
        </div>

        {/* URL input */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px' }}>
          <input value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
            placeholder="https://…"
            style={{ flex: 1, padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'ltr', color: 'var(--text-primary)', transition: 'border-color 0.2s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button onClick={handleSaveUrl} disabled={!url.trim()}
            style={{ padding: '12px 18px', background: url.trim() ? 'var(--accent)' : '#ccc', color: 'white', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'background 0.2s' }}>
            حفظ
          </button>
        </div>

        {/* Platform support info */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 14px', justifyContent: 'center' }}>
          {[
            { icon: '🎵', label: 'تيك توك', ok: true },
            { icon: '▶️', label: 'يوتيوب', ok: true },
            { icon: '🐦', label: 'تويتر', ok: true },
            { icon: '📷', label: 'إنستقرام', ok: false },
            { icon: '🌐', label: 'ويب', ok: true },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 22 }}>{p.icon}</div>
              <div style={{ fontSize: 9, color: p.ok ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: p.ok ? 700 : 400 }}>
                {p.ok ? '✓' : 'يدوي'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>أو</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Manual entry */}
        <div style={{ padding: '0 20px 24px' }}>
          <button onClick={() => setStep('manual')}
            style={{ width: '100%', padding: '13px 16px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, direction: 'rtl', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}>
            <div style={{ width: 38, height: 38, background: '#FFF3E0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✏️</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>إضافة يدوية</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>أدخل العنوان والكابشن مباشرة</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
