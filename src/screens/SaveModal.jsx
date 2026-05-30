import { useState } from 'react'

const OPTIONS = [
  { icon: '📱', bg: '#E3F2FD', title: 'من السوشيال ميديا', sub: 'الصق رابط من إنستقرام، تيك توك، يوتيوب…' },
  { icon: '🌐', bg: '#E8F5E9', title: 'من الويب',           sub: 'احفظ أي مقال أو صفحة من الإنترنت' },
  { icon: '✏️', bg: '#FFF3E0', title: 'إضافة يدوية',       sub: 'أدخل المعلومات بنفسك' },
  { icon: '📷', bg: '#F3E5F5', title: 'مسح صورة',           sub: 'صوّر سكريشوت أو صورة وحللها' },
  { icon: '📋', bg: '#FCE4EC', title: 'لصق نص',             sub: 'الصق نصاً مباشرة لتحليله' },
]

export default function SaveModal({ onClose, onAnalyzing }) {
  const [url, setUrl] = useState('')

  function handleSave() {
    if (url.trim()) {
      onAnalyzing()
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div className="sheet-title">حفظ محتوى</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        {/* URL Input */}
        <div className="url-input-row">
          <input
            className="url-input"
            placeholder="الصق الرابط هنا…"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="btn-accent" onClick={handleSave}>حفظ</button>
        </div>

        {/* Divider */}
        <div className="divider-row">
          <div className="divider-line" />
          <span className="divider-text">أو اختر طريقة</span>
          <div className="divider-line" />
        </div>

        {/* Options */}
        {OPTIONS.map((opt, i) => (
          <div key={i} className="save-option" onClick={onAnalyzing}>
            <div className="save-opt-icon" style={{ background: opt.bg }}>
              {opt.icon}
            </div>
            <div className="save-opt-text">
              <div className="save-opt-title">{opt.title}</div>
              <div className="save-opt-sub">{opt.sub}</div>
            </div>
            <span className="save-opt-arrow">‹</span>
          </div>
        ))}
      </div>
    </div>
  )
}
