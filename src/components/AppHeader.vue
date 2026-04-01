<template>
  <header>
    <!-- Desktop Navigation -->
    <NavIsland
      :active-section="activeSection"
      @update:active-section="activeSection = $event"
      @scroll-to="scrollTo"
    />

    <!-- Theme Toggle -->
    <ThemeToggle @toggle="onThemeToggle" />

    <!-- Mobile Navigation -->
    <MobileNav
      :active-section="activeSection"
      @update:active-section="activeSection = $event"
      @scroll-to="scrollTo"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavIsland from './NavIsland.vue'
import MobileNav from './MobileNav.vue'
import ThemeToggle from './ThemeToggle.vue'

const activeSection = ref<'home' | 'tools' | 'extensions'>('home')

const scrollTo = (id: string) => {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onThemeToggle = () => {
  // Theme toggle handled by useTheme composable inside ThemeToggle
}

// Update active section based on scroll position
const handleScroll = () => {
  const sections = ['tools', 'extensions'] as const
  let found = false
  for (const id of sections) {
    const rect = document.getElementById(id)?.getBoundingClientRect()
    if (rect && rect.top <= 150 && rect.bottom > 150) {
      activeSection.value = id
      found = true
      break
    }
  }
  if (!found && window.scrollY < 100) {
    activeSection.value = 'home'
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
header {
  position: relative;
  z-index: 2000;
}
</style>

<style>
/* Global CSS variables — must be unscoped so :root and [data-theme] on <html>
   are reachable. Scoped styles cannot pierce outside the component boundary.
*/
:root {
  --accent-primary:   #6ee7b7;
  --accent-secondary: #7c3aed;
  --shadow-color:     rgba(110, 231, 183, 0.4);
  --shadow-color-alt: rgba(124,  58, 237, 0.4);

  --notch-bg:         rgba(  8,   8,  12, 0.95);
  --notch-border:     rgba(255, 255, 255, 0.15);
  --notch-shadow:     0 2px 20px rgba(0, 0, 0, 0.6);

  --nav-bg:           rgba( 13,  13,  20, 0.85);
  --nav-bg-mobile:    rgba( 18,  18,  26, 0.92);
  --nav-bg-scrolled:  rgba(  9,   9,  16, 0.96);

  --text-primary:     rgba(255, 255, 255, 0.95);
  --text-secondary:   rgba(255, 255, 255, 0.60);
  --text-muted:       rgba(255, 255, 255, 0.40);
  --border-color:     rgba(255, 255, 255, 0.10);
  --backdrop-bg:      rgba(  0,   0,   0, 0.45);

  --notch-camera-bg:  #111118;
  --notch-speaker-bg: #111118;
}

[data-theme='light'] {
  --accent-primary:   #059669;
  --accent-secondary: #7c3aed;
  --shadow-color:     rgba(  5, 150, 105, 0.35);
  --shadow-color-alt: rgba(124,  58, 237, 0.35);

  --notch-bg:         rgba(240, 240, 245, 0.98);
  --notch-border:     rgba(  0,   0,   0, 0.15);
  --notch-shadow:     0 2px 20px rgba(0, 0, 0, 0.12);

  --nav-bg:           rgba(255, 255, 255, 0.90);
  --nav-bg-mobile:    rgba(255, 255, 255, 0.96);
  --nav-bg-scrolled:  rgba(255, 255, 255, 0.98);

  --text-primary:     rgba(  0,   0,   0, 0.90);
  --text-secondary:   rgba(  0,   0,   0, 0.60);
  --text-muted:       rgba(  0,   0,   0, 0.35);
  --border-color:     rgba(  0,   0,   0, 0.10);
  --backdrop-bg:      rgba(  0,   0,   0, 0.30);

  --notch-camera-bg:  #e0e0e8;
  --notch-speaker-bg: #e0e0e8;
}
</style>
