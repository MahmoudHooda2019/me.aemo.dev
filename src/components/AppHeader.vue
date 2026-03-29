<template>
  <header>
    <!-- Desktop Notch / Navbar -->
    <div
      ref="navIslandRef"
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
      <div class="island-notch" aria-hidden="true">
        <span class="notch-camera"></span>
        <span class="notch-speaker"></span>
        <span class="notch-hint">Menu</span>
      </div>

      <nav class="island-nav" role="navigation" aria-label="Main navigation">
        <button
          class="nav-btn"
          :class="{ active: activeSection === 'tools' }"
          @click="scrollTo('tools')"
        >
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span class="btn-label">Tools</span>
        </button>

        <span
          class="island-pip"
          :class="{ 'pip-active': activeSection === 'tools' || activeSection === 'home' }"
          aria-hidden="true"
        ></span>

        <button
          class="nav-btn"
          :class="{ active: activeSection === 'home' }"
          @click="scrollTo('top')"
          aria-label="Home"
        >
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="btn-label">Home</span>
        </button>

        <span
          class="island-pip"
          :class="{ 'pip-active': activeSection === 'home' || activeSection === 'extensions' }"
          aria-hidden="true"
        ></span>

        <button
          class="nav-btn"
          :class="{ active: activeSection === 'extensions' }"
          @click="scrollTo('extensions')"
        >
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </span>
          <span class="btn-label">Extensions</span>
        </button>
      </nav>
    </div>

    <!-- Theme Toggle -->
    <button
      class="theme-toggle"
      :class="{ spinning: isThemeChanging }"
      @click="handleThemeToggle"
      :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <span class="theme-icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
      <span class="theme-ripple" :class="{ active: isThemeChanging }"></span>
    </button>

    <!-- Mobile Navigation -->

    <!-- Backdrop -->
    <transition name="backdrop-fade">
      <div v-if="menuOpen" class="m-backdrop" @click="closeMenu" aria-hidden="true"></div>
    </transition>

    <!-- Section bubbles (appear left of trigger) -->
    <div
      class="m-section-bubbles"
      :class="{ open: menuOpen }"
      role="menu"
      aria-label="Navigate to section"
      :style="{ '--m-trigger-w': triggerWidth + 'px' }"
    >
      <button
        v-for="(item, i) in otherItems"
        :key="item.id"
        class="m-bubble"
        :class="[`accent-${item.id}`, { visible: menuOpen }]"
        :style="{ transitionDelay: menuOpen ? `${i * 55}ms` : `${(otherItems.length - 1 - i) * 40}ms` }"
        @click="selectSection(item)"
        :aria-label="item.label"
        role="menuitem"
      >
        <span class="m-bubble-icon" v-html="item.icon"></span>
        <span class="m-bubble-label">{{ item.label }}</span>
      </button>
    </div>

    <!-- Trigger pill -->
    <button
      ref="triggerRef"
      class="m-trigger"
      :class="[`accent-${activeSection}`, { open: menuOpen }]"
      @click="toggleMenu"
      aria-haspopup="true"
      :aria-expanded="menuOpen"
      aria-label="Navigation menu"
    >
      <span class="m-trigger-content">
        <transition name="section-swap" mode="out-in">
          <span class="m-trigger-inner" :key="activeSection">
            <span class="m-trigger-icon" v-html="currentItem.icon"></span>
            <span class="m-trigger-label">{{ currentItem.label }}</span>
          </span>
        </transition>

        <transition name="x-fade">
          <span v-if="menuOpen" class="m-trigger-close" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </transition>
      </span>

      <span class="m-trigger-ring" aria-hidden="true"></span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme'

// Refs
const isScrolled      = ref(false)
const isHidden        = ref(false)
const isMouseNear     = ref(false)
const isExpanding     = ref(false)
const isThemeChanging = ref(false)
const activeSection   = ref<'home' | 'tools' | 'extensions'>('home')
const menuOpen        = ref(false)

const navIslandRef = ref<HTMLElement | null>(null)
const triggerRef   = ref<HTMLElement | null>(null)
const triggerWidth = ref(114)

