import { useEffect } from 'react'
import { TopTicker, BottomTicker } from '../components/layout/Ticker'
import '../components/layout/Ticker.css'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'
import Problem from '../components/landing/Problem'
import Tools from '../components/landing/Tools'
import Steps from '../components/landing/Steps'
import CtaBand from '../components/landing/CtaBand'

const SCROLL_OFFSET = 84
const teletypeGuideUrl = import.meta.env.VITE_TELETYPE_GUIDE_URL?.trim() || ''

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

export default function LandingPage({ onOpenPlatform }) {
  useEffect(() => {
    document.title = 'KLMsecurity.xyz — Web3 Security Platform'

    if (window.location.hash) {
      const id = window.location.hash.slice(1)
      setTimeout(() => scrollToSection(id), 50)
    }
  }, [])

  return (
    <>
      <TopTicker />
      <Navbar onOpenPlatform={onOpenPlatform} />
      <main style={{ paddingBottom: 26 }}>
        <Hero onOpenPlatform={onOpenPlatform} guideUrl={teletypeGuideUrl} />
        <Stats />
        <Problem />
        <Tools onOpenPlatform={onOpenPlatform} />
        <Steps />
        <CtaBand
          onOpenPlatform={onOpenPlatform}
          onScrollToDocs={() => scrollToSection('why')}
        />
        <Footer />
      </main>
      <BottomTicker />
    </>
  )
}
