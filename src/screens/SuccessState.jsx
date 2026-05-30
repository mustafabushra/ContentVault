export default function SuccessState({ onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="state-sheet">
          <div
            style={{
              fontSize: 80,
              marginBottom: 8,
              animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            ✅
          </div>
          <div className="state-title">تم الحفظ!</div>
          <div className="state-sub">
            أُضيف المحتوى لمكتبتك وسيتم تحليله بالذكاء الاصطناعي
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 32,
              width: '100%',
            }}
          >
            <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>
              العودة للمكتبة
            </button>
            <button className="btn-accent" style={{ flex: 1 }} onClick={onClose}>
              عرض التحليل
            </button>
          </div>
        </div>

        <style>{`
          @keyframes popIn {
            0%   { transform: scale(0.3); opacity: 0; }
            60%  { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
