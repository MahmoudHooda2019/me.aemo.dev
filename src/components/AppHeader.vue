<template>
  <header>
    <!-- ═══ Unified Notch / Navbar ═══ -->
    <div
      class="nav-island"
      :class="{
        'is-notch':    isNotch,
        'is-expanded': !isNotch,
        'is-scrolled': isScrolled,
        [`section-${activeSection}`]: true,
      }"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <!-- Notch hardware (always in DOM, morphs via CSS) -->
      <div class="island-notch" aria-hidden="true">
        <span class="notch-camera"></span>
        <span class="notch-speaker"></span>
      </div>

      <!-- Nav buttons (always in DOM, morphs via CSS) -->
      <nav class="island-nav" role="navigation" aria-label="Main navigation">
        <button
          class="nav-btn"
          :class="{ active: activeSection === 'tools' }"
          @click="scrollTo('tools')"
        >
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span class="btn-label">Tools</span>
        </button>

        <!-- Pip: camera remnant becomes a subtle divider -->
        <span class="island-pip" aria-hidden="true"></span>

        <button
          class="nav-btn home-btn"
          :class="{ active: activeSection === 'home' }"
          @click="scrollTo('top')"
          aria-label="Home"
        >
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="btn-label">Home</span>
        </button>

        <span class="island-pip" aria-hidden="true"></span>

        <button
          class="nav-btn"
          :class="{ active: activeSection === 'extensions' }"
          @click="scrollTo('extensions')"
        >
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </span>
          <span class="btn-label">Extensions</span>
        </button>
      </nav>
    </div>

    <!-- ─── Floating Theme Toggle ─── -->
    <button
      class="theme-toggle"
      :class="{ spinning: isThemeChanging }"
      @click="handleThemeToggle"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <span class="theme-icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
      <span class="theme-ripple" :class="{ active: isThemeChanging }"></span>
    </button>

    <!-- ─── Mobile Toggle ─── -->
    <button
      class="mobile-toggle"
      :class="{ open: menuOpen }"
      @click="menuOpen = !menuOpen"
      aria-label="Toggle navigation menu"
      :aria-expanded="menuOpen"
    >
      <span></span><span></span><span></span>
    </button>

    <!-- ─── Mobile Dropdown ─── -->
    <div class="nav-mobile" :class="{ open: menuOpen }" role="menu">
      <a href="#tools"      @click.prevent="mobileNav('tools')">🛠️ Tools</a>
      <a href="#top"        @click.prevent="mobileNav('top')">🏠 Home</a>
      <a href="#extensions" @click.prevent="mobileNav('extensions')">📦 Extensions</a>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const isScrolled      = ref(false)
const isHidden        = ref(false)
const isMouseNear     = ref(false)
const isExpanding     = ref(false)
const menuOpen        = ref(false)
const isThemeChanging = ref(false)
const activeSection   = ref('home')

const { theme, toggleTheme } = useTheme()

const isNotch = computed(() => isHidden.value && !isScrolled.value && !isExpanding.value)

let hideTimer:   ReturnType<typeof setTimeout> | null = null
let expandTimer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (hideTimer)   { clearTimeout(hideTimer);   hideTimer   = null }
  if (expandTimer) { clearTimeout(expandTimer); expandTimer = null }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 80
  const sections = ['tools', 'extensions'] as const
  let found = false
  for (const id of sections) {
    const rect = document.getElementById(id)?.getBoundingClientRect()
    if (rect && rect.top <= 150 && rect.bottom > 150) { activeSection.value = id; found = true; break }
  }
  if (!found && window.scrollY < 100) activeSection.value = 'home'
}

const handleMouseMove = (e: MouseEvent) => {
  const el = document.querySelector('.nav-island') as HTMLElement | null
  if (!el) return
  const { bottom, left, right } = el.getBoundingClientRect()
  const near = e.clientY < bottom + 110 && e.clientX > left - 110 && e.clientX < right + 110
  if (near && isHidden.value && !isScrolled.value) onEnter()
}

