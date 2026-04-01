<template>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{
  activeSection: 'home' | 'tools' | 'extensions'
}>()

const emit = defineEmits<{
  (e: 'update:activeSection', section: 'home' | 'tools' | 'extensions'): void
  (e: 'scrollTo', id: string): void
}>()

// Refs
const isScrolled = ref(false)
const isHidden = ref(false)
const isMouseNear = ref(false)
const isExpanding = ref(false)

const navIslandRef = ref<HTMLElement | null>(null)

// Timer handles
let hideTimer: ReturnType<typeof setTimeout> | null = null
let expandTimer: ReturnType<typeof setTimeout> | null = null

const isNotch = computed(() => isHidden.value && !isScrolled.value && !isExpanding.value)

const clearTimers = () => {
  if (hideTimer)   { clearTimeout(hideTimer);   hideTimer   = null }
  if (expandTimer) { clearTimeout(expandTimer); expandTimer = null }
}

// Scroll handling
const handleScroll = () => {
  const wasScrolled = isScrolled.value
  isScrolled.value = window.scrollY > 80

  if (!wasScrolled && isScrolled.value) {
    clearTimers()
    isHidden.value = false
  } else if (wasScrolled && !isScrolled.value) {
    clearTimers()
    hideTimer = setTimeout(() => {
      if (!isMouseNear.value) {
        isExpanding.value = false
        isHidden.value = true
      }
    }, 2200)
  }

  // Update active section
  const sections = ['tools', 'extensions'] as const
  let found = false
  for (const id of sections) {
    const rect = document.getElementById(id)?.getBoundingClientRect()
    if (rect && rect.top <= 150 && rect.bottom > 150) {
      emit('update:activeSection', id)
      found = true
      break
    }
  }
  if (!found && window.scrollY < 100) {
    emit('update:activeSection', 'home')
  }
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
  isMouseNear.value = true
  clearTimers()
  isHidden.value = false
  isExpanding.value = true
  expandTimer = setTimeout(() => { isExpanding.value = false }, 700)
}

const onLeave = () => {
  isMouseNear.value = false
  if (isScrolled.value) return
  hideTimer = setTimeout(() => {
    isExpanding.value = false
    isHidden.value = true
  }, 2200)
}

const scrollTo = (id: string) => {
  emit('scrollTo', id)
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })

  hideTimer = setTimeout(() => {
    if (!isMouseNear.value) isHidden.value = true
  }, 3000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  clearTimers()
})

// Expose for parent component
watch(() => props.activeSection, () => {
  nextTick(() => {
    // Allow parent to sync
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

.nav-island {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 10000;
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
  top: 0;
  width: 130px;
  height: 36px;
  padding: 0 18px;
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
  top: 14px;
  width: auto;
  min-width: 360px;
  max-width: min(520px, 92vw);
  height: 52px;
  padding: 0 6px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  transition: opacity .35s, transform .5s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.is-notch    .island-notch { opacity: 1; transform: scale(1) translateY(0); position: relative; }
.is-expanded .island-notch { opacity: 0; transform: scale(.6) translateY(-10px); position: absolute; }

.notch-camera  { width: 11px; height: 11px; border-radius: 50%; background: var(--notch-camera-bg);  flex-shrink: 0; transition: box-shadow .4s; }
.notch-speaker { width: 54px; height: 5px;  border-radius: 3px;  background: var(--notch-speaker-bg); flex-shrink: 0; transition: box-shadow .4s; }

/* Hover "Menu" hint */
.notch-hint {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%) translateY(-8px);
  font-family: 'DM Sans', sans-serif;
  font-size: .55rem;
  font-weight: 600;
  letter-spacing: .8px;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--nav-bg-mobile);
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity .25s ease, transform .25s cubic-bezier(0.34, 1.4, 0.64, 1);
  backdrop-filter: blur(8px);
}

.nav-island.is-notch:hover .notch-hint { opacity: 1; transform: translateX(-50%) translateY(0); }

/* Nav buttons */
.island-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  transition: opacity .35s, transform .5s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.is-notch    .island-nav { opacity: 0; transform: scale(.85) translateY(10px); pointer-events: none; position: absolute; }
.is-expanded .island-nav { opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; position: relative; }

.island-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
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
  display: flex;
  align-items: center;
  gap: 0;
  padding: .42rem .72rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: .8rem;
  font-weight: 400;
  letter-spacing: .15px;
  cursor: pointer;
  white-space: nowrap;
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
  overflow: hidden;
  max-width: 0;
  opacity: 0;
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
  padding: .56rem 1.2rem;
  font-size: .87rem;
  font-weight: 500;
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
  width: 15px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: filter .3s, color .3s;
}

.btn-icon svg { width: 100%; height: 100%; }

@media (max-width: 768px) {
  .nav-island { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .nav-island,
  .island-notch,
  .island-nav,
  .nav-btn,
  .btn-label,
  .island-pip {
    transition: none !important;
    animation: none !important;
  }
}
</style>
