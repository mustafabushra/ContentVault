'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, signInAnonymously, linkWithPopup
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAnonymous: boolean
  signInWithGoogle: () => Promise<void>
  upgradeToGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, isAnonymous: false,
  signInWithGoogle: async () => {},
  upgradeToGoogle: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // دخول تلقائي كضيف بدون تسجيل
        await signInAnonymously(auth)
      } else {
        setUser(u)
        setLoading(false)
      }
    })
    return unsub
  }, [])

  // تسجيل دخول جديد بـ Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  // ربط حساب الضيف بـ Google (يحافظ على البيانات)
  const upgradeToGoogle = async () => {
    if (!user) return
    const provider = new GoogleAuthProvider()
    try {
      await linkWithPopup(user, provider)
    } catch {
      // لو الحساب موجود مسبقاً، سجّل دخول عادي
      await signInWithGoogle()
    }
  }

  const logout = async () => {
    await signOut(auth)
    await signInAnonymously(auth)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAnonymous: user?.isAnonymous ?? false,
      signInWithGoogle, upgradeToGoogle, logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