const { theme, toggleTheme } = useTheme()

// Computed
const isNotch = computed(
  () => isHidden.value && !isScrolled.value && !isExpanding.value,
)

// Timer handles
let hideTimer:      ReturnType<typeof setTimeout> | null = null
let expandTimer:    ReturnType<typeof setTimeout> | null = null
let unwatchTrigger: (() => void) | null = null
let unwatchTheme:   (() => void) | null = null
let resizeObserver: ResizeObserver | null = null

const clearTimers = () => {
  if (hideTimer)   { clearTimeout(hideTimer);   hideTimer   = null }
  if (expandTimer) { clearTimeout(expandTimer); expandTimer = null }
}

// Scroll handling
const handleScroll = () => {
  const wasScrolled = isScrolled.value
  isScrolled.value  = window.scrollY > 80

  if (!wasScrolled && isScrolled.value) {
    clearTimers()
    isHidden.value = false
  } else if (wasScrolled && !isScrolled.value) {
    clearTimers()
    hideTimer = setTimeout(() => {
      if (!isMouseNear.value) {
        isExpanding.value = false
        isHidden.value    = true
      }
    }, 2200)
  }

  // Update active section
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
  if (!found && window.scrollY < 100) activeSection.value = 'home'
}

// Mouse proximity
const handleMouseMove = (e: MouseEvent) => {
  const el = navIslandRef.value
  if (!el) return
  const { bottom, left, right } = el.getBoundingClientRect()
  const near =
    e.clientY < bottom + 110 &&
    e.clientX > left  - 110 &&
    e.clientX < right + 110
  if (near && isHidden.value && !isScrolled.value) onEnter()
}

const onEnter = () => {
  isMouseNear.value  = true
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

// Theme toggle
const handleThemeToggle = () => {
  isThemeChanging.value = true
  toggleTheme()
  setTimeout(() => { isThemeChanging.value = false }, 800)
}

// Nav items
const navItems = [
  {
    id: 'home'       as const,
    scrollId: 'top',
    label: 'Home',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    id: 'tools'      as const,
    scrollId: 'tools',
    label: 'Tools',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  },
  {
    id: 'extensions' as const,
    scrollId: 'extensions',
    label: 'Extensions',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  },
]

const currentItem = computed(() => navItems.find(i => i.id === activeSection.value) ?? navItems[0])
const otherItems  = computed(() => navItems.filter(i => i.id !== activeSection.value))

// Menu controls
const toggleMenu  = () => { menuOpen.value = !menuOpen.value }
const closeMenu   = () => { menuOpen.value = false }

const selectSection = (item: typeof navItems[number]) => {
  closeMenu()
  setTimeout(() => {
    activeSection.value = item.id
    scrollTo(item.scrollId)
  }, 80)
}

const scrollTo = (id: string) => {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Trigger width measurement
const measureTrigger = () => {
  if (triggerRef.value) {
    triggerWidth.value = triggerRef.value.getBoundingClientRect().width
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll',    handleScroll,    { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })

  hideTimer = setTimeout(() => {
    if (!isMouseNear.value) isHidden.value = true
  }, 3000)

  if (triggerRef.value) {
    resizeObserver = new ResizeObserver(measureTrigger)
    resizeObserver.observe(triggerRef.value)
    measureTrigger()
  }

  unwatchTrigger = watch(activeSection, () => nextTick(measureTrigger))
  unwatchTheme   = watch(theme, () => setTimeout(measureTrigger, 150))
})

onUnmounted(() => {
  window.removeEventListener('scroll',    handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  resizeObserver?.disconnect()
  unwatchTrigger?.()
  unwatchTheme?.()
  clearTimers()
})
</script>

<!--
  Global CSS variables — must be unscoped so :root and [data-theme] on <html>
  are reachable. Scoped styles cannot pierce outside the component boundary.
-->
<style>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

/* Header base */
header {
  position: relative;
  z-index: 2000;
}

/* ─── Desktop Navigation Island ──────────────────────────────────── */
.nav-island {
  position: fixed; top: 0; left: 50%;
  /*
    FIX: z-index raised to 10000 so the island always sits above
    floating badges (z-index 30 desktop / 200 mobile).
  */
  z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  transform: translateX(-50%); overflow: hidden; cursor: default;
  backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
  will-change: width, height, border-radius, top;
  transition:
    width         .7s cubic-bezier(0.34, 1.4, 0.64, 1),
    height        .7s cubic-bezier(0.34, 1.4, 0.64, 1),
    border-radius .7s cubic-bezier(0.34, 1.4, 0.64, 1),
    top           .55s cubic-bezier(0.4, 0, 0.2, 1),
    padding       .7s cubic-bezier(0.34, 1.4, 0.64, 1),
    background    .4s,
    box-shadow    .4s,
    border-color  .4s;
}

.nav-island.is-notch {
  top: 0; width: 130px; height: 36px; padding: 0 18px;
  background: var(--notch-bg);
  border-radius: 0 0 26px 26px;
  box-shadow: var(--notch-shadow);
  border: 1px solid var(--notch-border);
}
.nav-island.is-notch:hover { filter: brightness(1.07); }

/* Accent glow on notch camera */
.nav-island.is-notch.section-tools .notch-camera,
.nav-island.is-notch.section-home  .notch-camera {
  box-shadow:
    inset 0 1px 3px rgba(0,0,0,.95),
    0 0 0 1.5px var(--shadow-color),
    0 0 8px var(--shadow-color);
}
.nav-island.is-notch.section-extensions .notch-camera {
  box-shadow:
    inset 0 1px 3px rgba(0,0,0,.95),
    0 0 0 1.5px var(--shadow-color-alt),
    0 0 8px var(--shadow-color-alt);
}

.nav-island.is-notch.section-tools   .notch-speaker,
.nav-island.is-notch.section-home    .notch-speaker { box-shadow: inset 0 1px 3px rgba(0,0,0,.9), 0 0 6px var(--shadow-color); }
.nav-island.is-notch.section-extensions .notch-speaker { box-shadow: inset 0 1px 3px rgba(0,0,0,.9), 0 0 6px var(--shadow-color-alt); }

.nav-island.is-expanded {
  top: 14px; width: auto; min-width: 360px; max-width: min(520px, 92vw);
  height: 52px; padding: 0 6px;
  background: var(--nav-bg);
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.07);
  box-shadow: 0 8px 32px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.04);
}
[data-theme='light'] .nav-island.is-expanded {
  border-color: rgba(0,0,0,.08);
  box-shadow: 0 8px 32px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.6);
}

