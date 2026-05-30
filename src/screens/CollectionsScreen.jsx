import { useState } from 'react'

const COLS = [
  { id: 1, name: 'تصوير وإنتاج',  icon: '📸', count: 12, color: '#FFF3E0' },
  { id: 2, name: 'ريادة أعمال',   icon: '🚀', count: 8,  color: '#F3E5F5' },
  { id: 3, name: 'كتابة إبداعية', icon: '✍️', count: 5,  color: '#E8F5E9' },
  { id: 4, name: 'تحفيز ذاتي',    icon: '🔥', count: 19, color: '#FCE4EC' },
  { id: 5, name: 'أفكار مستقبلية',icon: '💡', count: 3,  color: '#E3F2FD' },
  { id: 6, name: 'تسويق رقمي',    icon: '📣', count: 7,  color: '#FFFDE7' },
]

export default function CollectionsScreen({ onNavigate, isEmpty = false }) {
  const [view, setView] = useState(isEmpty ? 'empty' : 'filled')

  return (
    <div className="scroll-screen" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-title">مكتبتي</div>
          <div className="header-sub">{view === 'filled' ? `${COLS.length} مجموعات` : 'لا توجد مجموعات'}</div>
        </div>
        <div className="header-actions">
          <button className="icon-btn">＋</button>
          <button className="icon-btn" onClick={() => onNavigate('search')}>🔍</button>
        </div>
      </div>

      {/* Toggle tabs */}
      <div className="toggle-tabs">
        <button className="toggle-tab" onClick={() => onNavigate('home')}>
          كل المحتوى
        </button>
        <button className="toggle-tab active">
          المجموعات
        </button>
      </div>

      {/* Demo toggle */}
      <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
        <button
          className={`chip ${view === 'filled' ? 'active' : 'inactive'}`}
          onClick={() => setView('filled')}
        >مع مجموعات</button>
        <button
          className={`chip ${view === 'empty' ? 'active' : 'inactive'}`}
          onClick={() => setView('empty')}
        >حالة فارغة</button>
      </div>

      {view === 'empty' ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <div className="empty-title">أنشئ مجموعاتك</div>
          <div className="empty-sub">نظّم محتواك بسهولة في مجموعات مخصصة حسب الموضوع أو المنصة</div>
          <br />
          <button className="btn-accent" onClick={() => {}}>
            ＋ إنشاء مجموعة
          </button>
        </div>
      ) : (
        <div className="collections-grid">
          {COLS.map(col => (
            <div key={col.id} className="collection-card" style={{ background: col.color }}>
              <div className="collection-icon">{col.icon}</div>
              <div className="collection-name">{col.name}</div>
              <div className="collection-count">{col.count} عنصر</div>
            </div>
          ))}
          {/* Add new */}
          <div
            className="collection-card"
            style={{
              border: '1.5px dashed var(--border)',
              background: 'transparent',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 6,
              minHeight: 100,
            }}
          >
            <span style={{ fontSize: 28, color: 'var(--accent)' }}>＋</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>مجموعة جديدة</span>
          </div>
        </div>
      )}
    </div>
  )
}
