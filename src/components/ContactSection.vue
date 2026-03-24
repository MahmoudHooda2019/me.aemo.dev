<template>
  <section id="contact" class="contact-section section">
    <div class="grid-pattern"></div>
    <h2 class="section-title" data-aos="fade-up">Contact Us</h2>
    <div class="contact-options">
      <div 
        v-for="contact in contacts" 
        :key="contact.id"
        class="contact-card" 
        role="link" 
        :aria-label="contact.ariaLabel"
        @click="openLink(contact.url)"
        data-aos="fade-up"
      >
        <div class="contact-icon">
          <img :src="contact.icon" :alt="contact.alt" class="icon-img">
        </div>
        <span class="contact-title">{{ contact.title }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Contact {
  id: string
  title: string
  icon: string
  alt: string
  url: string
  ariaLabel: string
}

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
</script>

<style scoped>
.contact-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
}

.contact-options {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
  position: relative;
  overflow: hidden;
}

.contact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(187, 134, 252, 0.1), rgba(3, 218, 198, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.contact-card:hover::before {
  opacity: 1;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px var(--shadow-color);
  border-color: var(--accent-primary);
}

.contact-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(187, 134, 252, 0.1);
  padding: 0.5rem;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.contact-card:hover .icon-img {
  transform: scale(1.1);
}

.contact-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .contact-section {
    padding: 2rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .contact-options {
    gap: 1rem;
  }
  
  .contact-card {
    padding: 1.5rem;
    min-width: 120px;
  }
  
  .contact-icon {
    width: 50px;
    height: 50px;
  }
}
</style>
