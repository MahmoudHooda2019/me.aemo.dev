import { ref } from 'vue'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'aemo-theme'

// Module-level singleton so all components share the same reactive state
const theme = ref<Theme>('dark')

function applyTheme(t: Theme): void {
  document.documentElement.setAttribute('data-theme', t)
  theme.value = t
}

export function useTheme() {
  /**
   * Call once on app mount.
   * Priority: localStorage → prefers-color-scheme → dark fallback
   */
  const initTheme = (): void => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'dark' : 'light')
    }
  }

  /** Toggle between dark and light, persisting the choice. */
  const toggleTheme = (): void => {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage may be unavailable in private browsing — ignore silently
    }
  }

  return { theme, initTheme, toggleTheme }
}
