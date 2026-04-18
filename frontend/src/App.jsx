import './styles/globals.css'
import LandingPage from './pages/LandingPage'
import PlatformPage from './pages/PlatformPage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/platform') {
    return <PlatformPage />
  }

  return <LandingPage onOpenPlatform={() => window.location.assign('/platform')} />
}

export default App
