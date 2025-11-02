import { useRef } from 'react'
import Spline from '@splinetool/react-spline'
import { Rocket, Waves } from 'lucide-react'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function HeroScene({ onExplore }) {
  const containerRef = useRef(null)

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-[#050816]">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/7m4PRZ7kg6K1jPfF/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Atmospheric gradient overlays that don't block interaction */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(60% 60% at 50% 40%, rgba(0,240,255,0.12) 0%, rgba(0,0,0,0) 60%)'
      }} />

      {/* HUD / Copy */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div className="max-w-4xl text-center select-none">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md shadow-[0_8px_40px_rgba(0,240,255,0.08),0_2px_12px_rgba(255,45,149,0.04)]">
            <Waves className="h-4 w-4 text-cyan-300" />
            Live synthosphere
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(0,240,255,0.25)]">
            AURORA·∞ — a living synthosphere
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-cyan-100/80">
            Touch the sound. See the music. Live inside the synth.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => { onExplore?.(); scrollToId('cards'); }}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00F0FF] px-6 py-3 text-black font-semibold shadow-xl shadow-cyan-500/20 hover:brightness-110 transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
              aria-label="Explore"
            >
              <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
              Explore
            </button>
            <a
              href="#spectrum"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-white/90 backdrop-blur-md hover:bg-white/10 transition"
            >
              See the spectrum
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
