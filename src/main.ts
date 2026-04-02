import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AOS from 'aos'
import 'aos/dist/aos.css'
import 'pace-js'
import 'pace-js/themes/blue/pace-theme-minimal.css'
import './styles/main.css'

// Initialize AOS
AOS.init({
  duration: 800,
  once: true,
  offset: 100,
  delay: 100
})

const app = createApp(App)
app.use(router)
app.mount('#app')

// Register service worker from the module bundle (avoids inline script / CSP issues)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      // SW registration failure is non-critical — silently ignore
    })
  })
}
