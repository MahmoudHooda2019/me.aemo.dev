import { ref, computed } from 'vue'
import type { Extension } from '@/types/extension'
import extensionsData from '@/data/extensions.json'

// Store extensions data
const extensions = ref<Extension[]>([])
const isLoading = ref(false)

let loadingPromise: Promise<Extension[]> | null = null

const bundledExtensions = extensionsData as Extension[]

export const useExtensions = () => {
  const loadExtensions = async (): Promise<Extension[]> => {
    if (extensions.value.length > 0) return extensions.value
    if (loadingPromise) return loadingPromise

    loadingPromise = (async (): Promise<Extension[]> => {
      isLoading.value = true

      try {
        if (!Array.isArray(bundledExtensions)) {
          throw new Error('Extensions data must be an array')
        }
        
        extensions.value = bundledExtensions
        isLoading.value = false
        return extensions.value

      } catch (error) {
        isLoading.value = false
        console.error('Failed to load bundled extensions:', error)
        throw error
      }
  })()

  try {
    return await loadingPromise
  } finally {
    loadingPromise = null
  }
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
  if (!lastUpdated) return false

  const lastUpdatedDate = new Date(lastUpdated)
  if (Number.isNaN(lastUpdatedDate.getTime())) return false

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
