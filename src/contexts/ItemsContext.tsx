'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserItems, toggleFavorite, type SavedItem } from '@/lib/firestore'

interface ItemsContextType {
  items: SavedItem[]
  loading: boolean
  refresh: () => Promise<void>
  toggleFav: (id: string, current: boolean) => Promise<void>
}

const ItemsContext = createContext<ItemsContextType>({
  items: [], loading: true,
  refresh: async () => {},
  toggleFav: async () => {},
})

export function ItemsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setItems(await getUserItems(user.uid))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const toggleFav = useCallback(async (id: string, current: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(it => it.id === id ? { ...it, isFavorite: !current } : it))
    try {
      await toggleFavorite(id, current)
    } catch {
      // Revert on error
      setItems(prev => prev.map(it => it.id === id ? { ...it, isFavorite: current } : it))
    }
  }, [])

  return (
    <ItemsContext.Provider value={{ items, loading, refresh, toggleFav }}>
      {children}
    </ItemsContext.Provider>
  )
}

export const useItems = () => useContext(ItemsContext)
