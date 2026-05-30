'use client'
import { useRouter } from 'next/navigation'
import type { SavedItem } from '@/lib/firestore'

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8']
const PLAT_LABELS: Record<string, string> = {
  instagram: 'إنستقرام', tiktok: 'تيك توك', twitter: 'تويتر',
  youtube: 'يوتيوب', linkedin: 'لينكدإن', web: 'ويب', facebook: 'فيسبوك',
}
const PLAT_EMOJI: Record<string, string> = {
  instagram: '📷', tiktok: '🎵', twitter: '🐦',
  youtube: '▶️', linkedin: '💼', web: '🌐', facebook: '👥',
}

interface Props { item: SavedItem; onFav?: (id: string, cur: boolean) => void }

export default function ContentCard({ item, onFav }: Props) {
  const router = useRouter()
  const g = GRADIENTS[(item.id || '').charCodeAt(0) % 8]

  return (
    <div className="card" onClick={() => router.push(`/item/${item.id}`)}
      style={{ overflow: 'hidden' }}>
      {/* Thumbnail */}
      <div className={g} style={{ height: 118, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.thumbnail
          ? <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ fontSize: 36 }}>{PLAT_EMOJI[item.platform] || '📄'}</span>
        }
        {/* Platform badge */}
        <span className={`plat-${item.platform}`} style={{
          position: 'absolute', top: 8, right: 8,
          padding: '3px 8px', borderRadius: 10,
          fontSize: 10, fontWeight: 800, color: 'white',
        }}>
          {PLAT_LABELS[item.platform] || item.platform}
        </span>
        {/* Fav */}
        <button
          onClick={e => { e.stopPropagation(); onFav?.(item.id!, item.isFavorite) }}
          style={{ position: 'absolute', top: 8, left: 8, width: 28, height: 28, background: 'rgba(255,255,255,0.92)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
        >
          {item.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          ⏱ {formatTime(item.createdAt?.toDate?.())}
        </div>
      </div>
    </div>
  )
}

function formatTime(date?: Date) {
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'منذ قليل'
  if (h < 24) return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d < 7) return `منذ ${d} يوم`
  return date.toLocaleDateString('ar-SA')
}
