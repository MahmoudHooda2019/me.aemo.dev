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
      <!-- Extensions Section -->
      <ExtensionsSection />
      
      <!-- Tools Section -->
      <ToolsSection />
      
      <!-- Contact Section -->
      <ContactSection />
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

const isLoading = ref(true)

onMounted(() => {
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
</style>
