<template>
  <header>
    <!-- Splash Section -->
    <section class="splash-section">
      <div class="splash-container">
        <div class="logo" role="banner" aria-label="Aemo Developer Logo">Aemo Developer</div>
        <div class="tagline" aria-live="polite">
          <pre>
⠛⠛⣿⣿⣿⣿⣿⡷⢶⣦⣶⣶⣤⣤⣤⣀⠀⠀⠀
 ⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀
 ⠀⠀⠀⠉⠉⠉⠙⠻⣿⣿⠿⠿⠛⠛⠛⠻⣿⣿⣇⠀
 ⠀⠀⢤⣀⣀⣀⠀⠀⢸⣷⡄⠀⣁⣀⣤⣴⣿⣿⣿⣆
 ⠀⠀⠀⠀⠹⠏⠀⠀⠀⣿⣧⠀⠹⣿⣿⣿⣿⣿⡿⣿
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠿⠇⢀⣼⣿⣿⠛⢯⡿⡟
 ⠀⠀⠀⠀⠀⠀⠀⠀⠦⠴⢿⢿⣿⡿⠷⠀⣿⠀
 ⠀⠀⠀⠀⠀⠙⣷⣶⣶⣤⣤⣤⣤⣶⣦⠃⠀
 ⠀⠀⠀⠀⠀⢐⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀
 ⠀⠀⠀⠀⠀⠈⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀
 ⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⠟⠁
                  </pre>
        </div>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
// Header component with splash section
</script>

<style scoped>
.splash-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
  position: relative;
  overflow: hidden;
}

.splash-container {
  text-align: center;
  z-index: 2;
}

.logo {
  font-family: 'Orbitron', monospace;
  font-size: 3.5rem;
  font-weight: 700;
  color: #bb86fc;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(187, 134, 252, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px rgba(187, 134, 252, 0.5); }
  to { text-shadow: 0 0 30px rgba(187, 134, 252, 0.8), 0 0 40px rgba(187, 134, 252, 0.6); }
}

.tagline {
  font-family: 'JetBrains Mono', monospace;
  color: #00ffcc;
  font-size: 0.8rem;
  line-height: 1;
  opacity: 0.9;
}

.tagline pre {
  margin: 0;
  white-space: pre;
  letter-spacing: 0.1em;
}
</style>
