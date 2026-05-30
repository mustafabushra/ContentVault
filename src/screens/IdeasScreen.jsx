import { useState } from 'react'

const CATEGORIES = [
  { name: 'سريع وسهل',   emoji: '⚡', bg: '#FFF3E0', border: '#FFD180' },
  { name: 'تحفيزي',      emoji: '🔥', bg: '#FCE4EC', border: '#F48FB1' },
  { name: 'تعليمي',      emoji: '📚', bg: '#E3F2FD', border: '#90CAF9' },
  { name: 'ترفيهي',      emoji: '😂', bg: '#F3E5F5', border: '#CE93D8' },
  { name: 'ريادة أعمال', emoji: '💼', bg: '#E8F5E9', border: '#A5D6A7' },
  { name: 'تقني',        emoji: '💻', bg: '#FFFDE7', border: '#FFF176' },
  { name: 'صحة ولياقة',  emoji: '💪', bg: '#FBE9E7', border: '#FFAB91' },
  { name: 'إبداع وفن',   emoji: '🎨', bg: '#EDE7F6', border: '#B39DDB' },
]

const SUGGESTED = [
  { id: 1, title: '10 طرق تزيد إنتاجيتك في الصباح', platform: 'tiktok',    plat: 'تيك توك',   g: 'g2', emoji: '☀️' },
  { id: 2, title: 'لماذا تفشل خطط التسويق وكيف تصلحها', platform: 'twitter', plat: 'تويتر',    g: 'g8', emoji: '📊' },
  { id: 3, title: 'قصة نجاح: من الصفر لـ 100 ألف متابع', platform: 'instagram', plat: 'إنستقرام', g: 'g4', emoji: '🚀' },
  { id: 4, title: 'أفضل تطبيقات التصميم للمبتدئين 2025', platform: 'youtube', plat: 'يوتيوب',  g: 'g5', emoji: '🎨' },
]

export default function IdeasScreen({ onNavigate }) {
  const [search, setSearch] = useState('')

  return (
    <div className="scroll-screen" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-title">أفكار</div>
          <div className="header-sub">اكتشف وأنشئ محتواك</div>
        </div>
      </div>

      {/* Search banner */}
      <div className="banner" style={{ alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🔎</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالموضوع أو الكلمة المفتاحية…"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: 14,
            fontFamily: 'var(--font)',
            fontWeight: 500,
          }}
        />
      </div>

      {/* Categories section */}
      <div className="section-header">
        <span className="section-header-title">تصنيفات المحتوى</span>
        <span className="section-more">الكل</span>
      </div>

      <div className="category-grid">
        {CATEGORIES.map(cat => (
          <div
            key={cat.name}
            className="category-card"
            style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
          >
            <div className="category-emoji">{cat.emoji}</div>
            <div className="category-name">{cat.name}</div>
          </div>
        ))}
      </div>

      {/* Suggested section */}
      <div className="section-header">
        <span className="section-header-title">مقترح لك</span>
        <span className="section-more">المزيد</span>
      </div>

      <div className="cards-grid">
        {SUGGESTED.map(item => (
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
    </div>
  )
}
