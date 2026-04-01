import { ref, computed } from 'vue'
import type { Base64Operation, ValidationResult, ToolError } from '@/types/tools'

export function useBase64() {
  const textInput = ref('')
  const textOutput = ref('')
  const selectedFile = ref<File | null>(null)
  const fileOutput = ref('')
  const activeTab = ref<'encode' | 'decode'>('encode')
  const activeFileTab = ref<'encode' | 'decode'>('encode')
  const errors = ref<ToolError[]>([])
  const history = ref<Base64Operation[]>([])

  const isValidBase64 = computed(() => {
    try {
      return textInput.value && btoa(atob(textInput.value)) === textInput.value
    } catch {
      return false
    }
  })

  const validateTextInput = (): ValidationResult => {
    const newErrors: ToolError[] = []

    if (!textInput.value.trim()) {
      newErrors.push({
        code: 'MISSING_INPUT',
        message: 'Please enter text to process'
      })
    }

    if (activeTab.value === 'decode' && !isValidBase64.value) {
      newErrors.push({
        code: 'INVALID_BASE64',
        message: 'Invalid Base64 format'
      })
    }

    errors.value = newErrors
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    }
  }

  const validateFileInput = (): ValidationResult => {
    const newErrors: ToolError[] = []

    if (!selectedFile.value) {
      newErrors.push({
        code: 'MISSING_FILE',
        message: 'Please select a file'
      })
    }

    // Check file size (max 10MB)
    if (selectedFile.value && selectedFile.value.size > 10 * 1024 * 1024) {
      newErrors.push({
        code: 'FILE_TOO_LARGE',
        message: 'File size must be less than 10MB'
      })
    }

    errors.value = newErrors
    return {
      isValid: newErrors.length === 0,
      errors: newErrors
    }
  }

  const encodeText = (): boolean => {
    const validation = validateTextInput()
    
    if (!validation.isValid) {
      return false
    }

    try {
      const bytes = new TextEncoder().encode(textInput.value)
      const base64 = btoa(String.fromCharCode(...bytes))
      textOutput.value = base64
      
      // Add to history
      addToHistory('encode', 'text', textInput.value, base64)
      
      return true
    } catch (error) {
      errors.value.push({
        code: 'ENCODE_ERROR',
        message: 'Failed to encode text',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const decodeText = (): boolean => {
    const validation = validateTextInput()
    
    if (!validation.isValid) {
      return false
    }

    try {
      const binaryString = atob(textInput.value)
      const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0))
      const decoded = new TextDecoder().decode(bytes)
      textOutput.value = decoded
      
      // Add to history
      addToHistory('decode', 'text', textInput.value, decoded)
      
      return true
    } catch (error) {
      errors.value.push({
        code: 'DECODE_ERROR',
        message: 'Failed to decode Base64',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const encodeFile = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const validation = validateFileInput()
      
      if (!validation.isValid) {
        resolve(false)
        return
      }

      if (!selectedFile.value) {
        resolve(false)
        return
      }

      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string
          const base64 = result.split(',')[1] // Remove data URL prefix
          fileOutput.value = base64
          
          // Add to history
          addToHistory('encode', 'file', selectedFile.value!.name, base64)
          
          resolve(true)
        } catch (error) {
          errors.value.push({
            code: 'FILE_ENCODE_ERROR',
            message: 'Failed to encode file',
            details: error instanceof Error ? error.message : 'Unknown error'
          })
          resolve(false)
        }
      }
      
      reader.onerror = () => {
        errors.value.push({
          code: 'FILE_READ_ERROR',
          message: 'Failed to read file'
        })
        resolve(false)
      }
      
      reader.readAsDataURL(selectedFile.value)
    })
  }

  const decodeFile = (base64Content: string): Promise<string | null> => {
    return new Promise((resolve) => {
      try {
        const decoded = atob(base64Content)
        resolve(decoded)
        
        // Add to history
        addToHistory('decode', 'file', 'Base64 content', decoded)
      } catch (error) {
        errors.value.push({
          code: 'FILE_DECODE_ERROR',
          message: 'Failed to decode Base64 file',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
        resolve(null)
      }
    })
  }

  const processText = (): boolean => {
    if (activeTab.value === 'encode') {
      return encodeText()
    } else {
      return decodeText()
    }
  }

  const processFile = (): Promise<boolean> => {
    if (activeFileTab.value === 'encode') {
      return encodeFile()
    } else {
      return Promise.resolve(false) // File decode handled separately
    }
  }

  const selectFile = (file: File) => {
    selectedFile.value = file
    fileOutput.value = ''
    errors.value = []
  }

  const clearText = () => {
    textInput.value = ''
    textOutput.value = ''
    errors.value = []
  }

  const clearFile = () => {
    selectedFile.value = null
    fileOutput.value = ''
    errors.value = []
  }

  const clearAll = () => {
    clearText()
    clearFile()
    history.value = []
  }

  const addToHistory = (operation: 'encode' | 'decode', inputType: 'text' | 'file', input: string, output: string) => {
    const historyItem: Base64Operation = {
      operation,
      input,
      output,
      inputType,
      timestamp: new Date()
    }
    
    history.value.unshift(historyItem)
    
    // Keep only last 50 items
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  const downloadDecodedFile = (content: string, filename: string = 'decoded_file') => {
    const blob = new Blob([content], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileInfo = computed(() => {
    if (!selectedFile.value) return null
    
    return {
      name: selectedFile.value.name,
      size: formatFileSize(selectedFile.value.size),
      type: selectedFile.value.type || 'Unknown',
      lastModified: new Date(selectedFile.value.lastModified).toLocaleDateString()
    }
  })

  return {
    textInput,
    textOutput,
    selectedFile,
    fileOutput,
    activeTab,
    activeFileTab,
    errors,
    history,
    isValidBase64,
    getFileInfo,
    encodeText,
    decodeText,
    encodeFile,
    decodeFile,
    processText,
    processFile,
    selectFile,
    clearText,
    clearFile,
    clearAll,
    copyToClipboard,
    downloadDecodedFile,
    formatFileSize
  }
}
