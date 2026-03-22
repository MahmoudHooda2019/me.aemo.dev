<template>
  <article class="card" @click="$emit('click')">
    <div class="price-tag" :class="{ paid: isPaid, free: !isPaid }">
      {{ extension.price }}
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ extension.title }}</h3>
      <p class="card-subtitle">{{ extension.subtitle }}</p>
      <div class="card-tags">
        <span 
          v-for="tag in tags" 
          :key="tag" 
          class="card-tag"
          :class="{ 'new-tag': tag === 'NEW' }"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useExtensions } from '@/composables/useExtensions'
import type { Extension } from '@/types/extension'

interface Props {
  extension: Extension
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const { getExtensionTags } = useExtensions()

const isPaid = computed(() => props.extension.price !== 'Free')
const tags = computed(() => getExtensionTags(props.extension))
</script>

<style scoped>
.card {
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(187, 134, 252, 0.2);
  border-color: #bb86fc;
}

.price-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-tag.free {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.price-tag.paid {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.card-content {
  margin-top: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
  line-height: 1.3;
}

.card-subtitle {
  color: #b0b0b0;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
  font-family: 'Inter', sans-serif;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-tag {
  padding: 0.25rem 0.5rem;
  background: rgba(187, 134, 252, 0.1);
  color: #bb86fc;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(187, 134, 252, 0.3);
  transition: all 0.2s ease;
}

.card-tag:hover {
  background: rgba(187, 134, 252, 0.2);
  transform: scale(1.05);
}

.card-tag.new-tag {
  background: linear-gradient(135deg, #ff4081, #f50057);
  color: white;
  border-color: #ff4081;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .card-subtitle {
    font-size: 0.85rem;
  }
}
</style>
