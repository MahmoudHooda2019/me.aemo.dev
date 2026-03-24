<template>
  <div class="portrait-wrapper">
    <canvas
      ref="canvasRef"
      class="simulation-container"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        cursor: 'crosshair',
      }"
    />
    <h1 class="profile-name">Mahmoud Hussien</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Line {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  length: number
  baseAlpha: number
  currentAlpha: number
  delay: number
}

interface Mouse {
  x: number
  y: number
  active: boolean
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const mouse = ref<Mouse>({ x: -1000, y: -1000, active: false })
const lines = ref<Line[]>([])
const imageLoaded = ref(false)
const startTime = ref<number | null>(null)
const size = ref(400)
const originalImage = ref<HTMLImageElement | null>(null)
const imageOffset = ref({ x: 0, y: 0, width: 0, height: 0 })
const isBlurDisabled = ref(false)
let animationId: number | null = null

const updateSize = () => {
  const width = window.innerWidth
  if (width <= 480) {
    size.value = Math.min(220, width - 40)
  } else if (width <= 768) {
    size.value = Math.min(280, width - 60)
  } else {
    size.value = 400
  }
}

const handleResize = () => {
  updateSize()
  initCanvas()
}

const getShaderIntensity = () => {
  if (isBlurDisabled.value) return { blur: 0, opacity: 1, brightness: 1.2 }
  if (!mouse.value.active) return { blur: 0.5, opacity: 0.12, brightness: 0.5 }
  
  const canvas = canvasRef.value
  if (!canvas) return { blur: 0.5, opacity: 0.5, brightness: 0.5 }
  
  const rect = canvas.getBoundingClientRect()
  const normalizedX = Math.max(0, Math.min(1, mouse.value.x / rect.width))
  const normalizedY = Math.max(0, Math.min(1, mouse.value.y / rect.height))
  
  return {
    blur: normalizedX * 20,
    opacity: 0.2 + (1 - normalizedY) * 0.6,
    brightness: 0.75
  }
}

const drawBackground = (ctx: CanvasRenderingContext2D) => {
  if (!originalImage.value) return
  
  const { blur, opacity, brightness } = getShaderIntensity()
  
  ctx.save()
  
  ctx.filter = `blur(${blur}px) brightness(${brightness})`
  ctx.globalAlpha = opacity
  
  ctx.drawImage(
    originalImage.value,
    imageOffset.value.x,
    imageOffset.value.y,
    imageOffset.value.width,
    imageOffset.value.height
  )
  
  ctx.restore()
}

const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = size.value
  canvas.height = size.value

  lines.value = []
  imageLoaded.value = false
  startTime.value = null
  originalImage.value = null

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = 'assets/images/profile.png'

  img.onload = () => {
    originalImage.value = img
    
    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    offscreen.width = size.value
    offscreen.height = size.value

    const scale = 0.95
    const imgAspect = img.width / img.height

    let drawHeight = size.value * scale
    let drawWidth = drawHeight * imgAspect

    if (drawWidth > size.value * scale) {
      drawWidth = size.value * scale
      drawHeight = drawWidth / imgAspect
    }

    const offsetX = (size.value - drawWidth) / 2
    const offsetY = (size.value - drawHeight) / 2
    
    imageOffset.value = { x: offsetX, y: offsetY, width: drawWidth, height: drawHeight }

    offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
    const imageData = offCtx.getImageData(0, 0, size.value, size.value)
    const pixels = imageData.data

    const newLines: Line[] = []
    const rowGap = size.value <= 280 ? 5 : 6

    for (let y = 0; y < size.value; y += rowGap) {
      let x = 0
      while (x < size.value) {
        const i = (y * size.value + x) * 4
        const a = pixels[i + 3]

        if (a > 128) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const brightness = (r + g + b) / (3 * 255)

          const lineLength = Math.floor(3 + brightness * (size.value <= 280 ? 8 : 15))

          const scatterX = (Math.random() - 0.5) * 300
          const scatterY = (Math.random() - 0.5) * 300

          newLines.push({
            x: x + scatterX,
            y: y + scatterY,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            length: lineLength,
            baseAlpha: 0.5 + brightness * 0.5,
            currentAlpha: 0,
            delay: Math.random() * 0.3,
          })

          x += lineLength + 3
        } else {
          x += 4
        }
      }
    }

    lines.value = newLines
    imageLoaded.value = true
    startTime.value = performance.now()
  }
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  animationId = requestAnimationFrame(draw)

  ctx.clearRect(0, 0, size.value, size.value)

  if (!imageLoaded.value || !startTime.value) return

  drawBackground(ctx)

  if (isBlurDisabled.value) return

  const elapsed = (performance.now() - startTime.value) / 1000

  lines.value.forEach((p) => {
    const particleTime = elapsed - p.delay

    if (particleTime < 0) return

    const fadeProgress = Math.min(particleTime / 1.5, 1)
    const easedFade = 1 - Math.pow(1 - fadeProgress, 2)
    p.currentAlpha = p.baseAlpha * easedFade

    const moveProgress = Math.min(particleTime / 2.5, 1)
    const easedMove = 1 - Math.pow(1 - moveProgress, 3)

    if (mouse.value.active) {
      const dx = p.x - mouse.value.x
      const dy = p.y - mouse.value.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = 60

      if (dist < maxDist && dist > 0) {
        const force = (1 - dist / maxDist) * 2
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      }
    }

    const dx = p.targetX - p.x
    const dy = p.targetY - p.y

    const pullStrength = 0.01 + easedMove * 0.07
    p.vx += dx * pullStrength
    p.vy += dy * pullStrength

    p.vx *= 0.92
    p.vy *= 0.92

    p.x += p.vx
    p.y += p.vy

    ctx.strokeStyle = `rgba(100, 255, 218, ${p.currentAlpha})`
    ctx.lineWidth = size.value <= 280 ? 2.5 : 3.5
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x + p.length, p.y)
    ctx.stroke()
  })
}

const handleMouseMove = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouse.value.x = e.clientX - rect.left
  mouse.value.y = e.clientY - rect.top
  mouse.value.active = true
}

const handleTouchMove = (e: TouchEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  mouse.value.x = touch.clientX - rect.left
  mouse.value.y = touch.clientY - rect.top
  mouse.value.active = true
}

const handleLeave = () => {
  mouse.value.active = false
}

const handleClick = () => {
  isBlurDisabled.value = true
  setTimeout(() => {
    isBlurDisabled.value = false
  }, 1000)
}

onMounted(() => {
  updateSize()
  initCanvas()
  window.addEventListener('resize', handleResize)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.addEventListener('touchend', handleLeave)
    canvas.addEventListener('click', handleClick)
  }

  draw()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId) cancelAnimationFrame(animationId)

  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseleave', handleLeave)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleLeave)
    canvas.removeEventListener('click', handleClick)
  }
})

watch(size, () => {
  initCanvas()
})
</script>

<style scoped>
.simulation-container {
  display: block;
}

.portrait-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.profile-name {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 50%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