.nav-island.is-expanded.is-scrolled {
  background: var(--nav-bg-scrolled);
  border-color: var(--shadow-color);
  box-shadow:
    0 10px 40px rgba(0,0,0,.5),
    0 0 0 1px var(--shadow-color),
    0 0 28px -6px var(--shadow-color);
}
.nav-island.is-expanded.section-tools      { border-color: var(--shadow-color); }
.nav-island.is-expanded.section-extensions { border-color: var(--shadow-color-alt); }

/* Notch internals */
.island-notch {
  display: flex; align-items: center; gap: 10px;
  pointer-events: none;
  transition: opacity .35s, transform .5s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.is-notch    .island-notch { opacity: 1; transform: scale(1) translateY(0); position: relative; }
.is-expanded .island-notch { opacity: 0; transform: scale(.6) translateY(-10px); position: absolute; }

.notch-camera  { width: 11px; height: 11px; border-radius: 50%; background: var(--notch-camera-bg);  flex-shrink: 0; transition: box-shadow .4s; }
.notch-speaker { width: 54px; height: 5px;  border-radius: 3px;  background: var(--notch-speaker-bg); flex-shrink: 0; transition: box-shadow .4s; }

/* Hover "Menu" hint */
.notch-hint {
  position: absolute; bottom: -22px; left: 50%;
  transform: translateX(-50%) translateY(-8px);
  font-family: 'DM Sans', sans-serif;
  font-size: .55rem; font-weight: 600; letter-spacing: .8px; text-transform: uppercase;
  color: var(--text-muted);
  background: var(--nav-bg-mobile);
  padding: 3px 8px; border-radius: 4px; white-space: nowrap;
  pointer-events: none; opacity: 0;
  transition: opacity .25s ease, transform .25s cubic-bezier(0.34, 1.4, 0.64, 1);
  backdrop-filter: blur(8px);
}
.nav-island.is-notch:hover .notch-hint { opacity: 1; transform: translateX(-50%) translateY(0); }

/* Nav buttons */
.island-nav {
  display: flex; align-items: center; gap: 2px;
  transition: opacity .35s, transform .5s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.is-notch    .island-nav { opacity: 0; transform: scale(.85) translateY(10px); pointer-events: none; position: absolute; }
.is-expanded .island-nav { opacity: 1; transform: scale(1) translateY(0);      pointer-events: auto; position: relative; }

.island-pip {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
  transition: all .35s cubic-bezier(0.34, 1.4, 0.64, 1);
  opacity: 0.6;
}
.island-pip.pip-active {
  background: var(--shadow-color);
  transform: scale(1.4);
  opacity: 1;
  box-shadow: 0 0 10px var(--shadow-color), 0 0 20px var(--shadow-color);
}
.island-pip.pip-active:nth-of-type(2) {
  box-shadow: 0 0 10px var(--shadow-color-alt), 0 0 20px var(--shadow-color-alt);
}

.nav-btn {
  display: flex; align-items: center; gap: 0; padding: .42rem .72rem;
  border: 1px solid transparent; border-radius: 999px; background: transparent;
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif; font-size: .8rem; font-weight: 400; letter-spacing: .15px;
  cursor: pointer; white-space: nowrap;
  transition:
    color        .3s,
    background   .3s,
    border-color .3s,
    padding      .45s cubic-bezier(0.34, 1.4, 0.64, 1),
    font-size    .45s cubic-bezier(0.34, 1.4, 0.64, 1),
    font-weight  .3s,
    gap          .45s cubic-bezier(0.34, 1.4, 0.64, 1),
    box-shadow   .3s,
    transform    .35s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.nav-btn:hover,
.nav-btn.active { gap: .4rem; }

.btn-label {
  overflow: hidden; max-width: 0; opacity: 0;
  transition: max-width .45s cubic-bezier(0.34, 1.4, 0.64, 1), opacity .3s;
  white-space: nowrap;
}
.nav-btn:hover .btn-label,
.nav-btn.active .btn-label { max-width: 80px; opacity: 1; }

.nav-btn:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,.08);
}
[data-theme='light'] .nav-btn:hover {
  color: rgba(0,0,0,.85);
  background: rgba(0,0,0,.06);
}

.nav-btn.active {
  padding: .56rem 1.2rem; font-size: .87rem; font-weight: 500;
  color: var(--accent-primary);
  background: var(--shadow-color);
  border-color: var(--shadow-color);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 4px 18px var(--shadow-color);
  transform: translateY(-1px);
}
.nav-btn.active .btn-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 5px var(--shadow-color));
}
.nav-btn:focus-visible { outline: 2px solid var(--shadow-color); outline-offset: 2px; }