const onEnter = () => {
  isMouseNear.value = true
  clearTimers()
  isHidden.value    = false
  isExpanding.value = true
  expandTimer = setTimeout(() => { isExpanding.value = false }, 700)
}

const onLeave = () => {
  isMouseNear.value = false
  if (isScrolled.value) return
  hideTimer = setTimeout(() => {
    isExpanding.value = false
    isHidden.value    = true
  }, 2200)
}

const handleThemeToggle = () => {
  isThemeChanging.value = true
  toggleTheme()
  setTimeout(() => { isThemeChanging.value = false }, 800)
}

const scrollTo = (id: string) => {
  if (id === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const mobileNav = (id: string) => { menuOpen.value = false; scrollTo(id) }

onMounted(() => {
  window.addEventListener('scroll',    handleScroll,    { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  setTimeout(() => { if (!isMouseNear.value) isHidden.value = true }, 3000)
})
onUnmounted(() => {
  window.removeEventListener('scroll',    handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  clearTimers()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

/* ════════════════════════════════════════
   THE ISLAND — single unified container
════════════════════════════════════════ */
.nav-island {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  overflow: hidden;
  cursor: default;
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  will-change: width, height, border-radius, top;
  transition:
    width          0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    height         0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    border-radius  0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    top            0.55s cubic-bezier(0.4, 0, 0.2, 1),
    padding        0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    background     0.4s  ease,
    box-shadow     0.4s  ease,
    border-color   0.4s  ease;
}

/* ── NOTCH state ── */
.nav-island.is-notch {
  top: 0;
  width: 130px;
  height: 36px;
  padding: 0 18px;
  background: var(--notch-bg, rgba(8, 8, 12, 0.95));
  border-radius: 0 0 26px 26px;
  box-shadow: var(--notch-shadow, 0 2px 20px rgba(0, 0, 0, 0.6));
  border: none;
  transition:
    width          0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    height         0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    border-radius  0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    top            0.55s cubic-bezier(0.4, 0, 0.2, 1),
    padding        0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    background     0.4s  ease,
    box-shadow     0.4s  ease;
}

/* Hover state for notch - subtle lift */
.nav-island.is-notch:hover {
  background: var(--notch-bg-hover, rgba(20, 20, 25, 0.95));
}

/* Section-specific notch accent glows */
.nav-island.is-notch.section-tools {
  box-shadow: var(--notch-shadow), 0 0 30px -8px var(--shadow-color);
}
.nav-island.is-notch.section-home {
  box-shadow: var(--notch-shadow), 0 0 30px -8px var(--shadow-color);
}
.nav-island.is-notch.section-extensions {
  box-shadow: var(--notch-shadow), 0 0 30px -8px var(--shadow-color-alt);
}

/* ── EXPANDED state ── */
.nav-island.is-expanded {
  top: 14px;
  width: auto;
  min-width: 360px;
  max-width: min(520px, 92vw);
  height: 52px;
  padding: 0 6px;
  background: var(--nav-bg, rgba(13, 13, 20, 0.85));
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    width          0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    height         0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    border-radius  0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    top            0.55s cubic-bezier(0.4, 0, 0.2, 1),
    padding        0.7s  cubic-bezier(0.34, 1.4, 0.64, 1),
    background     0.4s  ease,
    box-shadow     0.4s  ease,
    border-color   0.4s  ease;
}

.nav-island.is-expanded.is-scrolled {
  background: var(--nav-bg-scrolled, rgba(9, 9, 16, 0.96));
  border-color: var(--shadow-color);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--shadow-color),
    0 0 28px -6px var(--shadow-color);
}

/* Section-specific navbar accents when expanded */
.nav-island.is-expanded.section-tools {
  border-color: var(--shadow-color);
}
.nav-island.is-expanded.section-extensions {
  border-color: var(--shadow-color-alt);
}

/* ════════════════════════════════════════
   NOTCH HARDWARE
════════════════════════════════════════ */
.island-notch {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  transition:
    opacity   0.35s ease,
    transform 0.5s  cubic-bezier(0.34, 1.4, 0.64, 1);
  will-change: transform, opacity;
}

.is-notch .island-notch {
  opacity: 1;
  transform: scale(1) translateY(0);
  position: relative;
}

.is-expanded .island-notch {
  opacity: 0;
  transform: scale(0.6) translateY(-10px);
  position: absolute;
}

.notch-camera {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--notch-camera-bg, #111118);
  flex-shrink: 0;
  transition: box-shadow 0.4s ease;
}

/* Section-tinted camera lens reflection */
.section-tools .notch-camera,
.section-home .notch-camera {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 0 1.5px var(--shadow-color), 0 0 8px var(--shadow-color);
}
.section-extensions .notch-camera {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.95), 0 0 0 1.5px var(--shadow-color-alt), 0 0 8px var(--shadow-color-alt);
}

.notch-speaker {
  width: 54px;
  height: 5px;
  border-radius: 3px;
  background: var(--notch-speaker-bg, #111118);
  flex-shrink: 0;
  transition: box-shadow 0.4s ease;
}

/* Section-tinted speaker glow */
.section-tools .notch-speaker,
.section-home .notch-speaker {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 6px var(--shadow-color);
}
.section-extensions .notch-speaker {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 6px var(--shadow-color-alt);
}

/* ════════════════════════════════════════
   NAV CONTENT
════════════════════════════════════════ */
.island-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  transition:
    opacity   0.35s ease,
    transform 0.5s  cubic-bezier(0.34, 1.4, 0.64, 1);
  will-change: transform, opacity;
}

.is-notch .island-nav {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
  pointer-events: none;
  position: absolute;
}

.is-expanded .island-nav {
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
  position: relative;
}

/* Camera-remnant pip divider */
.island-pip {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted, rgba(255, 255, 255, 0.4));
  flex-shrink: 0;
  transition: background 0.3s, transform 0.3s;
}

[data-theme='light'] .island-pip {
  background: var(--text-muted, rgba(0, 0, 0, 0.35));
}

/* Highlight pip next to active button */
.nav-btn.active + .island-pip,
.island-pip:has(+ .nav-btn.active) {
  background: var(--accent-primary);
  transform: scale(1.2);
}

/* ════════════════════════════════════════
   NAV BUTTONS — active state grows noticeably
════════════════════════════════════════ */
.nav-btn {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.42rem 0.72rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  letter-spacing: 0.15px;
  cursor: pointer;
  white-space: nowrap;
  /* All transitions in one place */
  transition:
    color        0.3s ease,
    background   0.3s ease,
    border-color 0.3s ease,
    padding      0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
    font-size    0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
    font-weight  0.3s ease,
    gap          0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
    box-shadow   0.3s ease,
    transform    0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
  will-change: padding, font-size, gap;
}

/* Light mode button colors */
[data-theme='light'] .nav-btn {
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
}
[data-theme='light'] .nav-btn:hover {
  color: var(--text-primary, rgba(0, 0, 0, 0.85));
  background: rgba(0, 0, 0, 0.06);
}

/* Label hidden by default, reveals on hover/active */
.btn-label {
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  transition:
    max-width 0.45s cubic-bezier(0.34, 1.4, 0.64, 1),
    opacity   0.3s  ease;
  white-space: nowrap;
}

.nav-btn:hover .btn-label,
.nav-btn.active .btn-label {
  max-width: 80px;
  opacity: 1;
}

.nav-btn:hover,
.nav-btn.active {
  gap: 0.4rem;
}

/* Hover */
.nav-btn:hover {
  color: var(--text-primary, rgba(255, 255, 255, 0.9));
  background: rgba(255, 255, 255, 0.08);
}

/* ── ACTIVE: visibly bigger + accented ── */
.nav-btn.active {
  padding: 0.56rem 1.2rem;
  font-size: 0.87rem;
  font-weight: 500;
  color: var(--accent-primary);
  background: var(--shadow-color);
  border-color: var(--shadow-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 4px 18px var(--shadow-color);
  transform: translateY(-1px);
}

.nav-btn.active .btn-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 5px var(--shadow-color));
}

/* Light up the pip beside an active button */
.nav-btn.active + .island-pip,
.island-pip:has(+ .nav-btn.active) {
  background: var(--shadow-color);
}

.nav-btn:focus-visible {
  outline: 2px solid var(--shadow-color);
  outline-offset: 2px;
}

.btn-icon {
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: filter 0.3s, color 0.3s;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.home-btn {
  background: rgba(255, 255, 255, 0.025);
}

[data-theme='light'] .home-btn {
  background: rgba(0, 0, 0, 0.04);
}

/* ════════════════════════════════════════
   THEME TOGGLE
════════════════════════════════════════ */
.theme-toggle {
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 1001;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  background: var(--nav-bg, rgba(13, 13, 20, 0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
  overflow: visible;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}

.theme-toggle:hover {
  border-color: var(--shadow-color);
  box-shadow: 0 6px 26px var(--shadow-color);
  transform: scale(1.09);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--shadow-color);
  outline-offset: 3px;
}

.theme-toggle.spinning { animation: spinOnce 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

.theme-icon { font-size: 1.2rem; line-height: 1; position: relative; z-index: 1; }

.theme-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, var(--shadow-color) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.4);
  pointer-events: none;
}

.theme-ripple.active { animation: rippleOut 0.75s ease-out forwards; }

@keyframes spinOnce {
  0%   { transform: scale(1)    rotate(0deg); }
  40%  { transform: scale(0.88) rotate(160deg); }
  70%  { transform: scale(1.06) rotate(340deg); }
  100% { transform: scale(1)    rotate(360deg); }
}

@keyframes rippleOut {
  0%   { opacity: 0.55; transform: scale(0.4); }
  100% { opacity: 0;    transform: scale(2.4); }
}

/* ════════════════════════════════════════
   MOBILE
════════════════════════════════════════ */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 18px;
  right: 78px;
  z-index: 1001;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 11px;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color, rgba(255,255,255,0.1));
  border-radius: 12px;
  background: var(--nav-bg, rgba(13, 13, 20, 0.85));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

[data-theme='light'] .mobile-toggle {
  border-color: var(--border-color, rgba(0, 0, 0, 0.1));
}

.mobile-toggle span {
  display: block;
  width: 20px;
  height: 1.5px;
  border-radius: 2px;
  background: var(--text-secondary, rgba(255,255,255,0.6));
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform-origin: center;
}

[data-theme='light'] .mobile-toggle span {
  background: var(--text-secondary, rgba(0, 0, 0, 0.6));
}

.mobile-toggle:hover span { background: var(--text-primary, rgba(255,255,255,0.9)); }
[data-theme='light'] .mobile-toggle:hover span { background: var(--text-primary, rgba(0, 0, 0, 0.85)); }
.mobile-toggle.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.mobile-toggle.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.mobile-toggle.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

.nav-mobile {
  position: fixed;
  top: 74px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  padding: 0.35rem;
  min-width: 168px;
  background: var(--nav-bg, rgba(11, 11, 18, 0.96));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--border-color, rgba(255,255,255,0.08));
  border-radius: 16px;
  box-shadow: 0 14px 42px rgba(0,0,0,0.45);
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
  transition: max-height 0.35s ease, opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.nav-mobile.open {
  max-height: 260px;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.nav-mobile a {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.95rem;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 400;
  color: var(--text-secondary, rgba(255,255,255,0.6));
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
}

[data-theme='light'] .nav-mobile a {
  color: var(--text-secondary, rgba(0, 0, 0, 0.65));
}

.nav-mobile a:hover { color: var(--accent-primary); background: var(--shadow-color); }
[data-theme='light'] .nav-mobile a:hover { background: var(--shadow-color); }

/* ════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════ */
@media (max-width: 768px) {
  .nav-island    { display: none; }
  .mobile-toggle { display: flex; }
  .theme-toggle  { top: 16px; right: 16px; width: 40px; height: 40px; }
  .mobile-toggle { right: 62px; }
  .nav-mobile    { right: 16px; }
}

@media (max-width: 480px) {
  .mobile-toggle { right: 60px; top: 14px; }
  .nav-mobile    { right: 14px; top: 70px; }
  .theme-toggle  { top: 14px; right: 14px; }
}
</style>