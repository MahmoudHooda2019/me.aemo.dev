<template>
  <section id="extensions" class="extensions-section section">
    <h2 class="section-title" data-aos="fade-up">Extensions</h2>
    
    <div class="filter-buttons" data-aos="fade-up">
      <button 
        v-for="filter in filterOptions" 
        :key="filter.value"
        class="filter-btn" 
        :class="{ active: currentFilter === filter.value }"
        @click="handleFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryLoading">Retry</button>
    </div>
    
    <div v-else class="card-container">
      <ExtensionCard
        v-for="extension in displayedExtensions"
        :key="extension.id"
        :extension="extension"
        @click="navigateToExtension(extension.id)"
      />
    </div>
    
    <div v-if="hasMoreExtensions" class="load-more-container">
      <button class="load-more-btn" @click="loadMore" aria-label="Load more extensions">
        Load More
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useExtensions } from '@/composables/useExtensions'
import ExtensionCard from './ExtensionCard.vue'

const { 
  extensions, 
  loadExtensions
} = useExtensions()

const currentFilter = ref('all')
const displayedCount = ref(0)
const batchSize = 12
const error = ref('')

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' }
]

const filteredExtensions = computed(() => {
  if (currentFilter.value === 'all') {
    return extensions.value
  }
  return extensions.value.filter(ext => {
    const price = ext.price.toLowerCase()
    if (currentFilter.value === 'free') {
      return price === 'free' || price.includes('free')
    } else if (currentFilter.value === 'paid') {
      return price.includes('$') || price.includes('paid') || !price.includes('free')
    }
    return false
  })
})

const displayedExtensions = computed(() => {
  return filteredExtensions.value.slice(0, displayedCount.value)
})

const hasMoreExtensions = computed(() => {
  return displayedCount.value < filteredExtensions.value.length
})

const handleFilter = (filter: string) => {
  currentFilter.value = filter
  displayedCount.value = Math.min(batchSize, filteredExtensions.value.length)
}

const loadMore = () => {
  const newCount = displayedCount.value + batchSize
  displayedCount.value = Math.min(newCount, filteredExtensions.value.length)
}

const navigateToExtension = (id: string) => {
  window.location.href = `extensions/template.html?id=${id}`
}

const retryLoading = async () => {
  error.value = ''
  try {
    await loadExtensions()
    displayedCount.value = Math.min(batchSize, extensions.value.length)
  } catch (err) {
    error.value = 'Failed to load extensions'
  }
}

onMounted(async () => {
  try {
    await loadExtensions()
    displayedCount.value = Math.min(batchSize, extensions.value.length)
  } catch (err) {
    error.value = 'Failed to load extensions'
  }
})

watch(filteredExtensions, (newFiltered) => {
  displayedCount.value = Math.min(batchSize, newFiltered.length)
})
</script>

<style scoped>
.extensions-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
}

.filter-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--accent-primary);
  background: transparent;
  color: var(--accent-primary);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.filter-btn:hover {
  background: rgba(187, 134, 252, 0.1);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: var(--accent-primary);
  color: var(--bg-secondary);
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.load-more-container {
  text-align: center;
}

.load-more-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border: none;
  color: var(--bg-secondary);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.load-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px var(--shadow-color);
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  margin: 2rem 0;
}

.error-message button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .extensions-section {
    padding: 2rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .card-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
