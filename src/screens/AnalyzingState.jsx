import { useEffect } from 'react'

export default function AnalyzingState({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="sheet-overlay">
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="state-sheet">
          <div className="dots-anim">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>

          <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
          <div className="state-title">يتم التحليل…</div>
          <div className="state-sub">
            الذكاء الاصطناعي يحلل المحتوى ويستخرج الأفكار الرئيسية
          </div>

          <div style={{ marginTop: 32, width: '100%' }}>
            {['استخراج البيانات…', 'تحليل الموضوع…', 'توليد الأفكار…'].map((step, i) => (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  animation: `fadeIn ${0.3 + i * 0.5}s ease forwards`,
                  opacity: 0,
                }}
              >
                <span style={{ fontSize: 16, color: 'var(--accent)' }}>⏳</span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