.btn-icon {
  width: 15px; height: 15px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: filter .3s, color .3s;
}
.btn-icon svg { width: 100%; height: 100%; }

/* ─── Theme Toggle ────────────────────────────────────────────────── */
.theme-toggle {
  position: fixed; top: 22px; right: 24px;
  /*
    FIX: z-index raised to 10001 — above nav-island (10000) and
    all floating badges (desktop 30 / mobile 200).
  */
  z-index: 10001;
  display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--nav-bg);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  cursor: pointer; overflow: visible;
  box-shadow: 0 4px 18px rgba(0,0,0,.3);
  transition: border-color .25s, box-shadow .25s, transform .25s;
}
.theme-toggle:hover {
  border-color: var(--shadow-color);
  box-shadow: 0 6px 26px var(--shadow-color);
  transform: scale(1.09);
}
.theme-toggle:focus-visible { outline: 2px solid var(--shadow-color); outline-offset: 3px; }
.theme-toggle.spinning { animation: spinOnce .7s cubic-bezier(0.4,0,.2,1) forwards; }
.theme-icon { font-size: 1.2rem; line-height: 1; position: relative; z-index: 1; }
.theme-ripple {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, var(--shadow-color) 0%, transparent 70%);
  opacity: 0; transform: scale(.4); pointer-events: none;
}
.theme-ripple.active { animation: rippleOut .75s ease-out forwards; }

