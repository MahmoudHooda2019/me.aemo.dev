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
        <div class="floating-badge badge-home-right-top">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #bb86fc20, #bb86fc40);">✨</div>
          <div>
            <div class="floating-badge-text">Interactive</div>
            <div class="floating-badge-subtext">Move cursor</div>
          </div>
        </div>
        <div class="floating-badge badge-home-right-center">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #03dac620, #03dac640);">🎨</div>
          <div>
            <div class="floating-badge-text">Particles</div>
            <div class="floating-badge-subtext">Canvas</div>
          </div>
        </div>
        <div class="floating-badge badge-home-right-bottom">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #ffd93d20, #ffd93d40);">🔮</div>
          <div>
            <div class="floating-badge-text">Shader</div>
            <div class="floating-badge-subtext">Dynamic</div>
          </div>
        </div>
        <div class="floating-badge badge-home-left-top">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #ff6b6b20, #ff6b6b40);">🚀</div>
          <div>
            <div class="floating-badge-text">Vue 3</div>
            <div class="floating-badge-subtext">TypeScript</div>
          </div>
        </div>
        <div class="floating-badge badge-home-left-center">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #4ecdc420, #4ecdc440);">⚡</div>
          <div>
            <div class="floating-badge-text">Fast</div>
            <div class="floating-badge-subtext">Optimized</div>
          </div>
        </div>
        <div class="floating-badge badge-home-left-bottom">
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

.badge-extensions {
  right: -4px;
  top: 25%;
}

.badge-left {
  left: -4px;
  bottom: 25%;
  transform: translateX(-5%);
}

.badge-left:hover {
  transform: translateX(0);
}

.badge-tools {
  right: -4px;
  top: 30%;
}

.badge-left-tools {
  left: -4px;
  top: 25%;
  transform: translateX(-5%);
}

.badge-left-tools:hover {
  transform: translateX(0);
}

.badge-right-middle {
  right: -4px;
  top: 60%;
  transform: translateX(5%);
}

.badge-right-middle:hover {
  transform: translateX(0);
}

.badge-center-right {
  right: 15%;
  top: 45%;
  transform: translateX(10%);
}

.badge-center-right:hover {
  transform: translateX(0);
}

.badge-center-left {
  left: 15%;
  top: 40%;
  transform: translateX(-10%);
}

.badge-center-left:hover {
  transform: translateX(0);
}

@media (max-width: 768px) {
  .particle-section {
    min-height: calc(100vh - 80px);
    padding: 1rem;
  }
  
  .badge-home-right-top,
  .badge-home-right-center,
  .badge-home-right-bottom,
  .badge-home-left-top,
  .badge-home-left-center,
  .badge-home-left-bottom {
    display: none;
  }
}
</style>
