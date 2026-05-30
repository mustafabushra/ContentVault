import { useState } from 'react'

const ITEMS = [
  { id: 1, title: 'كيف تبني عادة النوم المبكر في 21 يوم فقط', platform: 'instagram', plat: 'إنستقرام', g: 'g1', emoji: '🌙', fav: true,  time: 'منذ ساعتين' },
  { id: 2, title: '5 أدوات AI تغنيك عن موظف كامل',           platform: 'tiktok',    plat: 'تيك توك',   g: 'g2', emoji: '🤖', fav: false, time: 'منذ 4 ساعات' },
  { id: 3, title: 'الفرق بين رائد الأعمال والمدير — خيط',    platform: 'twitter',   plat: 'تويتر',     g: 'g8', emoji: '🧵', fav: false, time: 'أمس' },
  { id: 4, title: 'تصوير ريلز احترافي بموبايلك فقط',         platform: 'instagram', plat: 'إنستقرام',  g: 'g4', emoji: '📸', fav: true,  time: 'منذ يومين' },
  { id: 5, title: 'لماذا 80٪ من المحتوى يفشل في الأسبوع الأول', platform: 'youtube', plat: 'يوتيوب', g: 'g5', emoji: '📉', fav: false, time: 'منذ 3 أيام' },
  { id: 6, title: 'سكريبت الفيديو المثالي — قالب جاهز',      platform: 'tiktok',    plat: 'تيك توك',   g: 'g3', emoji: '✍️', fav: false, time: 'منذ أسبوع' },
]

const FILTERS = ['الكل', 'تصوير', 'ريادة', 'كتابة', 'تحفيز', 'تعليمي']

export default function HomeScreen({ onNavigate }) {
  const [activeTab, setActiveTab]    = useState('all')
  const [activeFilter, setFilter]    = useState('الكل')
  const [favorites, setFavorites]    = useState({ 1: true, 4: true })

  function toggleFav(id) {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="scroll-screen" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-title">مكتبتي</div>
          <div className="header-sub">{ITEMS.length} عناصر محفوظة</div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => onNavigate('search')}>🔍</button>
        </div>
      </div>

      {/* Toggle tabs */}
      <div className="toggle-tabs">
        <button className={`toggle-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          كل المحتوى
        </button>
        <button className={`toggle-tab ${activeTab === 'col' ? 'active' : ''}`} onClick={() => { setActiveTab('col'); onNavigate('collections') }}>
          المجموعات
        </button>
      </div>

      {/* Orange Banner */}
      <div className="banner" onClick={() => onNavigate('save')}>
        <div className="banner-text">شفت محتوى مثير؟ احفظه هنا ←</div>
        <div className="banner-icons">📱 🎬 🐦</div>
      </div>

      {/* Filter chips */}
      <div className="filter-row">
        {FILTERS.map(f => (
          <button key={f} className={`chip ${activeFilter === f ? 'active' : 'inactive'}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="cards-grid">
        {ITEMS.map(item => (
          <div key={item.id} className="card" onClick={() => onNavigate('detail')}>
            <div className="card-thumb">
              <div className={`thumb-inner ${item.g}`} style={{ height: '100%' }}>
                <span>{item.emoji}</span>
              </div>
              <span className={`card-platform plat-${item.platform}`}>{item.plat}</span>
              <button
                className="card-fav"
                onClick={e => { e.stopPropagation(); toggleFav(item.id) }}
              >
                {favorites[item.id] ? '❤️' : '🤍'}
              </button>
            </div>
            <div className="card-body">
              <div className="card-title">{item.title}</div>
              <div className="card-meta">⏱ {item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
