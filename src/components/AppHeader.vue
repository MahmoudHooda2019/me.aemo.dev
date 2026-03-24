<template>
  <header>
    <!-- Morphing Notch-to-Navbar -->
    <div 
      class="nav-morph" 
      :class="{ 
        'is-notch': isHidden && !isScrolled && !isExpanding,
        'is-navbar': !isHidden || isScrolled || isExpanding,
        expanding: isExpanding,
        scrolled: isScrolled
      }"
      @mouseenter="onNavMorphEnter"
      @mouseleave="onNavMorphLeave"
    >
      <!-- Notch State -->
      <div class="morph-notch-content" v-if="isHidden && !isScrolled && !isExpanding">
        <div class="morph-camera"></div>
        <div class="morph-speaker"></div>
      </div>
      
      <!-- Navbar State -->
      <div class="morph-nav-content" v-else>
        <button 
          class="morph-btn" 
          :class="{ active: activeSection === 'tools' }"
          @click="scrollTo('tools')"
        >
          <span class="morph-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span class="morph-text">Tools</span>
        </button>
        
        <button 
          class="morph-btn home-btn" 
          :class="{ active: activeSection === 'home' }"
          @click="scrollTo('top')"
        >
          <span class="morph-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="morph-text">Home</span>
        </button>
        
        <button 
          class="morph-btn" 
          :class="{ active: activeSection === 'extensions' }"
          @click="scrollTo('extensions')"
        >
          <span class="morph-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </span>
          <span class="morph-text">Extensions</span>
        </button>
      </div>
    </div>

    <!-- Floating Theme Toggle (separate from navbar) -->
    <button
      class="theme-toggle-float"
      :class="{ 'theme-changing': isThemeChanging }"
      @click="handleThemeToggle"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <span class="theme-icon-wrapper" :class="{ 'theme-changing': isThemeChanging }">
        <span class="theme-icon" :class="{ 'theme-changing': isThemeChanging }">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
      </span>
      <span class="theme-pulse"></span>
    </button>

    <!-- Mobile Menu Toggle -->
    <button 
      class="mobile-menu-toggle" 
      :class="{ open: menuOpen }" 
      @click="menuOpen = !menuOpen"
      aria-label="Toggle navigation menu"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Mobile Dropdown Menu -->
    <div class="nav-mobile" :class="{ open: menuOpen }">
      <a href="#tools" @click.prevent="mobileNav('tools')">🛠️ Tools</a>
      <a href="#top" @click.prevent="mobileNav('top')">🏠 Home</a>
      <a href="#extensions" @click.prevent="mobileNav('extensions')">📦 Extensions</a>
    </div>

    <!-- Splash Section -->
    <section class="splash-section">
      <div class="grid-pattern"></div>
      <div class="splash-container">
        <div class="logo" role="banner" aria-label="Aemo Developer Logo">Aemo Developer</div>
        <div class="tagline" aria-live="polite">
          <p class="tagline-text">MIT App Inventor Extensions & Developer Tools</p>
          <p class="tagline-sub">Build better apps with powerful components</p>
        </div>
        <div class="scroll-hint" @click="scrollTo('extensions')" aria-label="Scroll to extensions">
          <span>Explore</span>
          <div class="scroll-arrow">↓</div>
        </div>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const isScrolled = ref(false)
const isHidden = ref(false)
const isMouseNear = ref(false)
const menuOpen = ref(false)
const hideTimer = ref<number | null>(null)
const isThemeChanging = ref(false)
const activeSection = ref('home')
const isExpanding = ref(false)
const isCollapsing = ref(false)
const expandTimer = ref<number | null>(null)
const collapseTimer = ref<number | null>(null)
const { theme, toggleTheme } = useTheme()

const HIDE_DELAY = 2000 // 2 seconds

const handleScroll = () => {
  const scrollY = window.scrollY
  isScrolled.value = scrollY > 80
  
  // Determine active section based on scroll position
  const toolsSection = document.getElementById('tools')
  const extensionsSection = document.getElementById('extensions')
  
  if (scrollY < 100) {
    activeSection.value = 'home'
  } else if (extensionsSection) {
    const extRect = extensionsSection.getBoundingClientRect()
    if (extRect.top <= 150 && extRect.bottom > 150) {
      activeSection.value = 'extensions'
    }
  }
  
  if (toolsSection) {
    const toolsRect = toolsSection.getBoundingClientRect()
    if (toolsRect.top <= 150 && toolsRect.bottom > 150) {
      activeSection.value = 'tools'
    }
  }
}

const onNavMorphEnter = () => {
  isMouseNear.value = true
  isHidden.value = false
  
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
  if (collapseTimer.value) {
    clearTimeout(collapseTimer.value)
    collapseTimer.value = null
  }
  
  isCollapsing.value = false
  isExpanding.value = true
  
  if (expandTimer.value) clearTimeout(expandTimer.value)
  expandTimer.value = window.setTimeout(() => {
    isExpanding.value = false
  }, 600)
}

