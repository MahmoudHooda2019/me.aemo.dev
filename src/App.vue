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
          class="floating-badge badge-home-right-top"
          :class="{ expanded: isBadgeExpanded('right-top') }"
          @click="handleBadgeClick('right-top')"
        >
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #bb86fc20, #bb86fc40);">✨</div>
          <div>
            <div class="floating-badge-text">Interactive</div>
            <div class="floating-badge-subtext">Move cursor</div>
          </div>
        </div>
        <div 
          class="floating-badge badge-home-right-center"
          :class="{ expanded: isBadgeExpanded('right-center') }"
          @click="handleBadgeClick('right-center')"
        >
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #03dac620, #03dac640);">🎨</div>
          <div>
            <div class="floating-badge-text">Particles</div>
            <div class="floating-badge-subtext">Canvas</div>
          </div>
        </div>
        <div 
          class="floating-badge badge-home-right-bottom"
          :class="{ expanded: isBadgeExpanded('right-bottom') }"
          @click="handleBadgeClick('right-bottom')"
        >
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #ffd93d20, #ffd93d40);">🔮</div>
          <div>
            <div class="floating-badge-text">Shader</div>
            <div class="floating-badge-subtext">Dynamic</div>
          </div>
        </div>
        <div 
          class="floating-badge badge-home-left-top"
          :class="{ expanded: isBadgeExpanded('left-top') }"
          @click="handleBadgeClick('left-top')"
        >
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #ff6b6b20, #ff6b6b40);">🚀</div>
          <div>
            <div class="floating-badge-text">Vue 3</div>
            <div class="floating-badge-subtext">TypeScript</div>
          </div>
        </div>
        <div 
          class="floating-badge badge-home-left-center"
          :class="{ expanded: isBadgeExpanded('left-center') }"
          @click="handleBadgeClick('left-center')"
        >
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #4ecdc420, #4ecdc440);">⚡</div>
          <div>
            <div class="floating-badge-text">Fast</div>
            <div class="floating-badge-subtext">Optimized</div>
          </div>
        </div>
        <div 
          class="floating-badge badge-home-left-bottom"
          :class="{ expanded: isBadgeExpanded('left-bottom') }"
          @click="handleBadgeClick('left-bottom')"
        >
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #6bcf7f20, #6bcf7f40);">🔧</div>
          <div>
            <div class="floating-badge-text">Modern</div>
            <div class="floating-badge-subtext">Web Tech</div>
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

// Badge expansion state
const expandedBadges = ref<Set<string>>(new Set())
let badgeTimers: Map<string, number> = new Map()

const handleBadgeClick = (badgeClass: string) => {
  // Clear existing timer for this badge if any
  const existingTimer = badgeTimers.get(badgeClass)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }
  
  // Add expanded class
  expandedBadges.value.add(badgeClass)
  
  // Set timer to remove after 2 seconds
  const timer = window.setTimeout(() => {
    expandedBadges.value.delete(badgeClass)
    badgeTimers.delete(badgeClass)
  }, 2000)
  
  badgeTimers.set(badgeClass, timer)
}

const isBadgeExpanded = (badgeClass: string): boolean => {
  return expandedBadges.value.has(badgeClass)
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
  
  .badge-home-right-top,
  .badge-home-right-center,
  .badge-home-right-bottom {
    right: -80px;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  
  .badge-home-right-top.expanded,
  .badge-home-right-center.expanded,
  .badge-home-right-bottom.expanded {
    transform: translateX(-85px);
  }
  
  .badge-home-left-top,
  .badge-home-left-center,
  .badge-home-left-bottom {
    left: -80px;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  
  .badge-home-left-top.expanded,
  .badge-home-left-center.expanded,
  .badge-home-left-bottom.expanded {
    transform: translateX(85px);
  }
}
</style>
