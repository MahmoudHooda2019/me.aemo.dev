<template>
  <div class="mobile-nav">
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

// State
const menuOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const triggerWidth = ref(114)

let unwatchTrigger: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null

// Nav items
const navItems = [
  {
    id: 'home' as const,
    scrollId: 'top',
    label: 'Home',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    id: 'tools' as const,
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

const currentItem = computed(() => navItems.find(i => i.id === props.activeSection) ?? navItems[0])
const otherItems = computed(() => navItems.filter(i => i.id !== props.activeSection))

// Menu controls
const toggleMenu = () => { menuOpen.value = !menuOpen.value }
const closeMenu = () => { menuOpen.value = false }

const selectSection = (item: typeof navItems[number]) => {
  closeMenu()
  setTimeout(() => {
    emit('update:activeSection', item.id)
    emit('scrollTo', item.scrollId)
  }, 80)
}

// Trigger width measurement
const measureTrigger = () => {
  if (triggerRef.value) {
    triggerWidth.value = triggerRef.value.getBoundingClientRect().width
  }
}

// Lifecycle
onMounted(() => {
  if (triggerRef.value) {
    resizeObserver = new ResizeObserver(measureTrigger)
    resizeObserver.observe(triggerRef.value)
    measureTrigger()
  }

  unwatchTrigger = watch(() => props.activeSection, () => nextTick(measureTrigger))
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  unwatchTrigger?.()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

.mobile-nav {
  display: none;
}

/* Backdrop */
.m-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10005;
  background: var(--backdrop-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.backdrop-fade-enter-active { transition: opacity .25s ease; }
.backdrop-fade-leave-active { transition: opacity .2s ease; }
.backdrop-fade-enter-from,
.backdrop-fade-leave-to { opacity: 0; }

/* Trigger pill */
.m-trigger {
  display: flex;
  position: fixed;
  top: 16px;
  right: 64px;
  z-index: 10010;
  height: 40px;
  padding: 0 14px 0 10px;
  border-radius: 999px;
  border: 1.5px solid var(--border-color);
  background: var(--nav-bg-mobile);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  align-items: center;
  justify-content: center;
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
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  min-width: 0;
}

.m-trigger-inner {
  display: flex;
  align-items: center;
  gap: 7px;
  pointer-events: none;
}

/* Section swap transitions */
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
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .4px;
  text-transform: uppercase;
  line-height: 1;
}

.m-trigger.accent-home       .m-trigger-label,
.m-trigger.accent-tools      .m-trigger-label { color: var(--accent-primary); }
.m-trigger.accent-extensions .m-trigger-label { color: var(--accent-secondary); }
[data-theme='light'] .m-trigger .m-trigger-label { color: var(--text-primary); }

/* Section bubbles */
.m-section-bubbles {
  display: flex;
  position: fixed;
  top: 16px;
  right: calc(64px + var(--m-trigger-w, 114px) + 8px);
  z-index: 10006;
  height: 40px;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.m-section-bubbles.open { pointer-events: auto; }

.m-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1.5px solid var(--border-color);
  background: var(--nav-bg-mobile);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  box-shadow: 0 4px 16px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06);
  opacity: 0;
  transform: translateX(14px) scale(0.65);
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
  max-width: 60px;
  opacity: 1;
  margin-left: 4px;
}

.m-bubble-label {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
  font-size: .6rem;
  font-weight: 600;
  letter-spacing: .3px;
  text-transform: uppercase;
  transition: max-width .25s ease, opacity .2s ease, margin-left .25s ease;
}

.m-bubble-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .mobile-nav { display: block; }
}

@media (max-width: 480px) {
  .m-trigger {
    top: 14px;
    right: 60px;
    height: 38px;
    padding: 0 12px 0 9px;
  }

  .m-section-bubbles {
    top: 14px;
    right: calc(60px + var(--m-trigger-w, 108px) + 8px);
    height: 38px;
    gap: 5px;
  }

  .m-bubble { width: 38px; height: 38px; }
  .m-trigger-icon,
  .m-bubble-icon { width: 18px; height: 18px; }
  .m-trigger-label { font-size: .66rem; }
  .m-bubble-label { font-size: .55rem; }
}

@media (prefers-reduced-motion: reduce) {
  .m-trigger,
  .m-bubble,
  .m-trigger-inner,
  .m-trigger-ring,
  .section-swap-enter-active,
  .section-swap-leave-active,
  .x-fade-enter-active,
  .x-fade-leave-active {
    transition: none !important;
    animation: none !important;
  }
}
</style>