@keyframes spinOnce {
  0%   { transform: scale(1)    rotate(0deg);   }
  40%  { transform: scale(.88)  rotate(160deg); }
  70%  { transform: scale(1.06) rotate(340deg); }
  100% { transform: scale(1)    rotate(360deg); }
}
@keyframes rippleOut {
  0%   { opacity: .55; transform: scale(.4);  }
  100% { opacity: 0;   transform: scale(2.4); }
}

/* ─── Mobile — Backdrop ───────────────────────────────────────────── */
.m-backdrop {
  position: fixed; inset: 0;
  /*
    FIX: z-index raised to 10005 — sits between the bubbles (10006)
    and the rest of the page content, while still below the trigger (10010).
  */
  z-index: 10005;
  background: var(--backdrop-bg);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}
.backdrop-fade-enter-active { transition: opacity .25s ease; }
.backdrop-fade-leave-active { transition: opacity .2s ease; }
.backdrop-fade-enter-from,
.backdrop-fade-leave-to { opacity: 0; }

/* ─── Mobile — Trigger pill ───────────────────────────────────────── */
.m-trigger {
  display: none;
  position: fixed; top: 16px; right: 64px;
  /*
    FIX: z-index raised to 10010 — topmost interactive element on mobile,
    always above badges (200), backdrop (10005) and bubbles (10006).
  */
  z-index: 10010;
  height: 40px; padding: 0 14px 0 10px; border-radius: 999px;
  border: 1.5px solid var(--border-color);
  background: var(--nav-bg-mobile);
  backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
  cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  align-items: center; justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06);
  transition: border-color .3s, box-shadow .3s, transform .3s cubic-bezier(0.34, 1.4, 0.64, 1);
  white-space: nowrap;
}
.m-trigger:active { transform: scale(0.94); }
.m-trigger.open   { transform: scale(1.04); }

.m-trigger.accent-home,
.m-trigger.accent-tools {
  border-color: rgba(110, 231, 183, 0.28);
  border-color: color-mix(in srgb, var(--shadow-color) 55%, transparent);
  box-shadow:
    0 4px 18px rgba(0,0,0,.35),
    0 0 18px -4px var(--shadow-color),
    inset 0 1px 0 rgba(255,255,255,.05);
}
.m-trigger.accent-extensions {
  border-color: rgba(124, 58, 237, 0.28);
  border-color: color-mix(in srgb, var(--shadow-color-alt) 55%, transparent);
  box-shadow:
    0 4px 18px rgba(0,0,0,.35),
    0 0 18px -4px var(--shadow-color-alt),
    inset 0 1px 0 rgba(255,255,255,.05);
}

[data-theme='light'] .m-trigger {
  background: rgba(255,255,255,.96);
  border-color: rgba(0,0,0,.12);
  box-shadow: 0 4px 18px rgba(0,0,0,.15);
}
[data-theme='light'] .m-trigger.accent-home,
[data-theme='light'] .m-trigger.accent-tools {
  border-color: rgba(5, 150, 105, 0.3);
  border-color: color-mix(in srgb, var(--shadow-color) 50%, transparent);
  box-shadow: 0 4px 18px rgba(0,0,0,.15), 0 0 14px -4px var(--shadow-color);
}
[data-theme='light'] .m-trigger.accent-extensions {
  border-color: rgba(124, 58, 237, 0.3);
  border-color: color-mix(in srgb, var(--shadow-color-alt) 50%, transparent);
  box-shadow: 0 4px 18px rgba(0,0,0,.15), 0 0 14px -4px var(--shadow-color-alt);
}

.m-trigger-content {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  min-width: 0;
}

.m-trigger-inner {
  display: flex; align-items: center; gap: 7px;
  pointer-events: none;
}

