<template>
  <div id="app">
    <!-- Particles Background -->
    <Particles />
    
    <!-- Loading Screen -->
    <LoadingScreen v-if="isLoading" />
    
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main>
      <!-- Extensions Section with Grid Pattern and Floating Badges -->
      <div class="section-wrapper relative">
        <div class="grid-pattern"></div>
        <ExtensionsSection />
        <!-- Floating Badge for Extensions -->
        <div class="floating-badge badge-extensions">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #bb86fc20, #bb86fc40);">📦</div>
          <div>
            <div class="floating-badge-text">50+ Extensions</div>
            <div class="floating-badge-subtext">Ready to use</div>
          </div>
        </div>
      </div>
      
      <!-- Tools Section with Grid Pattern and Floating Badges -->
      <div class="section-wrapper relative">
        <div class="grid-pattern"></div>
        <ToolsSection />
        <!-- Floating Badge for Tools -->
        <div class="floating-badge badge-tools" style="top: 20%;">
          <div class="floating-badge-icon" style="background: linear-gradient(135deg, #03dac620, #03dac640);">🛠️</div>
          <div>
            <div class="floating-badge-text">Free Tools</div>
            <div class="floating-badge-subtext">Open source</div>
          </div>
        </div>
      </div>
      
      <!-- Contact Section with Grid Pattern -->
      <div class="section-wrapper relative">
        <div class="grid-pattern"></div>
        <ContactSection />
      </div>
    </main>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Particles from '@/components/Particles.vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import AppHeader from '@/components/AppHeader.vue'
import ExtensionsSection from '@/components/ExtensionsSection.vue'
import ToolsSection from '@/components/ToolsSection.vue'
import ContactSection from '@/components/ContactSection.vue'
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
  
  // Wait for next tick to ensure DOM is ready
  setTimeout(() => {
    observeElements('.section')
  }, 100)
  
  // Hide loading screen after images load
  const images = document.querySelectorAll('img')
  let loadedImages = 0
  
  if (images.length === 0) {
    setTimeout(() => {
      isLoading.value = false
    }, 1000)
    return
  }
  
  const checkLoadingComplete = () => {
    if (loadedImages === images.length) {
      setTimeout(() => {
        isLoading.value = false
      }, 1000)
    }
  }
  
  images.forEach(img => {
    if (img.complete) {
      loadedImages++
      checkLoadingComplete()
    } else {
      img.addEventListener('load', () => {
        loadedImages++
        checkLoadingComplete()
      })
    }
  })
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

.badge-tools {
  right: -4px;
  top: 30%;
}

@media (max-width: 1024px) {
  .badge-extensions,
  .badge-tools {
    display: none;
  }
}
</style>
