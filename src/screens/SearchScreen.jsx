import { useState } from 'react'

const PLATFORMS = ['الكل', 'إنستقرام', 'تيك توك', 'يوتيوب', 'تويتر']

const RESULTS = [
  { id: 1, title: 'كيف تبني عادة النوم المبكر في 21 يوم', platform: 'instagram', plat: 'إنستقرام', g: 'g1', emoji: '🌙' },
  { id: 2, title: '5 أدوات AI تغنيك عن موظف كامل',        platform: 'tiktok',    plat: 'تيك توك',  g: 'g2', emoji: '🤖' },
  { id: 3, title: 'سكريبت الفيديو المثالي — قالب جاهز',   platform: 'tiktok',    plat: 'تيك توك',  g: 'g3', emoji: '✍️' },
  { id: 4, title: 'تصوير ريلز احترافي بموبايلك فقط',      platform: 'instagram', plat: 'إنستقرام', g: 'g4', emoji: '📸' },
]

export default function SearchScreen({ onNavigate }) {
  const [query, setQuery]   = useState('')
  const [plat, setPlat]     = useState('الكل')
  const [focused, setFocus] = useState(false)

  const shown = query.trim()
    ? RESULTS.filter(r => r.title.includes(query))
    : []

  return (
    <div className="scroll-screen" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-title">بحث</div>
        </div>
      </div>

      {/* Search input */}
      <div className="search-input-wrap">
        <input
          className="search-input"
          placeholder="🔍  ابحث في محتواك…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          autoFocus
        />
      </div>

      {/* Platform filter chips */}
      <div className="filter-row">
        {PLATFORMS.map(p => (
          <button
            key={p}
            className={`chip ${plat === p ? 'active' : 'inactive'}`}
            onClick={() => setPlat(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Results or empty state */}
      {query.trim() === '' ? (
        <div className="empty-state" style={{ paddingTop: 40 }}>
          <div className="empty-icon">🔍</div>
          <div className="empty-title">ابحث في مكتبتك</div>
          <div className="empty-sub">ابحث بالعنوان أو الوسم أو المنصة</div>
        </div>
      ) : shown.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 40 }}>
          <div className="empty-icon">🤷</div>
          <div className="empty-title">لا نتائج</div>
          <div className="empty-sub">جرب كلمة مختلفة أو فلتراً آخر</div>
        </div>
      ) : (
        <div className="cards-grid">
          {shown.map(item => (
            <div key={item.id} className="card" onClick={() => onNavigate('detail')}>
              <div className="card-thumb">
                <div className={`thumb-inner ${item.g}`} style={{ height: '100%' }}>
                  <span>{item.emoji}</span>
                </div>
                <span className={`card-platform plat-${item.platform}`}>{item.plat}</span>
              </div>
              <div className="card-body">
                <div className="card-title">{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