/* Section swap */
.section-swap-enter-active {
  transition: opacity .24s ease, transform .32s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.section-swap-leave-active {
  transition: opacity .16s ease, transform .22s ease;
  position: absolute;
}
.section-swap-enter-from { opacity: 0; transform: translateY(9px) scale(0.85); }
.section-swap-leave-to   { opacity: 0; transform: translateY(-7px) scale(0.9); }

/* Close X overlay */
.m-trigger-close {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  background: var(--nav-bg-mobile);
  backdrop-filter: blur(6px);
  border-radius: inherit;
}
[data-theme='light'] .m-trigger-close {
  color: rgba(0,0,0,.5);
  background: rgba(255,255,255,.7);
}
.m-trigger-close svg { width: 15px; height: 15px; }

.x-fade-enter-active { transition: opacity .18s ease; }
.x-fade-leave-active { transition: opacity .14s ease; }
.x-fade-enter-from,
.x-fade-leave-to { opacity: 0; }

/* Pulsing ring when open */
.m-trigger-ring {
  position: absolute; inset: -3px; border-radius: inherit;
  pointer-events: none; opacity: 0;
  transition: opacity .3s;
}
.m-trigger.open .m-trigger-ring { opacity: 1; animation: triggerPulse 1.8s ease-in-out infinite; }
.m-trigger.accent-home .m-trigger-ring,
.m-trigger.accent-tools .m-trigger-ring { border: 1.5px solid var(--shadow-color); }
.m-trigger.accent-extensions .m-trigger-ring { border: 1.5px solid var(--shadow-color-alt); }

@keyframes triggerPulse {
  0%, 100% { opacity: .5; transform: scale(1);    }
  50%       { opacity: 0;  transform: scale(1.14); }
}

/* Trigger icon */
.m-trigger-icon {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; flex-shrink: 0;
}
.m-trigger-icon svg { width: 100%; height: 100%; stroke-linecap: round; stroke-linejoin: round; }

.m-trigger.accent-home .m-trigger-icon,
.m-trigger.accent-tools .m-trigger-icon {
  color: var(--accent-primary);
  filter: drop-shadow(0 0 4px var(--shadow-color));
}
.m-trigger.accent-extensions .m-trigger-icon {
  color: var(--accent-secondary);
  filter: drop-shadow(0 0 4px var(--shadow-color-alt));
}
[data-theme='light'] .m-trigger.accent-home .m-trigger-icon,
[data-theme='light'] .m-trigger.accent-tools .m-trigger-icon { color: var(--accent-primary); }
[data-theme='light'] .m-trigger.accent-extensions .m-trigger-icon { color: var(--accent-secondary); }

/* Trigger label */
.m-trigger-label {
  font-family: 'DM Sans', sans-serif;
  font-size: .72rem; font-weight: 600; letter-spacing: .4px;
  text-transform: uppercase; line-height: 1;
}
.m-trigger.accent-home       .m-trigger-label,
.m-trigger.accent-tools      .m-trigger-label { color: var(--accent-primary); }
.m-trigger.accent-extensions .m-trigger-label { color: var(--accent-secondary); }
[data-theme='light'] .m-trigger .m-trigger-label { color: var(--text-primary); }

/* ─── Mobile — Section bubbles ────────────────────────────────────── */
.m-section-bubbles {
  display: none;
  position: fixed; top: 16px;
  right: calc(64px + var(--m-trigger-w, 114px) + 8px);
  /*
    FIX: z-index raised to 10006 — above backdrop (10005), below trigger (10010).
  */
  z-index: 10006;
  height: 40px;
  align-items: center; gap: 6px;
  pointer-events: none;
}
.m-section-bubbles.open { pointer-events: auto; }

.m-bubble {
  display: flex; align-items: center; justify-content: center;
  position: relative; width: 40px; height: 40px; border-radius: 999px;
  border: 1.5px solid var(--border-color);
  background: var(--nav-bg-mobile);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  box-shadow: 0 4px 16px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06);
  opacity: 0; transform: translateX(14px) scale(0.65);
  transition:
    opacity      .32s ease,
    transform    .42s cubic-bezier(0.34, 1.4, 0.64, 1),
    border-color .25s,
    box-shadow   .25s,
    background   .2s,
    width        .25s ease,
    padding      .25s ease;
}
.m-bubble.visible { opacity: 1; transform: translateX(0) scale(1); }
.m-bubble:active  { transform: scale(0.88) !important; }