const onNavMorphLeave = () => {
  isMouseNear.value = false
  if (!isScrolled.value) {
    hideTimer.value = window.setTimeout(() => {
      isExpanding.value = false
      isCollapsing.value = true
      isHidden.value = true
      
      if (collapseTimer.value) clearTimeout(collapseTimer.value)
      collapseTimer.value = window.setTimeout(() => {
        isCollapsing.value = false
      }, 600)
    }, HIDE_DELAY)
  }
}

const handleMouseMove = (e: MouseEvent) => {
  const navMorph = document.querySelector('.nav-morph') as HTMLElement
  if (!navMorph) return
  
  const rect = navMorph.getBoundingClientRect()
  const threshold = 120
  
  const isNear = e.clientY < rect.bottom + threshold && 
                 e.clientX > rect.left - threshold && 
                 e.clientX < rect.right + threshold
  
  if (isNear && isHidden.value && !isScrolled.value) {
    onNavMorphEnter()
  } else if (!isNear && !isHidden.value && !isMouseNear.value && !isScrolled.value) {
    if (!hideTimer.value) {
      hideTimer.value = window.setTimeout(() => {
        isCollapsing.value = true
        isExpanding.value = false
        isHidden.value = true
        
        if (collapseTimer.value) clearTimeout(collapseTimer.value)
        collapseTimer.value = window.setTimeout(() => {
          isCollapsing.value = false
        }, 600)
      }, HIDE_DELAY)
    }
  }
}

const handleThemeToggle = () => {
  isThemeChanging.value = true
  toggleTheme()
  // Reset animation flag after animation completes
  setTimeout(() => {
    isThemeChanging.value = false
  }, 800)
}

const scrollTo = (id: string) => {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const mobileNav = (id: string) => {
  menuOpen.value = false
  scrollTo(id)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  
  // Auto-hide after initial load
  setTimeout(() => {
    if (!isMouseNear.value) {
      isHidden.value = true
    }
  }, 3000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
  }
})
</script>

<style scoped>
/* ===== Unified Morphing Notch-to-Navbar Component ===== */
.nav-morph {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* NOTCH STATE */
.nav-morph.is-notch {
  top: 0;
  width: 120px;
  height: 32px;
  padding: 8px 16px;
  background: var(--notch-bg);
  border-radius: 0 0 24px 24px;
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
  pointer-events: auto;
  box-shadow: var(--notch-shadow);
}

.nav-morph.is-notch:hover {
  background: var(--notch-bg-hover);
  box-shadow: 0 6px 40px var(--shadow-color), inset 0 -1px 0 rgba(255, 255, 255, 0.15);
}

/* Notch Content */
.morph-notch-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.morph-camera {
  width: 10px;
  height: 10px;
  background: var(--notch-camera-bg);
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
}

.morph-speaker {
  width: 50px;
  height: 5px;
  background: var(--notch-speaker-bg);
  border-radius: 3px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* NAVBAR STATE */
.nav-morph.is-navbar {
  top: 12px;
  min-width: 320px;
  max-width: 90vw;
  padding: 0.6rem 0.8rem;
  background: var(--nav-bg);
  border: 2px solid var(--border-color);
  border-radius: 50px;
  opacity: 1;
  transform: translateX(-50%) scale(1) translateY(0);
  pointer-events: auto;
  gap: 0.5rem;
}

.nav-morph.is-navbar.scrolled {
  background: var(--nav-bg-scrolled);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(187, 134, 252, 0.15);
}

/* EXPANDING ANIMATION - Notch grows into navbar */
.nav-morph.expanding.is-navbar {
  animation: morphExpand 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes morphExpand {
  0% {
    width: 120px;
    height: 32px;
    padding: 8px 16px;
    background: var(--notch-bg);
    border-radius: 0 0 24px 24px;
    box-shadow: var(--notch-shadow);
    opacity: 0.9;
  }
  30% {
    width: 160px;
    height: 36px;
    padding: 10px 18px;
    border-radius: 18px;
    opacity: 0.95;
  }
  60% {
    width: 260px;
    height: 48px;
    padding: 12px 24px;
    border-radius: 30px;
    opacity: 0.98;
  }
  100% {
    min-width: 320px;
    padding: 0.6rem 0.8rem;
    background: var(--nav-bg);
    border-radius: 50px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border-color);
    opacity: 1;
  }
}

/* Navbar Content */
.morph-nav-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  animation: fadeInNavContent 0.5s ease 0.25s both;
}

@keyframes fadeInNavContent {
  from { opacity: 0; transform: scale(0.95) translateY(-5px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* Morph Buttons */
.morph-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 50px;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0.9);
}

.morph-btn:hover {
  border-color: rgba(187, 134, 252, 0.3);
  color: var(--text-primary);
  transform: scale(0.95);
  background: rgba(187, 134, 252, 0.05);
}

.morph-btn.active {
  background: linear-gradient(145deg, rgba(187, 134, 252, 0.2) 0%, rgba(3, 218, 198, 0.1) 100%);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: scale(1.05);
  padding: 0.55rem 1.1rem;
  box-shadow: 0 8px 25px rgba(187, 134, 252, 0.25);
}

.morph-btn.active .morph-icon {
  transform: scale(1.1);
}

.morph-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.morph-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.morph-text {
  letter-spacing: 0.3px;
}

/* Home button emphasis */
.home-btn {
  background: linear-gradient(145deg, rgba(187, 134, 252, 0.1) 0%, rgba(3, 218, 198, 0.05) 100%);
  border-color: rgba(187, 134, 252, 0.2);
}

.home-btn:hover {
  border-color: rgba(187, 134, 252, 0.4);
  background: linear-gradient(145deg, rgba(187, 134, 252, 0.15) 0%, rgba(3, 218, 198, 0.1) 100%);
}

/* ===== Floating Theme Toggle (separate from navbar) ===== */
.theme-toggle-float {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px solid rgba(187, 134, 252, 0.3);
  background: var(--nav-bg);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  overflow: visible;
}

.theme-toggle-float:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 8px 35px rgba(187, 134, 252, 0.4), 0 0 0 3px rgba(187, 134, 252, 0.1);
  transform: scale(1.12);
}

.theme-toggle-float.theme-changing {
  animation: themeChangeSpin 0.8s ease-in-out;
}

.theme-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease;
}

