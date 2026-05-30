export default function BottomNav({ active, onNavigate, onAdd }) {
  const items = [
    { id: 'home',    icon: '🏠', label: 'الرئيسية' },
    { id: 'search',  icon: '🔍', label: 'بحث' },
    null, // center add button
    { id: 'ideas',   icon: '💡', label: 'أفكار' },
    { id: 'profile', icon: '👤', label: 'حسابي' },
  ]

  return (
    <nav className="bottom-nav">
      {items.map((item, i) => {
        if (!item) {
          return (
            <button key="add" className="nav-add" onClick={onAdd} aria-label="إضافة">
              ＋
            </button>
          )
        }
        return (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
