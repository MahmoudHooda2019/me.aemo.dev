<template>
  <header>
    <!-- Sticky Navbar -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-brand">Aemo Developer</div>
      <ul class="nav-links">
        <li><a href="#extensions" @click.prevent="scrollTo('extensions')">Extensions</a></li>
        <li><a href="#tools" @click.prevent="scrollTo('tools')">Tools</a></li>
        <li><a href="#contact" @click.prevent="scrollTo('contact')">Contact</a></li>
      </ul>
      <button class="nav-toggle" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Toggle navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
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
          <pre>
⠛⠛⣿⣿⣿⣿⣿⡷⢶⣦⣶⣶⣤⣤⣤⣀⠀⠀⠀
 ⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀
 ⠀⠀⠀⠉⠉⠉⠙⠻⣿⣿⠿⠿⠛⠛⠛⠻⣿⣿⣇⠀
 ⠀⠀⢤⣀⣀⣀⠀⠀⢸⣷⡄⠀⣁⣀⣤⣴⣿⣿⣿⣆
 ⠀⠀⠀⠀⠹⠏⠀⠀⠀⣿⣧⠀⠹⣿⣿⣿⣿⣿⡿⣿
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠿⠇⢀⣼⣿⣿⠛⢯⡿⡟
 ⠀⠀⠀⠀⠀⠀⠀⠀⠦⠴⢿⢿⣿⡿⠷⠀⣿⠀
 ⠀⠀⠀⠀⠀⠙⣷⣶⣶⣤⣤⣤⣤⣶⣦⠃⠀
 ⠀⠀⠀⠀⠀⢐⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀
 ⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀
 ⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⠟⠁
                  </pre>
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

const isScrolled = ref(false)
const menuOpen = ref(false)

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
  background: transparent;
  transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}

.navbar.scrolled {
  background: rgba(18, 18, 18, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(187, 134, 252, 0.18);
}

.nav-brand {
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #bb86fc;
  letter-spacing: 1px;
  text-shadow: 0 0 12px rgba(187, 134, 252, 0.4);
  cursor: pointer;
  user-select: none;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2.2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #cccccc;
  text-decoration: none;
  font-size: 0.92rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  letter-spacing: 0.3px;
  position: relative;
  transition: color 0.2s ease;
  padding-bottom: 2px;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #bb86fc, #03dac6);
  border-radius: 2px;
  transition: width 0.25s ease;
}

.nav-links a:hover {
  color: #bb86fc;
}

.nav-links a:hover::after {
  width: 100%;
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
  background: #cccccc;
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.2s ease;
  transform-origin: center;
}

.nav-toggle:hover span {
  background: #bb86fc;
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
  background: rgba(18, 18, 18, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(187, 134, 252, 0.2);
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
  color: #cccccc;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.85rem 2rem;
  transition: color 0.2s ease, background 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-mobile a:hover {
  color: #bb86fc;
  background: rgba(187, 134, 252, 0.07);
  border-left-color: #bb86fc;
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
  color: #bb86fc;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(187, 134, 252, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(187, 134, 252, 0.5); }
  to { text-shadow: 0 0 30px rgba(187, 134, 252, 0.8), 0 0 40px rgba(187, 134, 252, 0.6); }
}

.tagline {
  font-family: 'JetBrains Mono', monospace;
  color: #00ffcc;
  font-size: 0.8rem;
  line-height: 1;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.tagline pre {
  margin: 0;
  white-space: pre;
  letter-spacing: 0.1em;
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
  color: #03dac6;
}

.scroll-arrow {
  font-size: 1.2rem;
  color: #03dac6;
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

  .tagline {
    font-size: 0.65rem;
  }
}
</style>