.theme-icon-wrapper.theme-changing {
  animation: iconFlip 0.8s ease-in-out;
}

.theme-icon {
  font-size: 1.4rem;
  line-height: 1;
  display: block;
  transition: all 0.3s ease;
}

.theme-icon.theme-changing {
  animation: iconMorph 0.8s ease-in-out;
}

.theme-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  pointer-events: none;
}

.theme-toggle-float.theme-changing .theme-pulse {
  animation: themePulse 0.8s ease-out;
}

@keyframes themeChangeSpin {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(0.9) rotate(-10deg); }
  50% { transform: scale(1.1) rotate(180deg); }
  75% { transform: scale(0.95) rotate(360deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes iconFlip {
  0% { transform: rotateY(0deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.3); }
  100% { transform: rotateY(360deg) scale(1); }
}

@keyframes iconMorph {
  0% { transform: scale(1) rotate(0deg); filter: blur(0); }
  25% { transform: scale(0.5) rotate(90deg); filter: blur(2px); opacity: 0.5; }
  50% { transform: scale(1.5) rotate(180deg); filter: blur(0); opacity: 1; }
  75% { transform: scale(0.8) rotate(270deg); filter: blur(1px); }
  100% { transform: scale(1) rotate(360deg); filter: blur(0); }
}

@keyframes themePulse {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 0.3; }
  100% { opacity: 0; transform: scale(2); }
}

/* ===== Mobile Menu Toggle ===== */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 20px;
  right: 80px;
  z-index: 1001;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: var(--nav-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  padding: 12px;
  width: 48px;
  height: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.mobile-menu-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.2s ease;
  transform-origin: center;
}

.mobile-menu-toggle:hover span {
  background: var(--accent-primary);
}

/* Animated X state */
.mobile-menu-toggle.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.mobile-menu-toggle.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.mobile-menu-toggle.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ===== Mobile Dropdown ===== */
.nav-mobile {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 999;
  background: var(--nav-bg-scrolled);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  min-width: 180px;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.nav-mobile.open {
  max-height: 300px;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.nav-mobile a {
  color: var(--text-secondary);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-mobile a:hover {
  color: var(--accent-primary);
  background: rgba(187, 134, 252, 0.1);
}

/* ===== Splash Section ===== */
.splash-section {
  min-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.splash-container {
  text-align: center;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(187, 134, 252, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(187, 134, 252, 0.5); }
  to { text-shadow: 0 0 30px rgba(187, 134, 252, 0.8), 0 0 40px rgba(187, 134, 252, 0.6); }
}

.tagline {
  font-family: 'Inter', sans-serif;
  margin-bottom: 3rem;
}

.tagline-text {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tagline-sub {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* ===== Scroll hint ===== */
.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  animation: bounceDown 2.5s ease-in-out infinite;
}

.scroll-hint:hover {
  opacity: 1;
}

.scroll-hint span {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent-secondary);
}

.scroll-arrow {
  font-size: 1.2rem;
  color: var(--accent-secondary);
}

@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .navbar-float {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .logo {
    font-size: 2.2rem;
  }

  .tagline-text {
    font-size: 1.1rem;
  }
  
  .tagline-sub {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .mobile-menu-toggle {
    top: 15px;
    right: 15px;
  }
  
  .nav-mobile {
    right: 15px;
    top: 75px;
  }
}
</style>
