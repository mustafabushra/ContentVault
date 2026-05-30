'use client'
import { memo } from 'react'
import { useRouter } from 'next/navigation'
import type { SavedItem } from '@/lib/firestore'

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8']
const PLAT_LABELS: Record<string, string> = {
  instagram: 'إنستقرام', tiktok: 'تيك توك', twitter: 'تويتر',
  youtube: 'يوتيوب', linkedin: 'لينكدإن', web: 'ويب', facebook: 'فيسبوك',
}
const PLAT_EMOJI: Record<string, string> = {
  instagram: 'IG', tiktok: 'TT', twitter: 'X',
  youtube: 'YT', linkedin: 'LI', web: 'WEB', facebook: 'FB',
}

interface Props { item: SavedItem; onFav?: (id: string, current: boolean) => void }

function formatTime(date?: Date): string {
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'الآن'
  if (h < 24) return h + 'س'
  const d = Math.floor(h / 24)
  if (d < 7) return d + 'ي'
  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
}

const ContentCard = memo(function ContentCard({ item, onFav }: Props) {
  const router = useRouter()
  const g = GRADIENTS[(item.id?.charCodeAt(0) ?? 0) % 8]

  return (
    <div className="card" onClick={() => router.push('/item/' + item.id)} style={{ overflow: 'hidden' }}>
      <div className={g} style={{ height: 118, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {item.thumbnail && (
          <img src={item.thumbnail} alt="" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        )}
        <span className={'plat-' + item.platform}
          style={{ position: 'absolute', top: 8, right: 8, padding: '3px 7px', borderRadius: 8, fontSize: 9, fontWeight: 800, color: 'white' }}>
          {PLAT_LABELS[item.platform] ?? item.platform}
        </span>
        <button onClick={e => { e.stopPropagation(); onFav?.(item.id!, item.isFavorite) }}
          style={{ position: 'absolute', top: 7, left: 7, width: 28, height: 28, background: 'rgba(255,255,255,0.92)', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
          {item.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
      <div style={{ padding: '9px 10px 10px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, margin: '0 0 5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{formatTime(item.createdAt?.toDate?.())}</span>
          {item.analysis && <span style={{ fontSize: 9, background: 'rgba(255,122,0,0.1)', color: 'var(--accent)', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>AI✓</span>}
        </div>
      </div>
    </div>
  )
})

export default ContentCard
