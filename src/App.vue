<template>
  <div id="app">
    <!-- Loading Screen -->
    <LoadingScreen v-if="isLoading" />
    
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main>
      <!-- Particle Portrait Hero -->
      <section class="particle-section section-wrapper relative">
        <div class="grid-pattern"></div>
        <div class="particle-container">
          <ParticlePortrait />
        </div>
        <div 
          v-for="badge in badges"
          :key="badge.id"
          class="floating-badge"
          :class="[badge.cssClass, { expanded: isBadgeExpanded(badge.id) }]"
          @click="handleBadgeClick(badge.id)"
          :data-badge-id="badge.id"
        >
          <div class="floating-badge-icon" :style="{ background: badge.gradient }">{{ badge.icon }}</div>
          <div>
            <div class="floating-badge-text">{{ badge.text }}</div>
            <div class="floating-badge-subtext">{{ badge.subtext }}</div>
          </div>
        </div>
      </section>
      
      <!-- Extensions Section -->
      <div class="section-wrapper relative">
        <div class="grid-pattern"></div>
        <ExtensionsSection />
      </div>
      
      <!-- Tools Section -->
      <div class="section-wrapper relative">
        <div class="grid-pattern"></div>
        <ToolsSection />
      </div>
    </main>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import AppHeader from '@/components/AppHeader.vue'
import ParticlePortrait from '@/components/ParticlePortrait.vue'
import ExtensionsSection from '@/components/ExtensionsSection.vue'
import ToolsSection from '@/components/ToolsSection.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import { useTheme } from '@/composables/useTheme'

const isLoading = ref(true)
const { initTheme } = useTheme()

// Badge data
const badges = [
  { id: 'right-top', cssClass: 'badge-home-right-top', icon: '✨', text: 'Interactive', subtext: 'Move cursor', gradient: 'linear-gradient(135deg, #bb86fc20, #bb86fc40)' },
  { id: 'right-center', cssClass: 'badge-home-right-center', icon: '🎨', text: 'Particles', subtext: 'Canvas', gradient: 'linear-gradient(135deg, #03dac620, #03dac640)' },
  { id: 'right-bottom', cssClass: 'badge-home-right-bottom', icon: '🔮', text: 'Shader', subtext: 'Dynamic', gradient: 'linear-gradient(135deg, #ffd93d20, #ffd93d40)' },
  { id: 'left-top', cssClass: 'badge-home-left-top', icon: '🚀', text: 'Vue 3', subtext: 'TypeScript', gradient: 'linear-gradient(135deg, #ff6b6b20, #ff6b6b40)' },
  { id: 'left-center', cssClass: 'badge-home-left-center', icon: '⚡', text: 'Fast', subtext: 'Optimized', gradient: 'linear-gradient(135deg, #4ecdc420, #4ecdc440)' },
  { id: 'left-bottom', cssClass: 'badge-home-left-bottom', icon: '🔧', text: 'Modern', subtext: 'Web Tech', gradient: 'linear-gradient(135deg, #6bcf7f20, #6bcf7f40)' },
]

// Badge expansion state
const expandedBadges = ref<Set<string>>(new Set())
let badgeTimers: Map<string, number> = new Map()

const handleBadgeClick = (badgeId: string) => {
  // Clear existing timer for this badge if any
  const existingTimer = badgeTimers.get(badgeId)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }
  
  // Add expanded class
  expandedBadges.value.add(badgeId)
  
  // Set timer to remove after 2 seconds
  const timer = window.setTimeout(() => {
    expandedBadges.value.delete(badgeId)
    badgeTimers.delete(badgeId)
  }, 2000)
  
  badgeTimers.set(badgeId, timer)
}

const isBadgeExpanded = (badgeId: string): boolean => {
  return expandedBadges.value.has(badgeId)
}

onMounted(() => {
  // Apply saved/preferred theme before first render to avoid flash
  initTheme()
  
  // Initialize intersection observer for lazy loading
  const { observeElements } = useIntersectionObserver()
  
  setTimeout(() => {
    observeElements('.section')
  }, 100)
  
  // Hide loading screen after a short delay
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.particle-section {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 2rem;
}

.particle-section .grid-pattern {
  z-index: 0;
}

.particle-section > *:not(.grid-pattern):not(.floating-badge) {
  position: relative;
  z-index: 1;
}

.particle-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-home-right-top {
  right: calc(50% - 300px);
  top: calc(50% - 220px);
  transform: translate(20%, 20%);
}

.badge-home-right-top:hover {
  transform: translate(0, 0);
}

.badge-home-right-center {
  right: calc(50% - 360px);
  top: 50%;
  transform: translate(20%, -50%);
}

.badge-home-right-center:hover {
  transform: translate(0, -50%);
}

.badge-home-right-bottom {
  right: calc(50% - 400px);
  bottom: calc(50% - 300px);
  transform: translate(20%, -20%);
}

.badge-home-right-bottom:hover {
  transform: translate(0, 0);
}

.badge-home-left-top {
  left: calc(50% - 500px);
  top: calc(50% - 200px);
  transform: translate(-20%, 20%);
}

.badge-home-left-top:hover {
  transform: translate(0, 0);
}

.badge-home-left-center {
  left: calc(50% - 510px);
  top: 50%;
  transform: translate(-20%, -50%);
}

.badge-home-left-center:hover {
  transform: translate(0, -50%);
}

.badge-home-left-bottom {
  left: calc(50% - 550px);
  bottom: calc(50% - 280px);
  transform: translate(-20%, -20%);
}

.badge-home-left-bottom:hover {
  transform: translate(0, 0);
}

@media (max-width: 1100px) {
  .badge-home-right-top,
  .badge-home-right-center,
  .badge-home-right-bottom {
    right: 2%;
  }
  
  .badge-home-left-top,
  .badge-home-left-center,
  .badge-home-left-bottom {
    left: 2%;
  }
}

.section-wrapper {
  position: relative;
  overflow: hidden;
}

.section-wrapper .grid-pattern {
  z-index: 0;
}

.section-wrapper > *:not(.grid-pattern):not(.floating-badge) {
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .particle-section {
    min-height: calc(100vh - 80px);
    padding: 1rem;
  }
  
  /* Only show floating badges in home section */
  .section-wrapper .floating-badge {
    display: none !important;
  }
  
  .particle-section .floating-badge {
    position: absolute !important;
    z-index: 9999 !important;
    display: flex !important;
    opacity: 1 !important;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .badge-home-right-top,
  .badge-home-right-center,
  .badge-home-right-bottom {
    right: -130px !important;
    transform: translateX(0) !important;
  }
  
  .badge-home-right-top.expanded,
  .badge-home-right-center.expanded,
  .badge-home-right-bottom.expanded {
    transform: translateX(-115px) !important;
  }
  
  .badge-home-left-top,
  .badge-home-left-center,
  .badge-home-left-bottom {
    left: -130px !important;
    transform: translateX(0) !important;
  }
  
  .badge-home-left-top.expanded,
  .badge-home-left-center.expanded,
  .badge-home-left-bottom.expanded {
    transform: translateX(115px) !important;
  }
  
  .badge-home-right-top { top: 20% !important; }
  .badge-home-right-center { top: 50% !important; }
  .badge-home-right-bottom { top: 80% !important; }
  .badge-home-left-top { top: 20% !important; }
  .badge-home-left-center { top: 50% !important; }
  .badge-home-left-bottom { top: 80% !important; }
}
</style>
