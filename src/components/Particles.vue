<template>
  <div class="particles" aria-hidden="true"></div>
</template>

<script setup lang="ts">
import { useParticleSystem } from '@/composables/useParticleSystem'

// Initialize particle system
useParticleSystem()
</script>

<style scoped>
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}
</style>