.m-bubble.visible:hover,
.m-bubble.visible:focus-visible {
  width: auto;
  padding: 0 12px;
}
.m-bubble.visible:hover .m-bubble-label,
.m-bubble.visible:focus-visible .m-bubble-label {
  max-width: 60px; opacity: 1; margin-left: 4px;
}

.m-bubble-label {
  max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
  font-size: .6rem; font-weight: 600; letter-spacing: .3px; text-transform: uppercase;
  transition: max-width .25s ease, opacity .2s ease, margin-left .25s ease;
}

.m-bubble-icon {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; flex-shrink: 0;
  filter: drop-shadow(0 0 3px currentColor);
}
.m-bubble-icon svg { width: 100%; height: 100%; stroke-linecap: round; stroke-linejoin: round; }

.m-bubble.accent-home,
.m-bubble.accent-tools {
  border-color: rgba(110, 231, 183, 0.25);
  border-color: color-mix(in srgb, var(--shadow-color) 45%, transparent);
  box-shadow: 0 4px 16px rgba(0,0,0,.4), 0 0 12px -3px var(--shadow-color);
  color: var(--accent-primary);
}
.m-bubble.accent-extensions {
  border-color: rgba(124, 58, 237, 0.25);
  border-color: color-mix(in srgb, var(--shadow-color-alt) 45%, transparent);
  box-shadow: 0 4px 16px rgba(0,0,0,.4), 0 0 12px -3px var(--shadow-color-alt);
  color: var(--accent-secondary);
}

[data-theme='light'] .m-bubble {
  background: rgba(255,255,255,.96);
  border-color: rgba(0,0,0,.12);
  box-shadow: 0 4px 14px rgba(0,0,0,.15);
  color: var(--text-secondary);
}
[data-theme='light'] .m-bubble.accent-home,
[data-theme='light'] .m-bubble.accent-tools {
  border-color: rgba(5, 150, 105, 0.3);
  border-color: color-mix(in srgb, var(--shadow-color) 45%, transparent);
  box-shadow: 0 4px 14px rgba(0,0,0,.15), 0 0 12px -3px var(--shadow-color);
  color: var(--accent-primary);
}
[data-theme='light'] .m-bubble.accent-extensions {
  border-color: rgba(124, 58, 237, 0.3);
  border-color: color-mix(in srgb, var(--shadow-color-alt) 45%, transparent);
  box-shadow: 0 4px 14px rgba(0,0,0,.15), 0 0 12px -3px var(--shadow-color-alt);
  color: var(--accent-secondary);
}

/* ─── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .nav-island        { display: none; }
  .theme-toggle      { top: 16px; right: 16px; width: 40px; height: 40px; }
  .m-trigger         { display: flex; }
  .m-section-bubbles { display: flex; }
}

@media (max-width: 480px) {
  .theme-toggle      { top: 14px; right: 14px; width: 38px; height: 38px; }
  .m-trigger         { top: 14px; right: 60px; height: 38px; padding: 0 12px 0 9px; }
  .m-section-bubbles { top: 14px; right: calc(60px + var(--m-trigger-w, 108px) + 8px); height: 38px; gap: 5px; }
  .m-bubble          { width: 38px; height: 38px; }
  .m-trigger-icon,
  .m-bubble-icon     { width: 18px; height: 18px; }
  .m-trigger-label   { font-size: .66rem; }
  .m-bubble-label    { font-size: .55rem; }
}

/* ─── Reduced motion ──────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .nav-island,
  .island-notch,
  .island-nav,
  .nav-btn,
  .btn-label,
  .island-pip,
  .theme-toggle,
  .m-trigger,
  .m-bubble,
  .m-trigger-inner,
  .m-trigger-ring,
  .section-swap-enter-active,
  .section-swap-leave-active,
  .x-fade-enter-active,
  .x-fade-leave-active { transition: none !important; animation: none !important; }
}
</style>