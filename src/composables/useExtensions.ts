import { ref, computed } from 'vue'
import type { Extension } from '@/types/extension'

// Store extensions data
const extensions = ref<Extension[]>([])
const isLoading = ref(false)
const loadAttempts = ref(0)
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

export const useExtensions = () => {
  const loadExtensions = async (): Promise<Extension[]> => {
    if (extensions.value.length > 0) return extensions.value
    if (isLoading.value) {
      while (isLoading.value) {
        await delay(100)
      }
      return extensions.value
    }
    
    isLoading.value = true
    
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch('/extensions/extensions.json', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!Array.isArray(data)) {
          throw new Error('Extensions data must be an array')
        }
        
        extensions.value = data
        loadAttempts.value = 0
        isLoading.value = false
        console.log(`Successfully loaded ${extensions.value.length} extensions`)
        return extensions.value
        
      } catch (error) {
        console.warn(`Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, (error as Error).message)
        
        if (attempt === MAX_RETRY_ATTEMPTS) {
          isLoading.value = false
          loadAttempts.value = attempt
          console.error('Failed to load extensions after all retry attempts:', error)
          return []
        }
        
        await delay(RETRY_DELAY * attempt)
      }
    }
    
    return []
  }

  const setExtensions = (data: Extension[]): void => {
    extensions.value = data
  }

  const getAllExtensions = (): Extension[] => extensions.value

  const getExtensionsByFilter = (filter: string): Extension[] => {
    if (filter === 'all') return extensions.value
    return extensions.value.filter(ext => ext.filters && ext.filters.includes(filter))
  }

  const getExtensionById = async (id: string): Promise<Extension | undefined> => {
    if (extensions.value.length === 0) {
      await loadExtensions()
    }
    return extensions.value.find(ext => ext.id === id)
  }

  const isNewExtension = (lastUpdated: string): boolean => {
    const lastUpdatedDate = new Date(lastUpdated)
    const today = new Date()
    const diffDays = (today.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 10
  }

  const getExtensionTags = (extension: Extension): string[] => {
    const tags = [...(extension.tags || extension.filters || [])]
    if (isNewExtension(extension.lastUpdated)) {
      tags.push('NEW')
    }
    return tags
  }

  return {
    extensions: computed(() => extensions.value),
    isLoading: computed(() => isLoading.value),
    loadExtensions,
    setExtensions,
    getAllExtensions,
    getExtensionsByFilter,
    getExtensionById,
    getExtensionTags,
    isNewExtension
  }
}
