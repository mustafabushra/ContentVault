'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/home')
  }, [user, loading, router])

  if (loading) return null

  return (
    <div style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
      {/* Logo */}
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#FF7A00,#FF4500)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 24, boxShadow: '0 8px 32px rgba(255,122,0,0.35)' }}>
        🗄️
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>ContentVault</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.6, maxWidth: 280 }}>
        احفظ المحتوى الملهم من أي منصة وحوّله لأفكار جديدة بالذكاء الاصطناعي
      </p>

      {/* Features */}
      {[
        { icon: '📱', text: 'احفظ من إنستقرام وتيك توك ويوتيوب' },
        { icon: '🧠', text: 'تحليل ذكي فوري بـ Groq AI' },
        { icon: '✨', text: 'ولّد كابشن وهوك وسكريبت في ثوانٍ' },
      ].map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: 'white', padding: '12px 16px', borderRadius: 14, width: '100%', maxWidth: 320, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'right' }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
          <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{f.text}</span>
        </div>
      ))}

      <div style={{ height: 40 }} />

      {/* Google Sign In */}
      <button
        onClick={signInWithGoogle}
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', border: '1.5px solid var(--border)', borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', width: '100%', maxWidth: 320, justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', fontFamily: 'inherit', transition: 'transform 0.15s' }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        تسجيل الدخول بـ Google
      </button>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 20, lineHeight: 1.5 }}>
        بالمتابعة توافق على شروط الاستخدام وسياسة الخصوصية
      </p>
    </div>
  )
}
