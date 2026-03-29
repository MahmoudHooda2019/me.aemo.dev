<template>
  <div class="portrait-wrapper" ref="wrapperRef">
    <canvas
      ref="canvasRef"
      class="simulation-container"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        cursor: 'crosshair',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }"
      oncontextmenu="return false;"
      aria-label="Animated portrait"
      role="img"
    />
    <div class="typing-text" aria-live="polite">
      <span class="typed-text">{{ displayedText }}</span>
      <span class="cursor" :class="{ 'cursor-blink': isBlinking }"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Constants
const PHRASES      = ['hi, Aemo here.', 'designer & dev.', "let's build."]
const TYPE_SPEED   = 90
const DELETE_SPEED = 45
const PAUSE_END    = 1800
const PAUSE_START  = 400

// State
const canvasRef  = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const size       = ref(400)

const pointer = ref({ x: -1000, y: -1000, active: false })

const shaderTarget  = ref({ blur: 0.5, opacity: 0.12, brightness: 0.5 })
const shaderCurrent = ref({ blur: 0.5, opacity: 0.12, brightness: 0.5 })

let animationId: number | null = null
let isVisible = true
let clickFlashUntil = 0

const displayedText = ref('')
const isBlinking    = ref(false)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

// Shape types
type ShapeType = 'line' | 'circle' | 'square' | 'triangle' | 'diamond' | 'star'

interface Line {
  x: number; y: number
  targetX: number; targetY: number
  vx: number; vy: number
  length: number; angle: number
  r: number; g: number; b: number
  baseAlpha: number; currentAlpha: number
  delay: number
  shape: ShapeType
  rotation: number
}

const shapes: ShapeType[] = ['line', 'circle', 'square', 'triangle', 'diamond', 'star']
const currentShape = ref<ShapeType>('line')

const getRandomShape = (): ShapeType => shapes[Math.floor(Math.random() * shapes.length)]

const lines         = ref<Line[]>([])
const imageLoaded   = ref(false)
const startTime     = ref<number | null>(null)
const originalImage = ref<HTMLImageElement | null>(null)
const imageOffset   = ref({ x: 0, y: 0, width: 0, height: 0 })
const pixelData     = ref<Uint8ClampedArray | null>(null)

// Sizing
const updateSize = () => {
  const w = window.innerWidth
  size.value = w <= 480 ? Math.min(220, w - 40)
             : w <= 768 ? Math.min(280, w - 60)
             : 400
}

// Shader lerp
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const updateShaderTarget = () => {
  const now = performance.now()
  if (now < clickFlashUntil) {
    shaderTarget.value = { blur: 0, opacity: 1, brightness: 1.2 }
    return
  }
  if (!pointer.value.active) {
    shaderTarget.value = { blur: 0.5, opacity: 0.12, brightness: 0.5 }
    return
  }
  const rect = canvasRef.value!.getBoundingClientRect()
  const nx = Math.max(0, Math.min(1, pointer.value.x / rect.width))
  const ny = Math.max(0, Math.min(1, pointer.value.y / rect.height))
  shaderTarget.value = {
    blur:       nx * 18,
    opacity:    0.2 + (1 - ny) * 0.6,
    brightness: 0.75,
  }
}

// Draw
const drawBackground = (ctx: CanvasRenderingContext2D) => {
  if (!originalImage.value) return
  const { blur, opacity, brightness } = shaderCurrent.value
  ctx.save()
  ctx.filter = `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(3)})`
  ctx.globalAlpha = opacity
  const { x, y, width, height } = imageOffset.value
  ctx.drawImage(originalImage.value, x, y, width, height)
  ctx.restore()
}

const drawShape = (ctx: CanvasRenderingContext2D, p: Line) => {
  const s = p.length
  ctx.fillStyle   = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.currentAlpha})`
  ctx.strokeStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.currentAlpha})`

  switch (p.shape) {
    case 'line':
      ctx.lineWidth = size.value <= 280 ? 2.5 : 3.5
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + Math.cos(p.angle) * s, p.y + Math.sin(p.angle) * s)
      ctx.stroke()
      break

    case 'circle':
      ctx.beginPath()
      ctx.arc(p.x, p.y, s * 0.3, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'square':
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6)
      ctx.restore()
      break

    case 'triangle':
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.3)
      ctx.lineTo(s * 0.3, s * 0.3)
      ctx.lineTo(-s * 0.3, s * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      break

    case 'diamond':
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.3)
      ctx.lineTo(s * 0.3, 0)
      ctx.lineTo(0, s * 0.3)
      ctx.lineTo(-s * 0.3, 0)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      break

    case 'star':
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const sx = Math.cos(a) * (s / 2)
        const sy = Math.sin(a) * (s / 2)
        i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
      break
  }
}

