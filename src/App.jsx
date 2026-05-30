import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import CollectionsScreen from './screens/CollectionsScreen'
import IdeasScreen from './screens/IdeasScreen'
import SaveModal from './screens/SaveModal'
import ContentDetailScreen from './screens/ContentDetailScreen'
import ActionSheet from './screens/ActionSheet'
import SearchScreen from './screens/SearchScreen'
import ProfileScreen from './screens/ProfileScreen'
import AnalyzingState from './screens/AnalyzingState'
import SuccessState from './screens/SuccessState'
import BottomNav from './components/BottomNav'

const SCREENS = [
  { id: 'home',       label: 'الرئيسية' },
  { id: 'collections',label: 'مجموعات (فارغ)' },
  { id: 'ideas',      label: 'أفكار' },
  { id: 'save',       label: 'حفظ (شيت)' },
  { id: 'detail',     label: 'تفاصيل المحتوى' },
  { id: 'action',     label: 'أكشن شيت' },
  { id: 'search',     label: 'بحث' },
  { id: 'profile',    label: 'حسابي' },
  { id: 'analyzing',  label: 'جاري التحليل' },
  { id: 'success',    label: 'تم الحفظ' },
]

export default function App() {
  const [current, setCurrent] = useState('home')
  const [activeNav, setActiveNav] = useState('home')

  function navigate(screen) {
    setCurrent(screen)
    if (['home', 'search', 'ideas', 'profile'].includes(screen)) {
      setActiveNav(screen)
    }
  }

  function renderScreen() {
    switch (current) {
      case 'home':        return <HomeScreen onNavigate={navigate} />
      case 'collections': return <CollectionsScreen onNavigate={navigate} />
      case 'ideas':       return <IdeasScreen onNavigate={navigate} />
      case 'save':        return <SaveModal onClose={() => navigate('home')} onAnalyzing={() => navigate('analyzing')} />
      case 'detail':      return <ContentDetailScreen onBack={() => navigate('home')} onAction={() => navigate('action')} />
      case 'action':      return <ActionSheet onClose={() => navigate('detail')} />
      case 'search':      return <SearchScreen onNavigate={navigate} />
      case 'profile':     return <ProfileScreen onNavigate={navigate} />
      case 'analyzing':   return <AnalyzingState onDone={() => navigate('success')} />
      case 'success':     return <SuccessState onClose={() => navigate('home')} />
      default:            return <HomeScreen onNavigate={navigate} />
    }
  }

  const hasBottomNav = !['save', 'detail', 'action', 'analyzing', 'success'].includes(current)
  const hasOverlay   =  ['save', 'action', 'analyzing', 'success'].includes(current)

  return (
    <>
      {/* Prototype screen switcher bar */}
      <div className="screen-nav">
        {SCREENS.map(s => (
          <button
            key={s.id}
            className={`screen-nav-btn ${current === s.id ? 'active' : 'inactive'}`}
            onClick={() => navigate(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="app-shell with-nav-bar">
        <div className="screen">
          {/* Main screen content */}
          {hasOverlay ? (
            /* Show the underlying screen behind modal overlays */
            <>
              <div style={{ position: 'relative' }}>
                <HomeScreen onNavigate={navigate} />
              </div>
              {renderScreen()}
            </>
          ) : (
            renderScreen()
          )}
        </div>

        {hasBottomNav && (
          <BottomNav active={activeNav} onNavigate={(screen) => {
            navigate(screen)
            setActiveNav(screen)
          }} onAdd={() => navigate('save')} />
        )}
      </div>
    </>
  )
}
