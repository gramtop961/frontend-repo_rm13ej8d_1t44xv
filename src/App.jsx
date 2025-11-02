import { useState } from 'react'
import HeroScene from './components/HeroScene'
import AudioController from './components/AudioController'
import SpectrumVisualizer from './components/SpectrumVisualizer'
import HoloCards from './components/HoloCards'

function App() {
  const [audioKit, setAudioKit] = useState(null) // { audioCtx, masterGain, analyser, playPluck }

  const handleReady = (kit) => {
    setAudioKit(kit)
  }

  const handleExplore = () => {
    audioKit?.playPluck?.(440)
  }

  const handleCardTrigger = (idx) => {
    const base = 220
    const pitch = base * Math.pow(2, idx / 12)
    audioKit?.playPluck?.(pitch)
  }

  return (
    <div className="min-h-screen w-full bg-[#050816] text-white">
      <HeroScene onExplore={handleExplore} />
      <AudioController onReady={handleReady} />
      <SpectrumVisualizer analyser={audioKit?.analyser || null} />
      <HoloCards analyser={audioKit?.analyser || null} onTrigger={handleCardTrigger} />
      <footer className="mx-auto my-16 w-[min(100%-1rem,980px)] text-center text-xs text-white/60">
        © {new Date().getFullYear()} AURORA·∞ — a living synthosphere
      </footer>

      <style>{`:root{--bg:#050816;--neon-mag:#ff2d95;--synth-cyan:#00f0ff;--glass:rgba(255,255,255,0.06);--glow:0 8px 40px rgba(0,240,255,0.08),0 2px 12px rgba(255,45,149,0.04);--glass-blur:14px;}.holo-card{background:linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01));backdrop-filter:blur(var(--glass-blur));box-shadow:var(--glow);border:1px solid rgba(255,255,255,0.04);border-radius:16px;padding:18px;}`}</style>
    </div>
  )
}

export default App
