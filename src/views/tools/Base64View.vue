<template>
  <div class="tool-container">
    <div class="tool-header">
      <a href="/#tools" class="back-link">← Back to Tools</a>
      <h1 class="tool-title">Base64 Encode & Decode</h1>
      <p class="tool-subtitle">Convert text and files to and from Base64 encoding</p>
    </div>

    <div class="tool-content">
      <!-- Text Encoding Section -->
      <div class="tool-section">
        <h2 class="section-title">Text Encoding</h2>
        
        <div class="tabs">
          <button 
            class="tab"
            :class="{ active: activeTab === 'encode' }"
            @click="activeTab = 'encode'"
          >
            Encode
          </button>
          <button 
            class="tab"
            :class="{ active: activeTab === 'decode' }"
            @click="activeTab = 'decode'"
          >
            Decode
          </button>
        </div>

        <!-- Encode Tab -->
        <div v-show="activeTab === 'encode'" class="tab-content">
          <div class="form-group">
            <label for="encodeInput">Enter text to encode:</label>
            <textarea 
              id="encodeInput"
              v-model="textInput"
              placeholder="Enter your text here..."
              rows="6"
            ></textarea>
          </div>

          <div class="action-buttons">
            <button class="btn-primary" @click="handleTextProcess">
              Encode Text
            </button>
            <button class="btn-secondary" @click="clearText">
              Clear
            </button>
          </div>

          <div v-if="textOutput" class="result-section">
            <h3>Encoded Result</h3>
            <div class="result-box">
              <code>{{ textOutput }}</code>
              <button class="copy-btn" @click="copyTextResult">
                {{ copyTextSuccess ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Decode Tab -->
        <div v-show="activeTab === 'decode'" class="tab-content">
          <div class="form-group">
            <label for="decodeInput">Enter Base64 to decode:</label>
            <textarea 
              id="decodeInput"
              v-model="textInput"
              placeholder="Enter Base64 string here..."
              rows="6"
            ></textarea>
            <span v-if="!isValidBase64 && textInput" class="validation-error">
              Invalid Base64 format
            </span>
          </div>

          <div class="action-buttons">
            <button class="btn-primary" @click="handleTextProcess" :disabled="!isValidBase64">
              Decode Text
            </button>
            <button class="btn-secondary" @click="clearText">
              Clear
            </button>
          </div>

          <div v-if="textOutput" class="result-section">
            <h3>Decoded Result</h3>
            <div class="result-box">
              <pre>{{ textOutput }}</pre>
              <button class="copy-btn" @click="copyTextResult">
                {{ copyTextSuccess ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- File Encoding Section -->
      <div class="tool-section">
        <h2 class="section-title">File Encoding</h2>
        
        <div class="tabs">
          <button 
            class="tab"
            :class="{ active: activeFileTab === 'encode' }"
            @click="activeFileTab = 'encode'"
          >
            Encode File
          </button>
          <button 
            class="tab"
            :class="{ active: activeFileTab === 'decode' }"
            @click="activeFileTab = 'decode'"
          >
            Decode File
          </button>
        </div>

        <!-- File Encode Tab -->
        <div v-show="activeFileTab === 'encode'" class="tab-content">
          <div class="form-group">
            <label for="fileInput">Select file to encode:</label>
            <input 
              id="fileInput"
              type="file"
              @change="handleFileSelect"
              class="file-input"
            >
          </div>

          <div v-if="selectedFile" class="file-info">
            <div class="file-details">
              <strong>File:</strong> {{ selectedFile.name }}<br>
              <strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}<br>
              <strong>Type:</strong> {{ selectedFile.type || 'Unknown' }}
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn-primary" @click="handleFileEncode" :disabled="!selectedFile">
              Encode File
            </button>
            <button class="btn-secondary" @click="clearFile">
              Clear
            </button>
          </div>

          <div v-if="fileOutput" class="result-section">
            <h3>Encoded File (Base64)</h3>
            <div class="result-box">
              <code>{{ fileOutput.slice(0, 200) }}{{ fileOutput.length > 200 ? '...' : '' }}</code>
              <button class="copy-btn" @click="copyFileResult">
                {{ copyFileSuccess ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <p class="result-hint">
              Full Base64 string has been copied to clipboard
            </p>
          </div>
        </div>

        <!-- File Decode Tab -->
        <div v-show="activeFileTab === 'decode'" class="tab-content">
          <div class="form-group">
            <label for="base64FileInput">Select Base64 file to decode:</label>
            <input 
              id="base64FileInput"
              type="file"
              @change="handleBase64FileSelect"
              class="file-input"
            >
          </div>

          <div v-if="selectedBase64File" class="file-info">
            <div class="file-details">
              <strong>File:</strong> {{ selectedBase64File.name }}<br>
              <strong>Size:</strong> {{ formatFileSize(selectedBase64File.size) }}
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn-primary" @click="handleFileDecode" :disabled="!selectedBase64File">
              Decode File
            </button>
            <button class="btn-secondary" @click="clearBase64File">
              Clear
            </button>
          </div>

          <div v-if="decodedFileData" class="result-section">
            <h3>Decoded File Ready</h3>
            <div class="file-info">
              <div class="file-details">
                <strong>Decoded size:</strong> {{ formatFileSize(decodedFileData.length) }}<br>
                <strong>Ready to download</strong>
              </div>
            </div>
            <button class="btn-primary" @click="downloadDecodedFile">
              Download Decoded File
            </button>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div v-if="history.length > 0" class="tool-section">
        <h2 class="section-title">Recent Operations</h2>
        <div class="history-list">
          <div v-for="(item, index) in history.slice(0, 5)" :key="index" class="history-item">
            <div class="history-header">
              <span class="history-operation">{{ item.operation.toUpperCase() }}</span>
              <span class="history-type">{{ item.inputType }}</span>
              <span class="history-time">{{ formatTime(item.timestamp) }}</span>
            </div>
            <div class="history-content">
              <strong>Input:</strong> {{ truncateText(item.input, 50) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="errors.length > 0" class="error-section">
        <h3>Errors</h3>
        <div class="error-list">
          <div v-for="error in errors" :key="error.code" class="error-item">
            <strong>{{ error.message }}</strong>
            <span v-if="error.details" class="error-details">{{ error.details }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBase64 } from '@/composables/useBase64'

const {
  textInput,
  textOutput,
  selectedFile,
  fileOutput,
  activeTab,
  activeFileTab,
  errors,
  history,
  isValidBase64,
  encodeFile,
  decodeFile,
  processText,
  selectFile,
  clearText,
  clearFile,
  copyToClipboard,
  formatFileSize
} = useBase64()

// Local state
const copyTextSuccess = ref(false)
const copyFileSuccess = ref(false)
const selectedBase64File = ref<File | null>(null)
const decodedFileData = ref<string | null>(null)

// Methods
const handleTextProcess = async () => {
  const success = processText()
  if (success) {
    errors.value = []
  }
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectFile(file)
  }
}

const handleFileEncode = async () => {
  const success = await encodeFile()
  if (success) {
    errors.value = []
  }
}

const handleBase64FileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  selectedBase64File.value = file || null
}

const handleFileDecode = async () => {
  if (!selectedBase64File.value) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string
      const decoded = await decodeFile(content)
      
      if (decoded) {
        decodedFileData.value = decoded
        errors.value = []
      }
    } catch (error) {
      console.error('Failed to decode file:', error)
    }
  }
  reader.readAsText(selectedBase64File.value)
}

const copyTextResult = async () => {
  if (textOutput.value) {
    const success = await copyToClipboard(textOutput.value)
    if (success) {
      copyTextSuccess.value = true
      setTimeout(() => {
        copyTextSuccess.value = false
      }, 2000)
    }
  }
}

const copyFileResult = async () => {
  if (fileOutput.value) {
    const success = await copyToClipboard(fileOutput.value)
    if (success) {
      copyFileSuccess.value = true
      setTimeout(() => {
        copyFileSuccess.value = false
      }, 2000)
    }
  }
}

const downloadDecodedFile = () => {
  if (decodedFileData.value) {
    const blob = new Blob([decodedFileData.value], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'decoded_file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

const clearBase64File = () => {
  selectedBase64File.value = null
  decodedFileData.value = null
  const input = document.getElementById('base64FileInput') as HTMLInputElement
  if (input) input.value = ''
}

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString()
}
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.tool-header {
  text-align: center;
  margin-bottom: 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: var(--accent-primary);
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-link:hover {
  transform: translateX(-5px);
}

.tool-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 1rem;
  font-family: 'Inter', sans-serif;
}

.tool-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.tool-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.tool-section {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-secondary);
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.tab:hover {
  color: var(--text-primary);
}

.tab-content {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group textarea,
.form-group input {
  width: 100%;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.file-input {
  padding: 0.75rem;
  cursor: pointer;
}

.validation-error {
  display: block;
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(187, 134, 252, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.result-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.result-section h3 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.result-box {
  position: relative;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.result-box code,
.result-box pre {
  font-family: 'Courier New', monospace;
  word-break: break-all;
  white-space: pre-wrap;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: var(--accent-secondary);
}

.result-hint {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.file-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.file-details {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-operation {
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.history-type {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.history-time {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.history-content {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.error-section {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  border-radius: 12px;
  padding: 1.5rem;
}

.error-section h3 {
  color: #f44336;
  margin-bottom: 1rem;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error-item {
  color: #f44336;
}

.error-details {
  display: block;
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .tool-container {
    padding: 1rem;
  }
  
  .tool-title {
    font-size: 2rem;
  }
  
  .tabs {
    flex-direction: column;
    gap: 0;
  }

  .tab {
    border-bottom: 1px solid var(--border-color);
    border-radius: 0;
  }

  .tab.active {
    border-bottom-color: var(--accent-primary);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
