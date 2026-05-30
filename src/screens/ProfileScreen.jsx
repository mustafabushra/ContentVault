import { useState } from 'react'

export default function ProfileScreen({ onNavigate }) {
  const [notif, setNotif]   = useState(true)
  const [dark, setDark]     = useState(false)

  return (
    <div className="scroll-screen" style={{ paddingBottom: 80 }}>
      {/* Profile header */}
      <div className="profile-header">
        <div className="avatar">👤</div>
        <div className="profile-name">محمد الرشيدي</div>
        <div className="profile-email">m.rashidi@gmail.com</div>
        <div className="pro-badge">⭐ Creator Pro</div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-num">142</div>
          <div className="stat-label">محفوظات</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">38</div>
          <div className="stat-label">مفضلة</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <div className="stat-num">67</div>
          <div className="stat-label">أفكار</div>
        </div>
      </div>

      {/* Settings sections */}
      <div style={{ height: 8 }} />

      <div className="settings-section">
        <div className="settings-item" onClick={() => {}}>
          <div className="settings-item-left">
            <div className="settings-icon">🔔</div>
            <span className="settings-label">الإشعارات</span>
          </div>
          <div
            className={`toggle-sw ${notif ? 'on' : 'off'}`}
            onClick={e => { e.stopPropagation(); setNotif(n => !n) }}
          />
        </div>

        <div className="settings-item" onClick={() => {}}>
          <div className="settings-item-left">
            <div className="settings-icon">🌙</div>
            <span className="settings-label">الوضع الداكن</span>
          </div>
          <div
            className={`toggle-sw ${dark ? 'on' : 'off'}`}
            onClick={e => { e.stopPropagation(); setDark(d => !d) }}
          />
        </div>

        <div className="settings-item" onClick={() => {}}>
          <div className="settings-item-left">
            <div className="settings-icon">🌐</div>
            <span className="settings-label">اللغة</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>عربي</span>
            <span className="settings-arrow">›</span>
          </div>
        </div>

        <div className="settings-item" onClick={() => {}}>
          <div className="settings-item-left">
            <div className="settings-icon">🔒</div>
            <span className="settings-label">الخصوصية</span>
          </div>
          <span className="settings-arrow">›</span>
        </div>

        <div className="settings-item" onClick={() => {}}>
          <div className="settings-item-left">
            <div className="settings-icon">❓</div>
            <span className="settings-label">المساعدة والدعم</span>
          </div>
          <span className="settings-arrow">›</span>
        </div>
      </div>

      {/* Upgrade card */}
      <div className="upgrade-card">
        <div className="upgrade-title">🚀 ترقّ إلى Creator Plan</div>
        <div className="upgrade-sub">
          توليد غير محدود، تحليل متقدم، دعم اللهجات، وأولوية في الذكاء الاصطناعي
        </div>
        <button className="btn-white">عرض الخطط</button>
      </div>

      {/* Logout */}
      <div className="settings-section" style={{ margin: '0 16px 24px' }}>
        <div className="settings-item" style={{ justifyContent: 'center' }}>
          <span style={{ color: '#E53935', fontSize: 15, fontWeight: 700 }}>تسجيل الخروج</span>
        </div>
      </div>
    </div>
  )
}
