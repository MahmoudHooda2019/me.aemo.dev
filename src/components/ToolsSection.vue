<template>
  <section id="tools" class="tools-section section">
    <div class="grid-pattern"></div>
    <h2 class="section-title" data-aos="fade-up">Developer Tools</h2>
    <p class="section-subtitle" data-aos="fade-up">Free utilities to enhance your development workflow</p>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading tools...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load tools</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadTools">Retry</button>
    </div>

    <!-- Tools Content -->
    <template v-else>
      <!-- Category Filter -->
      <div class="category-filter" data-aos="fade-up">
        <button 
          v-for="category in categories" 
          :key="category"
          class="category-btn"
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = category"
        >
          {{ getCategoryLabel(category) }}
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-container" data-aos="fade-up">
        <div class="search-box">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search tools..."
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <!-- Tools Grid -->
      <div class="card-container">
        <div 
          v-for="tool in filteredTools" 
          :key="tool.id"
          class="card" 
          :class="{ 'coming-soon': tool.comingSoon }"
          @click="!tool.comingSoon && navigateToTool(tool.url)"
          data-aos="fade-up"
          :data-aos-delay="getAosDelay(tool)"
        >
          <div v-if="tool.comingSoon" class="coming-soon-overlay">
            <span class="coming-soon-badge">Coming Soon</span>
          </div>
          <div class="card-header">
            <div class="card-icon">{{ tool.icon }}</div>
            <div class="card-badge" :class="getDifficultyClass(tool.difficulty)">
              {{ tool.difficulty }}
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ tool.title }}</h3>
            <p class="card-subtitle">{{ tool.subtitle }}</p>
            <p class="card-description">{{ tool.description }}</p>
            
            <div class="card-features">
              <span 
                v-for="feature in tool.features.slice(0, 3)" 
                :key="feature"
                class="feature-tag"
              >
                ✓ {{ feature }}
              </span>
              <span v-if="tool.features.length > 3" class="feature-more">
                +{{ tool.features.length - 3 }} more
              </span>
            </div>
            
            <div class="card-tags">
              <span 
                v-for="tag in tool.tags" 
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          
          <div class="card-footer">
            <span class="card-link">{{ tool.comingSoon ? 'Coming Soon' : 'Open Tool →' }}</span>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredTools.length === 0" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No tools found</h3>
        <p>Try adjusting your search or filter criteria</p>
        <button class="reset-btn" @click="resetFilters">Reset Filters</button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Tool } from '@/types/tools'
import { ToolCategory, ToolDifficulty } from '@/types/tools'
import { useTools } from '@/composables/useTools'

const selectedCategory = ref<ToolCategory | 'all'>('all')
const searchQuery = ref('')

const {
  tools,
  isLoading,
  error,
  loadTools,
  getToolsByCategory: _getToolsByCategory,
  searchTools: _searchTools,
  getCategories,
  getCategoryLabel: getCategoryLabelFromComposable,
  getDifficultyClass: getDifficultyClassFromComposable
} = useTools()

const filteredTools = computed(() => {
  let filtered = tools.value

  // Filter by category first
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(tool => tool.category === selectedCategory.value)
  }

  // Then filter by search query on the category-filtered subset
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.subtitle.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

const categories = computed(() => getCategories())

const getCategoryLabel = (category: ToolCategory | 'all'): string => {
  return getCategoryLabelFromComposable(category)
}

const getDifficultyClass = (difficulty: ToolDifficulty): string => {
  return getDifficultyClassFromComposable(difficulty)
}

const getAosDelay = (tool: Tool): number => {
  const index = filteredTools.value.indexOf(tool)
  return index * 100
}

const navigateToTool = (url: string) => {
  window.location.href = url
}

const resetFilters = () => {
  selectedCategory.value = 'all'
  searchQuery.value = ''
}

onMounted(async () => {
  await loadTools()
})
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
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.section-subtitle {
  text-align: center;
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  font-family: 'Inter', sans-serif;
}

/* Category Filter */
.category-filter {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.category-btn {
  padding: 0.75rem 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.category-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.category-btn.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

/* Search Bar */
.search-container {
  max-width: 500px;
  margin: 0 auto 3rem;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 25px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

/* Tools Grid */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-icon {
  font-size: 2.5rem;
  display: block;
}

.card-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-beginner {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.difficulty-intermediate {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.difficulty-advanced {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-family: 'Inter', sans-serif;
}

.card-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  font-family: 'Inter', sans-serif;
}

.card-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: rgba(3, 218, 198, 0.1);
  color: var(--accent-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.feature-more {
  background: rgba(187, 134, 252, 0.1);
  color: var(--accent-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  border: 1px solid var(--border-color);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-link {
  color: var(--accent-primary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.card:hover .card-link {
  transform: translateX(5px);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.error-state h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #f44336;
}

.retry-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.reset-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(187, 134, 252, 0.3);
}

.card.coming-soon {
  cursor: not-allowed;
  opacity: 0.7;
}

.card.coming-soon:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--border-color);
}

.card.coming-soon:hover::before {
  transform: scaleX(0);
}

.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 16px;
}

.coming-soon-badge {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  
  .category-filter {
    gap: 0.5rem;
  }
  
  .category-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
