import { ref, computed } from 'vue'
import type { Tool, ToolDifficulty } from '@/types/tools'
import { ToolCategory } from '@/types/tools'

const tools = ref<Tool[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useTools() {
  const loadTools = async (): Promise<Tool[]> => {
    if (tools.value.length > 0) return tools.value
    if (isLoading.value) {
      // Return empty array while loading
      return []
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('/tools.json', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Tools data must be an array')
      }
      
      // Convert JSON data to Tool interface
      const convertedTools: Tool[] = data.map(item => ({
        ...item,
        category: item.category as ToolCategory,
        difficulty: item.difficulty as ToolDifficulty
      }))
      
      tools.value = convertedTools
      return convertedTools
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = `Failed to load tools: ${errorMessage}`
      console.error('Error loading tools:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getToolsByCategory = (category: ToolCategory | 'all'): Tool[] => {
    if (category === 'all') return tools.value
    return tools.value.filter(tool => tool.category === category)
  }

  const getToolById = (id: string): Tool | undefined => {
    return tools.value.find(tool => tool.id === id)
  }

  const searchTools = (query: string): Tool[] => {
    if (!query.trim()) return tools.value
    
    const searchQuery = query.toLowerCase()
    return tools.value.filter(tool => 
      tool.title.toLowerCase().includes(searchQuery) ||
      tool.subtitle.toLowerCase().includes(searchQuery) ||
      tool.description.toLowerCase().includes(searchQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    )
  }

  const getCategories = (): (ToolCategory | 'all')[] => {
    return ['all', ToolCategory.ENCODING, ToolCategory.URL, ToolCategory.DEVELOPMENT, ToolCategory.UTILITY, ToolCategory.SECURITY]
  }

  const getCategoryLabel = (category: ToolCategory | 'all'): string => {
    const labels: Record<ToolCategory | 'all', string> = {
      all: 'All Tools',
      [ToolCategory.ENCODING]: 'Encoding',
      [ToolCategory.URL]: 'URL Tools',
      [ToolCategory.DEVELOPMENT]: 'Development',
      [ToolCategory.UTILITY]: 'Utilities',
      [ToolCategory.SECURITY]: 'Security'
    }
    return labels[category]
  }

  const getDifficultyClass = (difficulty: ToolDifficulty): string => {
    return `difficulty-${difficulty.toLowerCase()}`
  }

  const retryLoad = () => {
    tools.value = []
    error.value = null
    return loadTools()
  }

  return {
    tools: computed(() => tools.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadTools,
    getToolsByCategory,
    getToolById,
    searchTools,
    getCategories,
    getCategoryLabel,
    getDifficultyClass,
    retryLoad
  }
}
