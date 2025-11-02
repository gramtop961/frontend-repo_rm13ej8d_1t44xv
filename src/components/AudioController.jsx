import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Power, Volume2, Waveform } from 'lucide-react'

function createAudioGraph() {
  const audio = new (window.AudioContext || window.webkitAudioContext)()
  const masterGain = audio.createGain()
  masterGain.gain.value = 0.8
  masterGain.connect(audio.destination)

  const analyser = audio.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.85
  analyser.connect(masterGain)

  return { audio, masterGain, analyser }
}

function makePluck(audio, destination) {
  return (pitch = 440) => {
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    const filter = audio.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(8000, now)

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(pitch, now)

    // Short percussive envelope
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.6, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.35)

    osc.connect(gain)
    gain.connect(filter)
    filter.connect(destination)

    osc.start(now)
    osc.stop(now + 0.4)
  }
}

function makeAmbientPad(audio, destination) {
  let active = false
  let nodes = []

  const start = () => {
    if (active) return
    active = true
    const freqs = [110, 220, 330]
    const now = audio.currentTime
    nodes = freqs.map((f, i) => {
      const o = audio.createOscillator()
      const g = audio.createGain()
      o.type = 'sawtooth'
      o.frequency.setValueAtTime(f, now)
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(0.15 / (i + 1), now + 1.2)
      o.connect(g)
      g.connect(destination)
      o.start()
      return { o, g }
    })
  }

  const stop = () => {
    if (!active) return
    active = false
    const now = audio.currentTime
    nodes.forEach(({ o, g }) => {
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
      o.stop(now + 0.65)
    })
    nodes = []
  }

  return { start, stop, get active() { return active } }
}

export default function AudioController({ onReady }) {
  const [running, setRunning] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [padOn, setPadOn] = useState(false)
  const [vol, setVol] = useState(0.8)

  const audioRef = useRef(null)
  const masterRef = useRef(null)
  const analyserRef = useRef(null)
  const pluckRef = useRef(null)
  const padRef = useRef(null)
  const micRef = useRef(null)

  // Initialize when user interacts
  const init = async () => {
    if (running) return
    const { audio, masterGain, analyser } = createAudioGraph()
    audioRef.current = audio
    masterRef.current = masterGain
    analyserRef.current = analyser
    pluckRef.current = makePluck(audio, analyser)
    padRef.current = makeAmbientPad(audio, analyser)
    masterGain.gain.value = vol

    setRunning(true)
    onReady?.({ audioCtx: audio, masterGain, analyser, playPluck: pluckRef.current })
    // small startup pluck
    pluckRef.current?.(392)
  }

  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = vol
  }, [vol])

  const toggleMic = async () => {
    if (!running) return
    if (micOn) {
      if (micRef.current?.stream) {
        micRef.current.stream.getTracks().forEach(t => t.stop())
      }
      micRef.current = null
      setMicOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const source = audioRef.current.createMediaStreamSource(stream)
      const comp = audioRef.current.createDynamicsCompressor()
      source.connect(comp)
      comp.connect(analyserRef.current)
      micRef.current = { source, comp, stream }
      setMicOn(true)
      pluckRef.current?.(523.25)
    } catch (e) {
      console.warn('Mic permission denied or error:', e)
    }
  }

  const togglePad = () => {
    if (!running) return
    if (padRef.current?.active) {
      padRef.current.stop()
      setPadOn(false)
    } else {
      padRef.current?.start()
      setPadOn(true)
    }
  }

  return (
    <div className="sticky top-3 z-20 mx-auto mt-3 flex w-[min(100%-1rem,980px)] items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur-md shadow-[var(--glow)]">
      <div className="flex items-center gap-2">
        <button
          onClick={init}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition ${running ? 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/25' : 'bg-pink-500 text-black hover:brightness-110'}`}
          aria-label="Power"
        >
          <Power className="h-4 w-4" />
          {running ? 'Audio running' : 'Start audio'}
        </button>
        <button
          onClick={toggleMic}
          disabled={!running}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition disabled:opacity-40 ${micOn ? 'bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/25' : 'bg-white/10 hover:bg-white/15'}`}
          aria-label="Microphone"
        >
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          Mic
        </button>
        <button
          onClick={togglePad}
          disabled={!running}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition disabled:opacity-40 ${padOn ? 'bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/25' : 'bg-white/10 hover:bg-white/15'}`}
          aria-label="Ambient Pad"
        >
          <Waveform className="h-4 w-4" />
          Pad
        </button>
      </div>
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-white/70" />
        <input
          aria-label="Master Volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={vol}
          onChange={e => setVol(parseFloat(e.target.value))}
          className="accent-cyan-400"
        />
      </div>
    </div>
  )
}
