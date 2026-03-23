<template>
  <section id="tools" class="tools-section section">
    <h2 class="section-title" data-aos="fade-up">Tools</h2>
    <div class="card-container">
      <a 
        v-for="tool in tools" 
        :key="tool.id"
        :href="tool.url" 
        class="card" 
        style="text-decoration:none;color:inherit;"
        data-aos="fade-up"
      >
        <div class="card-content">
          <div class="card-title">{{ tool.title }}</div>
          <div class="card-subtitle">{{ tool.subtitle }}</div>
        </div>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Tool {
  id: string
  title: string
  subtitle: string
  url: string
}

const tools: Tool[] = [
  {
    id: 'deeplink',
    title: 'Deep Link',
    subtitle: 'Easily generate and handle deep links for your apps.',
    url: 'tools/deeplink/'
  },
  {
    id: 'base64',
    title: 'Base64 Encode & Decode',
    subtitle: 'Convert text or files to and from Base64 encoding.',
    url: 'tools/base64/'
  }
]
</script>

<style scoped>
.tools-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--bg-card);
  position: relative;
  z-index: 1;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--accent-secondary);
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-secondary), var(--accent-primary));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.card:hover::before {
  transform: scaleX(1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px var(--shadow-color-alt);
  border-color: var(--accent-secondary);
}

.card-content {
  text-align: center;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-family: 'Inter', sans-serif;
}

.card-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 768px) {
  .tools-section {
    padding: 2rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .card-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .card {
    padding: 1.5rem;
  }
}
</style>
