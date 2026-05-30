import { useState } from 'react'

const AI_ROWS = [
  { label: 'الموضوع',  value: 'بناء العادات الصحية والإنتاجية الشخصية' },
  { label: 'الهوك',    value: '"كيف تبني عادة في 21 يوم بدون إرادة حديدية"' },
  { label: 'الفورمات', value: 'قائمة نصائح — ريلز قصير (60 ثانية)' },
  { label: 'المزاج',   value: 'تحفيزي / علمي / عملي' },
]

const GEN_TYPES = ['كابشن', 'هوك', 'سكريبت', 'خيط']

const OUTPUTS = {
  'كابشن': '✨ النوم المبكر مش عن الإرادة — عن التصميم!\n\nجرّب هذا 7 أيام فقط:\n🌙 أغلق الشاشات الساعة 9\n📚 اقرأ 10 دقائق\n😴 نم الساعة 10\n\nبعد أسبوع ستنام وحدك بدون جهد.\n\n#عادات #إنتاجية #تطوير_الذات',
  'هوك':   '"لو قلتلك إن النوم المبكر مو قرار — هو برنامج تنصبه في عقلك؟"',
  'سكريبت': 'السيناريو:\n[0-5ث] سؤال: كيف تنام مبكر وأنت مو متعب؟\n[5-15ث] المشكلة: الجميع يجرب الإرادة وتفشل\n[15-40ث] الحل: برمج بيئتك مش إرادتك\n[40-55ث] الخطوات الثلاث\n[55-60ث] CTA: جرب أسبوع واحد',
  'خيط':   '1/ النوم المبكر = 90٪ بيئة + 10٪ إرادة\n\n2/ الخطأ الأول: تحاول تنام وأنت مو متعب…\n\n3/ الحل: أنشئ "طقس نوم" يخبر دماغك تلقائياً\n\n4/ الخطوات العملية الثلاث 🧵',
}

export default function ContentDetailScreen({ onBack, onAction }) {
  const [activeGen, setActiveGen] = useState('كابشن')

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* Top bar */}
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>→</button>
        <div className="topbar-right">
          <button className="ai-pill">🧠 AI مساعد</button>
          <button className="icon-btn" onClick={onAction}>⋯</button>
        </div>
      </div>

      {/* Hero image */}
      <div className="hero-img">
        <div className="thumb-inner g1" style={{ height: '100%' }}>
          <span style={{ fontSize: 80 }}>🌙</span>
        </div>
        <div className="hero-fade" />
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Source chip */}
        <span className="source-chip plat-instagram">📷 إنستقرام</span>

        {/* Title */}
        <div className="detail-title">
          كيف تبني عادة النوم المبكر في 21 يوم فقط — بدون إرادة حديدية
        </div>

        {/* Time */}
        <div className="detail-time">
          <span>📅</span>
          <span>محفوظ منذ ساعتين</span>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span>👁 مشاهدة ريلز</span>
        </div>

        {/* Tags */}
        <div className="tags-row">
          {['#عادات', '#نوم', '#إنتاجية', '#21يوم', '#تطوير_ذات'].map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>

        {/* AI Analysis */}
        <div className="ai-card">
          <div className="ai-card-header">
            <span style={{ fontSize: 20 }}>🧠</span>
            <span className="ai-card-title">تحليل الذكاء الاصطناعي</span>
          </div>
          {AI_ROWS.map(row => (
            <div key={row.label} className="ai-row">
              <span className="ai-label">{row.label}</span>
              <span className="ai-value">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Generate section */}
        <div className="section-title">توليد المحتوى</div>

        <div className="gen-tabs">
          {GEN_TYPES.map(t => (
            <button
              key={t}
              className={`gen-tab ${activeGen === t ? 'active' : 'inactive'}`}
              onClick={() => setActiveGen(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button className="btn-accent-full">
          <span>✨</span>
          <span>توليد {activeGen}</span>
        </button>

        {/* Output */}
        <div className="output-box">
          <div className="output-text" style={{ whiteSpace: 'pre-line' }}>
            {OUTPUTS[activeGen]}
          </div>
          <button className="copy-btn">📋 نسخ</button>
        </div>

        {/* Locked PRO section */}
        <div className="locked-box">
          <div className="locked-badge">🔒 PRO فقط</div>
          <div className="locked-title">توليد متعدد + تخصيص اللهجة</div>
          <div className="locked-sub">
            ولّد 10 نسخ مختلفة، خصص اللهجة (خليجي / مصري / شامي)، وصدّر مباشرة
          </div>
          <button className="btn-outline">🚀 افتح PRO</button>
        </div>
      </div>
    </div>
  )
}
