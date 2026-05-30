'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserItems, getUserCollections, createCollection, deleteCollection, updateItem, type SavedItem, type UserCollection } from '@/lib/firestore'
import { Timestamp } from 'firebase/firestore'
import ContentCard from '@/components/ContentCard'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

const PRESET_COLLECTIONS = [
  { emoji: '⚡', name: 'سريع وسهل',   color: '#FFF3E0' },
  { emoji: '🔥', name: 'تحفيزي',      color: '#FCE4EC' },
  { emoji: '📚', name: 'تعليمي',      color: '#E3F2FD' },
  { emoji: '💼', name: 'ريادة أعمال', color: '#E8F5E9' },
  { emoji: '😂', name: 'ترفيهي',      color: '#F3E5F5' },
  { emoji: '💻', name: 'تقني',        color: '#FFFDE7' },
  { emoji: '💪', name: 'صحة ولياقة',  color: '#FBE9E7' },
  { emoji: '🎨', name: 'إبداع وفن',   color: '#EDE7F6' },
]

export default function CollectionsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<SavedItem[]>([])
  const [collections, setCollections] = useState<UserCollection[]>([])
  const [activeCol, setActiveCol] = useState<string | null>(null)
  const [showSave, setShowSave] = useState(false)
  const [showNewCol, setShowNewCol] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📁')
  const [newColor, setNewColor] = useState('#E3F2FD')

  useEffect(() => {
    if (!user) return
    getUserItems(user.uid).then(setItems)
    getUserCollections(user.uid).then(setCollections)
  }, [user])

  async function handleCreateCollection() {
    if (!user || !newName.trim()) return
    const id = await createCollection({ userId: user.uid, name: newName, emoji: newEmoji, color: newColor, createdAt: Timestamp.now() })
    setCollections(prev => [{ id, userId: user.uid, name: newName, emoji: newEmoji, color: newColor, createdAt: Timestamp.now() }, ...prev])
    setNewName('')
    setShowNewCol(false)
  }

  async function handleDeleteCollection(id: string) {
    await deleteCollection(id)
    setCollections(prev => prev.filter(c => c.id !== id))
    if (activeCol === id) setActiveCol(null)
  }

  const favorites = items.filter(it => it.isFavorite)
  const colItems = activeCol ? items.filter(it => it.collectionId === activeCol) : []
  const activeColData = collections.find(c => c.id === activeCol)

  return (
    <>
      <div className="page">
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>أفكار</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {collections.length > 0 ? `${collections.length} مجموعة` : 'نظّم محتواك'}
            </div>
          </div>
          <button onClick={() => setShowNewCol(true)}
            style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent)', border: 'none', cursor: 'pointer', fontSize: 22, color: 'white', boxShadow: '0 4px 12px rgba(255,122,0,0.35)' }}>＋</button>
        </div>

        {/* Active collection view */}
        {activeCol && activeColData ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 16px' }}>
              <button onClick={() => setActiveCol(null)}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'white', border: 'none', cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>→</button>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: activeColData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{activeColData.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{activeColData.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{colItems.length} عنصر</div>
              </div>
              <button onClick={() => handleDeleteCollection(activeCol)}
                style={{ padding: '6px 12px', background: '#FFEBEE', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#E53935', fontFamily: 'inherit' }}>حذف</button>
            </div>
            {colItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>لا يوجد محتوى في هذه المجموعة</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 20px' }}>
                {colItems.map(item => <ContentCard key={item.id} item={item} />)}
              </div>
            )}
          </>
        ) : (
          <>
            {/* My collections */}
            {collections.length > 0 && (
              <>
                <div style={{ padding: '0 20px 10px', fontSize: 15, fontWeight: 800 }}>مجموعاتي</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
                  {collections.map(col => {
                    const count = items.filter(it => it.collectionId === col.id).length
                    return (
                      <div key={col.id} onClick={() => setActiveCol(col.id!)}
                        style={{ background: col.color, borderRadius: 16, padding: '16px 14px', cursor: 'pointer', transition: 'transform 0.15s', minHeight: 90 }}
                        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{col.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{col.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{count} عنصر</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Preset categories */}
            <div style={{ padding: '0 20px 10px', fontSize: 15, fontWeight: 800 }}>تصنيفات المحتوى</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 20px 20px' }}>
              {PRESET_COLLECTIONS.map(cat => (
                <div key={cat.name} style={{ background: cat.color, borderRadius: 16, padding: '16px 14px', cursor: 'pointer', minHeight: 90, transition: 'transform 0.15s' }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{cat.name}</div>
                </div>
              ))}
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>❤️ المفضلة</span>
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{favorites.length} عنصر</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
                  {favorites.map(item => <ContentCard key={item.id} item={item} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* New collection sheet */}
      {showNewCol && (
        <div className="sheet-overlay" onClick={() => setShowNewCol(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>مجموعة جديدة</span>
              <button onClick={() => setShowNewCol(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg)', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: '0 20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>اسم المجموعة</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="مثال: محتوى تحفيزي"
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 14, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--bg)', direction: 'rtl' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>الأيقونة</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['📁','⚡','🔥','💡','🎯','💼','📚','🎨','💪','✍️','🚀','❤️'].map(e => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      style={{ width: 40, height: 40, borderRadius: 10, border: newEmoji === e ? '2px solid var(--accent)' : '2px solid transparent', background: 'var(--bg)', cursor: 'pointer', fontSize: 20 }}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>اللون</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#FFF3E0','#FCE4EC','#E3F2FD','#E8F5E9','#F3E5F5','#FFFDE7','#FBE9E7','#EDE7F6'].map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: newColor === c ? '3px solid var(--accent)' : '3px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <button onClick={handleCreateCollection} disabled={!newName.trim()}
                style={{ width: '100%', padding: 14, background: newName.trim() ? 'var(--accent)' : '#ccc', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: newName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                ＋ إنشاء المجموعة
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && <SaveModal onClose={() => setShowSave(false)} onSaved={() => user && getUserItems(user.uid).then(setItems)} />}
    </>
  )
}
