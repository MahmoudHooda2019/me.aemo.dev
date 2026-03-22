import { createApp } from 'vue'
import App from './App.vue'
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

createApp(App).mount('#app')
