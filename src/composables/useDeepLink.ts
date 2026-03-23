import { ref, computed } from 'vue'
import type { DeepLinkData, ParsedDeepLink, ValidationResult, ToolError } from '@/types/tools'

export function useDeepLink() {
  const deepLinkData = ref<DeepLinkData>({
    scheme: 'myapp',
    host: '',
    path: '',
    params: {}
  })
  
  const parsedLink = ref<ParsedDeepLink | null>(null)
  const generatedLink = ref('')
  const errors = ref<ToolError[]>([])

  const isValidScheme = computed(() => {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*$/.test(deepLinkData.value.scheme)
  })

  const isValidHost = computed(() => {
    if (!deepLinkData.value.host) return true // Optional
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(deepLinkData.value.host)
  })

  const isValidPath = computed(() => {
    if (!deepLinkData.value.path) return true // Optional
    return /^\/[a-zA-Z0-9/._-]*$/.test(deepLinkData.value.path)
  })

  const validateDeepLinkData = (): ValidationResult => {
    const newErrors: ToolError[] = []

    if (!deepLinkData.value.scheme) {
      newErrors.push({
        code: 'MISSING_SCHEME',
        message: 'Scheme is required'
      })
    } else if (!isValidScheme.value) {
      newErrors.push({
        code: 'INVALID_SCHEME',
        message: 'Scheme must start with a letter and contain only letters, numbers, dots, hyphens, and plus signs'
      })
    }

    if (deepLinkData.value.host && !isValidHost.value) {
      newErrors.push({
        code: 'INVALID_HOST',
        message: 'Host must be a valid domain name'
      })
    }

    if (deepLinkData.value.path && !isValidPath.value) {
      newErrors.push({
        code: 'INVALID_PATH',
        message: 'Path must start with / and contain only valid characters'
      })
    }

    errors.value = newErrors
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    }
  }

  const generateDeepLink = (): boolean => {
    const validation = validateDeepLinkData()
    
    if (!validation.isValid) {
      return false
    }

    try {
      let url = deepLinkData.value.scheme + '://'
      
      if (deepLinkData.value.host) {
        url += deepLinkData.value.host
      }
      
      if (deepLinkData.value.path) {
        url += deepLinkData.value.path
      }

      if (deepLinkData.value.params && Object.keys(deepLinkData.value.params).length > 0) {
        const searchParams = new URLSearchParams()
        
        for (const [key, value] of Object.entries(deepLinkData.value.params)) {
          if (key && value) {
            searchParams.append(key, value)
          }
        }
        
        url += '?' + searchParams.toString()
      }

      generatedLink.value = url
      return true
    } catch (error) {
      errors.value.push({
        code: 'GENERATION_ERROR',
        message: 'Failed to generate deep link',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const parseDeepLink = (url: string): boolean => {
    errors.value = []
    
    if (!url) {
      errors.value.push({
        code: 'MISSING_URL',
        message: 'Please enter a deep link URL'
      })
      return false
    }

    try {
      // Check if it's a valid URL format
      if (!url.includes('://')) {
        errors.value.push({
          code: 'INVALID_FORMAT',
          message: 'URL must contain a scheme (e.g., myapp://)'
        })
        return false
      }

      const parsedUrl = new URL(url)
      
      parsedLink.value = {
        scheme: parsedUrl.protocol.replace(':', ''),
        host: parsedUrl.hostname || undefined,
        port: parsedUrl.port || undefined,
        path: parsedUrl.pathname,
        params: {}
      }

      parsedUrl.searchParams.forEach((value, key) => {
        if (parsedLink.value) {
          parsedLink.value.params[key] = value
        }
      })

      // Update form with parsed data
      deepLinkData.value = {
        scheme: parsedLink.value.scheme,
        host: parsedLink.value.host || '',
        path: parsedLink.value.path || '',
        params: parsedLink.value.params
      }

      return true
    } catch (error) {
      errors.value.push({
        code: 'PARSE_ERROR',
        message: 'Invalid deep link URL format',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const updateParams = (paramsText: string) => {
    try {
      if (!paramsText.trim()) {
        deepLinkData.value.params = {}
        return
      }

      const params = JSON.parse(paramsText)
      if (typeof params === 'object' && params !== null) {
        deepLinkData.value.params = params
      } else {
        throw new Error('Parameters must be an object')
      }
    } catch (error) {
      errors.value.push({
        code: 'INVALID_PARAMS',
        message: 'Parameters must be valid JSON format',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const getParamsAsText = computed(() => {
    if (!deepLinkData.value.params || Object.keys(deepLinkData.value.params).length === 0) {
      return ''
    }
    return JSON.stringify(deepLinkData.value.params, null, 2)
  })

  const clearAll = () => {
    deepLinkData.value = {
      scheme: 'myapp',
      host: '',
      path: '',
      params: {}
    }
    parsedLink.value = null
    generatedLink.value = ''
    errors.value = []
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  }

  return {
    deepLinkData,
    parsedLink,
    generatedLink,
    errors,
    isValidScheme,
    isValidHost,
    isValidPath,
    getParamsAsText,
    generateDeepLink,
    parseDeepLink,
    updateParams,
    clearAll,
    copyToClipboard,
    validateDeepLinkData
  }
}
