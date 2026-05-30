const OPTIONS = [
  { icon: '📤', bg: '#E3F2FD', label: 'مشاركة',           danger: false },
  { icon: '📋', bg: '#E8F5E9', label: 'نسخ الرابط',        danger: false },
  { icon: '📁', bg: '#FFF3E0', label: 'إضافة لمجموعة',     danger: false },
  { icon: '📅', bg: '#F3E5F5', label: 'جدولة للنشر',       danger: false },
  { icon: '🗑️', bg: '#FFEBEE', label: 'حذف',              danger: true  },
]

export default function ActionSheet({ onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <div className="sheet-title">خيارات</div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>

        {OPTIONS.map((opt, i) => (
          <div key={i} className="action-option" onClick={onClose}>
            <div className="action-icon" style={{ background: opt.bg }}>
              {opt.icon}
            </div>
            <span className={`action-label ${opt.danger ? 'danger' : ''}`}>
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
