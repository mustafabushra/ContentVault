'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ItemsProvider } from '@/contexts/ItemsContext'
import BottomNav from '@/components/BottomNav'
import SaveModal from '@/components/SaveModal'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showSave, setShowSave] = useState(false)

  // Redirect to login only if not anonymous and not loading
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#FF7A00,#FF4500)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🗄️</div>
          <div style={{ width: 36, height: 36, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    )
  }

  return (
    <ItemsProvider>
      {/* Inject shared save modal open trigger via CSS variable trick using data attr */}
      <div data-show-save={showSave ? 'true' : 'false'} style={{ display: 'contents' }}>
        {children}
      </div>
      <BottomNav onAdd={() => setShowSave(true)} />
      {showSave && (
        <SaveModal
          onClose={() => setShowSave(false)}
          onSaved={() => setShowSave(false)}
        />
      )}
    </ItemsProvider>
  )
}