const draw = () => {
  if (!isVisible) { animationId = null; return }
  animationId = requestAnimationFrame(draw)

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, size.value, size.value)
  if (!imageLoaded.value || !startTime.value) return

  updateShaderTarget()
  const t = 0.08
  shaderCurrent.value.blur       = lerp(shaderCurrent.value.blur,       shaderTarget.value.blur,       t)
  shaderCurrent.value.opacity    = lerp(shaderCurrent.value.opacity,    shaderTarget.value.opacity,    t)
  shaderCurrent.value.brightness = lerp(shaderCurrent.value.brightness, shaderTarget.value.brightness, t)

  drawBackground(ctx)

  if (performance.now() < clickFlashUntil) return

  const elapsed = (performance.now() - startTime.value) / 1000

  lines.value.forEach((p) => {
    const pt = elapsed - p.delay
    if (pt < 0) return

    const easedFade = 1 - Math.pow(1 - Math.min(pt / 1.5, 1), 2)
    p.currentAlpha = p.baseAlpha * easedFade

    const easedMove = 1 - Math.pow(1 - Math.min(pt / 2.5, 1), 3)
    const pull = 0.01 + easedMove * 0.07

    if (pointer.value.active) {
      const dx = p.x - pointer.value.x
      const dy = p.y - pointer.value.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 60 && dist > 0) {
        const force = (1 - dist / 60) * 2
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      }
    }

    p.vx += (p.targetX - p.x) * pull
    p.vy += (p.targetY - p.y) * pull
    p.vx *= 0.92
    p.vy *= 0.92
    p.x += p.vx
    p.y += p.vy

    drawShape(ctx, p)
  })
}

// Init
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width  = size.value
  canvas.height = size.value

  lines.value         = []
  imageLoaded.value   = false
  startTime.value     = null
  originalImage.value = null
  pixelData.value     = null

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = 'assets/images/profile.png'

  img.onload = () => {
    originalImage.value = img

    const off    = document.createElement('canvas')
    off.width    = size.value
    off.height   = size.value
    const offCtx = off.getContext('2d')
    if (!offCtx) return

    const scale  = 0.95
    const aspect = img.width / img.height
    let drawH    = size.value * scale
    let drawW    = drawH * aspect
    if (drawW > size.value * scale) { drawW = size.value * scale; drawH = drawW / aspect }

    const offsetX = (size.value - drawW) / 2
    const offsetY = (size.value - drawH) / 2
    imageOffset.value = { x: offsetX, y: offsetY, width: drawW, height: drawH }

    offCtx.drawImage(img, offsetX, offsetY, drawW, drawH)
    const imgData = offCtx.getImageData(0, 0, size.value, size.value)
    pixelData.value = imgData.data

    const sessionShape = getRandomShape()
    currentShape.value = sessionShape

    const newLines: Line[] = []  // ← restored
    const rowGap = size.value <= 280 ? 5 : 6

    for (let y = 0; y < size.value; y += rowGap) {
      let x = 0
      while (x < size.value) {
        const i = (y * size.value + x) * 4
        const a = imgData.data[i + 3]

        if (a > 128) {
          const r          = imgData.data[i]
          const g          = imgData.data[i + 1]
          const b          = imgData.data[i + 2]
          const brightness = (r + g + b) / (3 * 255)
          const lineLen    = Math.floor(3 + brightness * (size.value <= 280 ? 8 : 15))

          const mix = 0.55
          const lr  = Math.round(r * (1 - mix) + 100 * mix)
          const lg  = Math.round(g * (1 - mix) + 255 * mix)
          const lb  = Math.round(b * (1 - mix) + 218 * mix)

          const angle    = (Math.random() - 0.5) * (Math.PI / 15)
          const rotation = Math.random() * Math.PI * 2

          newLines.push({
            x:            x + (Math.random() - 0.5) * 300,
            y:            y + (Math.random() - 0.5) * 300,
            targetX:      x,
            targetY:      y,
            vx: 0, vy: 0,
            length:       lineLen,
            angle,
            r: lr, g: lg, b: lb,
            baseAlpha:    0.5 + brightness * 0.5,
            currentAlpha: 0,
            delay:        Math.random() * 0.3,
            shape:        sessionShape,
            rotation,
          })

          x += lineLen + 3
        } else {
          x += 4
        }
      }
    }

    lines.value       = newLines
    imageLoaded.value = true
    startTime.value   = performance.now()
  }
}

