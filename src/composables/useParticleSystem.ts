import { ref, onMounted, onUnmounted } from 'vue'

interface Position {
  x: number
  y: number
}

export const useParticleSystem = () => {
  const isActive = ref(true)
  const particles = ref<Set<HTMLDivElement>>(new Set())

  const getRandomPosition = (): Position => ({
    x: Math.random() * 100,
    y: Math.random() * 100
  })

  const createParticle = (): void => {
    try {
      const particle = document.createElement('div')
      const { x, y } = getRandomPosition()
      
      Object.assign(particle.style, {
        position: 'absolute',
        width: '2px',
        height: '2px',
        background: '#00ffcc',
        left: `${x}%`,
        top: `${y}%`,
        opacity: Math.random().toString(),
        transition: 'all 3000ms ease',
        transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`
      })

      const container = document.querySelector('.particles')
      if (container) {
        container.appendChild(particle)
        particles.value.add(particle)

        setTimeout(() => {
          particle.style.opacity = '0'
          setTimeout(() => {
            particles.value.delete(particle)
            particle.remove()
          }, 3000)
        }, 100)
      }
    } catch (error) {
      console.error('Error creating particle:', error)
    }
  }

  const clearParticles = (): void => {
    particles.value.forEach(particle => particle.remove())
    particles.value.clear()
  }

  const startParticleGeneration = (): void => {
    setInterval(() => {
      if (isActive.value && document.visibilityState === 'visible') {
        createParticle()
      }
    }, 100)
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', () => {
      isActive.value = !document.hidden
      if (!isActive.value) clearParticles()
    })

    startParticleGeneration()
  })

  onUnmounted(() => {
    clearParticles()
  })

  return {
    isActive,
    particles
  }
}
