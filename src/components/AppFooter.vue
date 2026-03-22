<template>
  <footer>
    <div class="footer-content">
      <p>&copy; <span id="current-year">{{ currentYear }}</span> AemoDev. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const currentYear = ref(new Date().getFullYear())

onMounted(() => {
  // Update year in case component was created before new year
  currentYear.value = new Date().getFullYear()
})
</script>

<style scoped>
footer {
  background: linear-gradient(135deg, #0a0a0a 0%, #121212 100%);
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #333;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content p {
  color: #888;
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

@media (max-width: 768px) {
  footer {
    padding: 1.5rem 1rem;
  }
  
  .footer-content p {
    font-size: 0.85rem;
  }
}
</style>
