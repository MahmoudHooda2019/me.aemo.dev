<template>
  <header>
    <!-- Sticky Navbar -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-brand">Aemo Developer</div>
      <div class="nav-links">
        <button class="nav-link-btn" @click="scrollTo('extensions')">Extensions</button>
        <button class="nav-link-btn" @click="scrollTo('tools')">Tools</button>
        <button class="nav-link-btn" @click="scrollTo('contact')">Contact</button>
      </div>
      <div class="nav-actions">
        <button
          class="theme-toggle"
          @click="toggleTheme"
          :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="theme-icon" :class="{ spin: true }">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
        </button>
        <button class="nav-toggle" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Toggle navigation menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Dropdown Menu -->
    <div class="nav-mobile" :class="{ open: menuOpen }">
      <a href="#extensions" @click.prevent="mobileNav('extensions')">Extensions</a>
      <a href="#tools" @click.prevent="mobileNav('tools')">Tools</a>
      <a href="#contact" @click.prevent="mobileNav('contact')">Contact</a>
    </div>

    <!-- Splash Section -->
    <section class="splash-section">
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
const menuOpen = ref(false)
const { theme, toggleTheme } = useTheme()

const handleScroll = () => {
  isScrolled.value = window.scrollY > 80
}

const scrollTo = (id: string) => {
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
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ===== Navbar ===== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--nav-bg);
  transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  border-bottom: 1px solid var(--border-color);
}

.navbar.scrolled {
  background: var(--nav-bg-scrolled);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--border-color);
}

.nav-brand {
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-primary);
  letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(187, 134, 252, 0.4);
  cursor: pointer;
  user-select: none;
}

.nav-links {
  display: flex;
  gap: 2.2rem;
  margin: 0;
  padding: 0;
}

.nav-link-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.92rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.nav-link-btn:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: rgba(187, 134, 252, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(187, 134, 252, 0.3);
}

.navbar:not(.scrolled) .nav-link-btn {
  border-color: rgba(187, 134, 252, 0.3);
  background: rgba(187, 134, 252, 0.05);
  box-shadow: 0 2px 8px rgba(187, 134, 252, 0.1);
}

.navbar:not(.scrolled) .nav-link-btn:hover {
  border-color: var(--accent-primary);
  background: rgba(187, 134, 252, 0.15);
  box-shadow: 0 4px 16px rgba(187, 134, 252, 0.3);
}

/* ===== Nav actions group (theme toggle + hamburger) ===== */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ===== Theme toggle button ===== */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(187, 134, 252, 0.3);
  background: rgba(187, 134, 252, 0.08);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: rgba(187, 134, 252, 0.18);
  border-color: var(--accent-primary);
  transform: scale(1.1);
}

.theme-icon {
  font-size: 1rem;
  line-height: 1;
  display: block;
  transition: transform 0.4s ease;
}

.theme-toggle:hover .theme-icon {
  transform: rotate(20deg);
}

/* ===== Hamburger ===== */
.nav-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
}

.nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-secondary);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.2s ease;
  transform-origin: center;
}

.nav-toggle:hover span {
  background: var(--accent-primary);
}

/* Animated X state */
.nav-toggle.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.nav-toggle.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.nav-toggle.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ===== Mobile dropdown ===== */
.nav-mobile {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 999;
  background: var(--nav-bg-scrolled);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, padding 0.35s ease;
}

.nav-mobile.open {
  max-height: 300px;
  padding: 0.75rem 0;
}

.nav-mobile a {
  color: var(--text-secondary);
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.85rem 2rem;
  transition: color 0.2s ease, background 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-mobile a:hover {
  color: var(--accent-primary);
  background: rgba(187, 134, 252, 0.07);
  border-left-color: var(--accent-primary);
}

/* ===== Splash Section ===== */
.splash-section {
  min-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
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
  .navbar {
    padding: 0.85rem 1.25rem;
  }

  .nav-links {
    display: none;
  }

  .nav-toggle {
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
</style>
