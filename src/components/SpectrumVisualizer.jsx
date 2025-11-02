import { useEffect, useRef } from 'react'

export default function SpectrumVisualizer({ analyser, id = 'spectrum' }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    let dpr = Math.max(1, window.devicePixelRatio || 1)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
    }
    resize()
    const onResize = () => { dpr = Math.max(1, window.devicePixelRatio || 1); resize() }
    window.addEventListener('resize', onResize)

    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(512)

    const render = () => {
      rafRef.current = requestAnimationFrame(render)
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Background subtle glow
      const grd = ctx.createLinearGradient(0, 0, 0, height)
      grd.addColorStop(0, 'rgba(0,240,255,0.06)')
      grd.addColorStop(1, 'rgba(5,8,22,0.2)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, width, height)

      if (!analyser) return
      analyser.getByteFrequencyData(data)

      const bars = 80
      const step = Math.floor(data.length / bars)
      const barWidth = width / bars
      for (let i = 0; i < bars; i++) {
        const v = data[i * step] / 255
        const h = v * (height * 0.8)
        const x = i * barWidth
        const y = height - h
        const color = `rgba(${Math.floor(255 * v)}, 45, 149, ${0.6 + 0.4 * v})`
        ctx.fillStyle = color
        const radius = 6 * dpr
        const bw = Math.max(2 * dpr, barWidth * 0.8)
        // rounded bar
        const r = Math.min(radius, h / 2)
        ctx.beginPath()
        ctx.moveTo(x, height)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.lineTo(x + bw - r, y)
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + r)
        ctx.lineTo(x + bw, height)
        ctx.closePath()
        ctx.fill()
      }
    }
    render()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [analyser])

  return (
    <section id={id} className="relative mx-auto mt-12 w-[min(100%-1rem,980px)]">
      <div className="mb-3 text-xs uppercase tracking-widest text-white/60">Live Spectrum</div>
      <div className="relative rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md shadow-[var(--glow)]">
        <canvas ref={canvasRef} className="h-40 w-full" />
      </div>
    </section>
  )
}