// Typing loop
let phraseIndex = 0
let charIndex   = 0
let deleting    = false

const tick = () => {
  const phrase = PHRASES[phraseIndex]

  if (!deleting) {
    displayedText.value = phrase.slice(0, charIndex + 1)
    charIndex++
    if (charIndex === phrase.length) {
      isBlinking.value = true
      typingTimeout = setTimeout(() => { isBlinking.value = false; deleting = true; tick() }, PAUSE_END)
      return
    }
    typingTimeout = setTimeout(tick, TYPE_SPEED)
  } else {
    displayedText.value = phrase.slice(0, charIndex - 1)
    charIndex--
    if (charIndex === 0) {
      deleting    = false
      phraseIndex = (phraseIndex + 1) % PHRASES.length
      typingTimeout = setTimeout(tick, PAUSE_START)
      return
    }
    typingTimeout = setTimeout(tick, DELETE_SPEED)
  }
}

const startTyping = () => {
  if (typingTimeout) clearTimeout(typingTimeout)
  displayedText.value = ''
  isBlinking.value    = false
  phraseIndex  = 0
  charIndex    = 0
  deleting     = false
  typingTimeout = setTimeout(tick, 600)
}

// Pointer
const getCanvasPos = (clientX: number, clientY: number) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return { x: -1000, y: -1000 }
  return { x: clientX - rect.left, y: clientY - rect.top }
}

const onPointerMove = (e: MouseEvent | TouchEvent) => {
  const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
  pointer.value = { ...getCanvasPos(clientX, clientY), active: true }
}

const onPointerLeave  = () => { pointer.value.active = false }
const onPointerClick  = () => { clickFlashUntil = performance.now() + 900 }

// Lifecycle
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

onMounted(() => {
  updateSize()
  initCanvas()

  resizeObserver = new ResizeObserver(() => { updateSize(); initCanvas() })
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value)

  intersectionObserver = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting) {
      isVisible = true
      if (!animationId) draw()
      startTyping()
      if (imageLoaded.value) {
        startTime.value = performance.now()
        lines.value.forEach(p => {
          p.x = p.targetX + (Math.random() - 0.5) * 300
          p.y = p.targetY + (Math.random() - 0.5) * 300
          p.vx = 0; p.vy = 0
          p.currentAlpha = 0
          p.delay = Math.random() * 0.3
        })
      }
    } else {
      isVisible = false
      if (typingTimeout) clearTimeout(typingTimeout)
    }
  }, { threshold: 0.1 })
  if (wrapperRef.value) intersectionObserver.observe(wrapperRef.value)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('mousemove',  onPointerMove)
    canvas.addEventListener('mouseleave', onPointerLeave)
    canvas.addEventListener('touchmove',  onPointerMove, { passive: true })
    canvas.addEventListener('touchend',   onPointerLeave)
    canvas.addEventListener('click',      onPointerClick)
  }

  startTyping()
  draw()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  if (animationId) cancelAnimationFrame(animationId)
  if (typingTimeout) clearTimeout(typingTimeout)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('mousemove',  onPointerMove)
    canvas.removeEventListener('mouseleave', onPointerLeave)
    canvas.removeEventListener('touchmove',  onPointerMove)
    canvas.removeEventListener('touchend',   onPointerLeave)
    canvas.removeEventListener('click',      onPointerClick)
  }
})
</script>

<style scoped>
.simulation-container {
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.portrait-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.typing-text {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
  min-height: 1.2em;
}

.typed-text {
  background: linear-gradient(
    135deg,
    var(--text-primary)     0%,
    var(--accent-primary)   50%,
    var(--accent-secondary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cursor {
  display: inline-block;
  width: 3px;
  height: 0.8em;
  background: var(--accent-primary);
  margin-left: 2px;
  vertical-align: middle;
  opacity: 1;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
</style>