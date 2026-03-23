<template>
  <footer>
    <div class="footer-content">
      <div class="footer-sections">
        <!-- Contact Section -->
        <div class="footer-section contact-section">
          <h3 class="footer-title">Connect With Us</h3>
          <div class="contact-options">
            <div 
              v-for="contact in contacts" 
              :key="contact.id"
              class="contact-card" 
              role="link" 
              :aria-label="contact.ariaLabel"
              @click="openLink(contact.url)"
            >
              <div class="contact-icon">
                <img :src="contact.icon" :alt="contact.alt" class="icon-img">
              </div>
              <span class="contact-title">{{ contact.title }}</span>
            </div>
          </div>
        </div>
        
        <!-- Brand Section -->
        <div class="footer-section brand-section">
          <h3 class="footer-title">Aemo Developer</h3>
          <p class="footer-description">MIT App Inventor Extensions & Developer Tools</p>
          <p class="footer-subtitle">Building better apps with powerful components</p>
        </div>
        
        <!-- Copyright Section -->
        <div class="footer-section copyright-section">
          <p class="copyright">&copy; <span id="current-year">{{ currentYear }}</span> AemoDev. All Rights Reserved.</p>
          <p class="made-with">Made with ❤️ by Mahmoud Hussien</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Contact {
  id: string
  title: string
  icon: string
  alt: string
  url: string
  ariaLabel: string
}

const currentYear = ref(new Date().getFullYear())

const contacts: Contact[] = [
  {
    id: 'ai2',
    title: 'MIT AI2',
    icon: '/assets/images/ai2-logo.png',
    alt: 'MIT App Inventor Logo',
    url: 'https://community.appinventor.mit.edu/u/mahmoud_hooda/summary',
    ariaLabel: 'Go to MIT AI2 Community'
  },
  {
    id: 'kodular',
    title: 'Kodular Community',
    icon: '/assets/images/kodular-logo.png',
    alt: 'Kodular Community Logo',
    url: 'https://community.kodular.io/u/mahmoud_hooda/summary',
    ariaLabel: 'Go to Kodular Community'
  },
  {
    id: 'telegram',
    title: 'Telegram',
    icon: '/assets/images/telegram-logo.webp',
    alt: 'Telegram Logo',
    url: 'https://t.me/+rc4zQLhKg_Y0MmE0',
    ariaLabel: 'Contact us via Telegram'
  }
]

const openLink = (url: string) => {
  // noopener prevents the opened page from accessing window.opener (reverse tabnapping)
  // noreferrer additionally hides the referrer header
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  // Update year in case component was created before new year
  currentYear.value = new Date().getFullYear()
})
</script>

<style scoped>
footer {
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: 3rem 2rem 2rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
  margin-top: 4rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-sections {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 1.5rem;
  font-family: 'Inter', sans-serif;
}

/* Contact Section */
.contact-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-color);
  border-color: var(--accent-primary);
}

.contact-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.contact-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

/* Brand Section */
.footer-description {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.footer-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
}

/* Copyright Section */
.copyright {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
  margin-bottom: 0.5rem;
}

.made-with {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: 'Inter', sans-serif;
}

@media (max-width: 768px) {
  footer {
    padding: 2rem 1rem;
  }
  
  .footer-sections {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .footer-section {
    align-items: center;
  }
  
  .contact-options {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .contact-card {
    min-width: 140px;
  }
  
  .footer-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .contact-options {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-card {
    min-width: 160px;
  }
}
</style>
