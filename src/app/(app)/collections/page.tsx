'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, type SavedItem } from '@/lib/firestore'
import ContentCard from '@/components/ContentCard'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

const CATEGORIES = [
  { name: 'سريع وسهل',    emoji: '⚡', bg: '#FFF3E0', border: '#FFD180' },
  { name: 'تحفيزي',       emoji: '🔥', bg: '#FCE4EC', border: '#F48FB1' },
  { name: 'تعليمي',       emoji: '📚', bg: '#E3F2FD', border: '#90CAF9' },
  { name: 'ترفيهي',       emoji: '😂', bg: '#F3E5F5', border: '#CE93D8' },
  { name: 'ريادة أعمال',  emoji: '💼', bg: '#E8F5E9', border: '#A5D6A7' },
  { name: 'تقني',         emoji: '💻', bg: '#FFFDE7', border: '#FFF176' },
  { name: 'صحة ولياقة',   emoji: '💪', bg: '#FBE9E7', border: '#FFAB91' },
  { name: 'إبداع وفن',    emoji: '🎨', bg: '#EDE7F6', border: '#B39DDB' },
]

export default function CollectionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<SavedItem[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [showSave, setShowSave] = useState(false)

  useEffect(() => { if (!loading && !user) router.replace('/login') }, [user, loading, router])
  useEffect(() => { if (user) getUserItems(user.uid).then(setItems) }, [user])

  const favorites = items.filter(it => it.isFavorite)

  return (
    <>
      <div className="page">
        <div style={{ padding: '20px 20px 16px' }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>أفكار</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>تصنيفات المحتوى والمفضلة</div>
        </div>

        {/* Search banner */}
        <div style={{ margin: '0 20px 20px', background: 'var(--accent)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔎</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', flex: 1 }}>ابحث بالموضوع أو الكلمة المفتاحية</span>
        </div>

        {/* Categories */}
        <div style={{ padding: '0 20px 4px', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>تصنيفات المحتوى</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.name}
              onClick={() => setActive(active === cat.name ? null : cat.name)}
              style={{ background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 16, padding: '18px 14px', cursor: 'pointer', transition: 'transform 0.15s', minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', outline: active === cat.name ? `2px solid var(--accent)` : 'none' }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</div>
            </div>
          ))}
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>❤️ المفضلة</span>
              <span style={{ fontSize: 13, color: 'var(--accent)' }}>{favorites.length} عنصر</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
              {favorites.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {/* Recent */}
        {items.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>🕐 حديثاً</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
              {items.slice(0, 4).map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 40px' }}>
            <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }}>💡</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>احفظ محتوى لتظهر أفكارك هنا</div>
          </div>
        )}
      </div>

      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && <SaveModal onClose={() => setShowSave(false)} onSaved={() => user && getUserItems(user.uid).then(setItems)} />}
    </>
  )
}
