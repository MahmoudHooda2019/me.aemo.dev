<template>
  <section id="extensions" class="extensions-section section">
    <div class="grid-pattern"></div>
    <h2 class="section-title" data-aos="fade-up">Extensions</h2>
    
    <!-- Search Bar -->
    <div class="search-container" data-aos="fade-up">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search extensions by name or description..."
          aria-label="Search extensions"
        />
        <button
          v-if="searchQuery"
          class="search-clear"
          @click="searchQuery = ''"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <span v-if="searchQuery" class="search-results">
        {{ filteredExtensions.length }} result{{ filteredExtensions.length !== 1 ? 's' : '' }}
      </span>
    </div>

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
    
    <div v-else-if="filteredExtensions.length === 0" class="no-results">
      <p>No extensions found matching "{{ searchQuery }}"</p>
      <button class="clear-search-btn" @click="searchQuery = ''">Clear Search</button>
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
const searchQuery = ref('')
const displayedCount = ref(0)
const batchSize = 12
const error = ref('')

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' }
]

const filteredExtensions = computed(() => {
  let result = extensions.value
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(ext => 
      ext.title.toLowerCase().includes(query) || 
      ext.subtitle.toLowerCase().includes(query)
    )
  }
  
  // Filter by price filter
  if (currentFilter.value !== 'all') {
    result = result.filter(ext => {
      const price = ext.price.toLowerCase()
      if (currentFilter.value === 'free') {
        return price === 'free' || price.includes('free')
      } else if (currentFilter.value === 'paid') {
        return price.includes('$') || price.includes('paid') || !price.includes('free')
      }
      return false
    })
  }
  
  return result
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
  margin-bottom: 2rem;
  font-family: 'Inter', sans-serif;
}

/* Search container */
.search-container {
  max-width: 600px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 3rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 25px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: rgba(187, 134, 252, 0.1);
  color: var(--accent-primary);
}

.search-clear svg {
  width: 16px;
  height: 16px;
}

.search-results {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
}

/* No results */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin: 2rem 0;
}

.no-results p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-family: 'Inter', sans-serif;
}

.clear-search-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  border: none;
  color: var(--bg-secondary);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px var(--shadow-color);
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
    margin-bottom: 1.5rem;
  }

  .search-container {
    max-width: 100%;
    margin-bottom: 1.5rem;
  }

  .search-input {
    padding: 0.75rem 2.25rem 0.75rem 2.75rem;
    font-size: 0.95rem;
  }

  .search-icon {
    left: 0.875rem;
    width: 18px;
    height: 18px;
  }

  .search-clear {
    right: 0.5rem;
    width: 26px;
    height: 26px;
  }
  
  .card-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .no-results {
    padding: 2rem 1rem;
  }
}
</style>
