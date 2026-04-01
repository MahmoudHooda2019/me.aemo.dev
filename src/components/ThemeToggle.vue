<template>
  <button
    class="theme-toggle"
    :class="{ spinning: isSpinning }"
    @click="handleToggle"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <span class="theme-icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
    <span class="theme-ripple" :class="{ active: isSpinning }"></span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
const isSpinning = ref(false)

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const handleToggle = () => {
  isSpinning.value = true
  toggleTheme()
  emit('toggle')
  setTimeout(() => { isSpinning.value = false }, 800)
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 22px;
  right: 24px;
  z-index: 10001;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  cursor: pointer;
  overflow: visible;
  box-shadow: 0 4px 18px rgba(0,0,0,.3);
  transition: border-color .25s, box-shadow .25s, transform .25s;
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

.theme-toggle.spinning {
  animation: spinOnce .7s cubic-bezier(0.4,0,.2,1) forwards;
}

.theme-icon {
  font-size: 1.2rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.theme-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, var(--shadow-color) 0%, transparent 70%);
  opacity: 0;
  transform: scale(.4);
  pointer-events: none;
}

.theme-ripple.active {
  animation: rippleOut .75s ease-out forwards;
}

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

@media (max-width: 768px) {
  .theme-toggle {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .theme-toggle {
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle {
    transition: none !important;
    animation: none !important;
  }
}
</style>
