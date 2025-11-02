import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, ExternalLink } from 'lucide-react'

function useAmplitude(analyser) {
  const [amp, setAmp] = useState(0)
  useEffect(() => {
    if (!analyser) return
    let raf
    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)
      setAmp(rms)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [analyser])
  return amp
}

export default function HoloCards({ analyser, onTrigger }) {
  const amp = useAmplitude(analyser)
  const glow = useMemo(() => {
    const a = Math.min(1, amp * 8)
    return `0 8px 40px rgba(0,240,255,${0.06 + a * 0.18}), 0 2px 12px rgba(255,45,149,${0.04 + a * 0.12})`
  }, [amp])

  const cards = [
    {
      title: 'Nebula Engine',
      desc: 'Millions of particles dancing to your frequencies.',
      cta: 'Open',
      href: '#'
    },
    {
      title: 'Modular Synth',
      desc: 'Patch, play, and sculpt sound in real-time.',
      cta: 'Play',
      href: '#'
    },
    {
      title: 'Story Loops',
      desc: 'Cards that sing their own micro-stories.',
      cta: 'Listen',
      href: '#'
    }
  ]

  return (
    <section id="cards" className="relative mx-auto my-16 w-[min(100%-1rem,980px)]">
      <div className="mb-3 text-xs uppercase tracking-widest text-white/60">Explore</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, idx) => (
          <article
            key={c.title}
            className="group holo-card relative overflow-hidden transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: glow }}
          >
            <div className="pointer-events-none absolute inset-0" style={{
              background: 'radial-gradient(120% 120% at 10% 0%, rgba(255,45,149,0.08) 0%, rgba(0,240,255,0.10) 35%, rgba(5,8,22,0) 70%)'
            }} />
            <h3 className="relative text-lg font-semibold text-white">{c.title}</h3>
            <p className="relative mt-1 text-sm text-white/70">{c.desc}</p>
            <div className="relative mt-4 flex items-center gap-2">
              <button
                onClick={() => onTrigger?.(idx)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF2D95] to-[#00F0FF] px-4 py-2 text-black text-sm font-semibold shadow-xl shadow-cyan-500/20 hover:brightness-110 transition"
              >
                <Play className="h-4 w-4" />
                {c.cta}
              </button>
              <a href={c.href} className="inline-flex items-center gap-1 text-cyan-200 hover:text-white/90 text-sm">
                Learn more <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
