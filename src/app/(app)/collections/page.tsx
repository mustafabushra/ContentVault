'use client'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useItems } from '@/contexts/ItemsContext'
import { getUserCollections, createCollection, deleteCollection, type UserCollection } from '@/lib/firestore'
import { Timestamp } from 'firebase/firestore'
import ContentCard from '@/components/ContentCard'

const EMOJIS = ['📁','⚡','🔥','💡','🎯','💼','📚','🎨','💪','✍️','🚀','❤️','🌟','🎵','🏆','🌈']
const COLORS = ['#FFF3E0','#FCE4EC','#E3F2FD','#E8F5E9','#F3E5F5','#FFFDE7','#FBE9E7','#EDE7F6']
const CATEGORIES = [
  { emoji: '⚡', name: 'سريع وسهل', color: '#FFF3E0' },
  { emoji: '🔥', name: 'تحفيزي', color: '#FCE4EC' },
  { emoji: '📚', name: 'تعليمي', color: '#E3F2FD' },
  { emoji: '💼', name: 'ريادة أعمال', color: '#E8F5E9' },
  { emoji: '😂', name: 'ترفيهي', color: '#F3E5F5' },
  { emoji: '💻', name: 'تقني', color: '#FFFDE7' },
]

export default function CollectionsPage() {
  const { user } = useAuth()
  const { items, toggleFav } = useItems()
  const [cols, setCols] = useState<UserCollection[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📁')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) getUserCollections(user.uid).then(setCols)
  }, [user])

  const favorites = useMemo(() => items.filter(it => it.isFavorite), [items])
  const activeCol = cols.find(c => c.id === activeId)
  const activeItems = useMemo(() =>
    activeId ? items.filter(it => it.collectionId === activeId) : [],
    [items, activeId]
  )

  async function handleCreate() {
    if (!user || !newName.trim() || saving) return
    setSaving(true)
    try {
      const id = await createCollection({ userId: user.uid, name: newName.trim(), emoji: newEmoji, color: newColor, createdAt: Timestamp.now() })
      setCols(prev => [{ id, userId: user.uid, name: newName.trim(), emoji: newEmoji, color: newColor, createdAt: Timestamp.now() }, ...prev])
      setNewName(''); setShowNew(false)
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('حذف المجموعة؟ المحتوى لن يُحذف.')) return
    await deleteCollection(id)
    setCols(prev => prev.filter(c => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
            {activeCol ? activeCol.name : 'أفكار'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            {activeCol ? `${activeItems.length} عنصر` : `${cols.length} مجموعة • ${favorites.length} مفضلة`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeCol && (
            <button onClick={() => setActiveId(null)}
              style={{ width: 40, height: 40, borderRadius: 12, background: 'white', border: 'none', cursor: 'pointer', fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>→</button>
          )}
          {!activeCol && (
            <button onClick={() => setShowNew(true)}
              style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent)', border: 'none', cursor: 'pointer', fontSize: 22, color: 'white', boxShadow: '0 4px 12px rgba(255,122,0,0.35)' }}>＋</button>
          )}
        </div>
      </div>

      {/* Active collection view */}
      {activeCol ? (
        activeItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>لا يوجد محتوى في هذه المجموعة بعد</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
            {activeItems.map(item => <ContentCard key={item.id} item={item} onFav={toggleFav} />)}
          </div>
        )
      ) : (
        <>
          {/* My collections */}
          {cols.length > 0 && (
            <>
              <SectionTitle>مجموعاتي</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
                {cols.map(col => {
                  const count = items.filter(it => it.collectionId === col.id).length
                  return (
                    <div key={col.id} onClick={() => setActiveId(col.id!)}
                      style={{ background: col.color, borderRadius: 16, padding: '16px 14px', cursor: 'pointer', minHeight: 90, position: 'relative', transition: 'transform 0.12s' }}
                      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{col.emoji}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{col.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{count} عنصر</div>
                      <button onClick={e => { e.stopPropagation(); handleDelete(col.id!) }}
                        style={{ position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Preset categories */}
          <SectionTitle>تصنيفات المحتوى</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
            {CATEGORIES.map(cat => (
              <div key={cat.name} style={{ background: cat.color, borderRadius: 16, padding: '16px 14px', cursor: 'pointer', minHeight: 88, transition: 'transform 0.12s' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{cat.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</div>
              </div>
            ))}
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 10px' }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>❤️ المفضلة</span>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{favorites.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
                {favorites.slice(0, 6).map(item => <ContentCard key={item.id} item={item} onFav={toggleFav} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* New collection sheet */}
      {showNew && (
        <div className="sheet-overlay" onClick={() => setShowNew(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>مجموعة جديدة</span>
              <button onClick={() => setShowNew(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: '0 20px 32px' }}>
              {/* Preview */}
              <div style={{ background: newColor, borderRadius: 16, padding: '16px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{newEmoji}</span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{newName || 'اسم المجموعة'}</span>
              </div>

              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="اسم المجموعة"
                maxLength={30}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl', marginBottom: 16 }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>الأيقونة</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: newEmoji === e ? '2.5px solid var(--accent)' : '2px solid transparent', background: 'var(--bg)', cursor: 'pointer', fontSize: 20, transition: 'border-color 0.15s' }}>
                    {e}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>اللون</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newColor === c ? '3px solid var(--accent)' : '3px solid transparent', cursor: 'pointer', transition: 'border-color 0.15s' }} />
                ))}
              </div>

              <button onClick={handleCreate} disabled={!newName.trim() || saving}
                style={{ width: '100%', padding: 14, background: newName.trim() ? 'var(--accent)' : '#ccc', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'background 0.2s' }}>
                {saving ? '...' : '＋ إنشاء المجموعة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '0 20px 10px', fontSize: 15, fontWeight: 800 }}>{children}</div>
}
