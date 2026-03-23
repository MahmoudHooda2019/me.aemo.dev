<template>
  <div class="tool-container">
    <div class="tool-header">
      <a href="/#tools" class="back-link">← Back to Tools</a>
      <h1 class="tool-title">Deep Link Generator</h1>
      <p class="tool-subtitle">Create powerful deep links for your apps</p>
    </div>

    <div class="tool-content">
      <!-- Generate Section -->
      <div class="tool-section">
        <h2 class="section-title">Generate Deep Link</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="scheme">Scheme *</label>
            <input 
              id="scheme"
              v-model="deepLinkData.scheme"
              type="text"
              placeholder="myapp"
              :class="{ error: !isValidScheme && deepLinkData.scheme }"
            >
            <span class="form-hint">The custom scheme for your app (e.g., myapp, yourapp)</span>
          </div>

          <div class="form-group">
            <label for="host">Host</label>
            <input 
              id="host"
              v-model="deepLinkData.host"
              type="text"
              placeholder="example.com"
              :class="{ error: !isValidHost && deepLinkData.host }"
            >
            <span class="form-hint">Optional domain for your deep link</span>
          </div>

          <div class="form-group">
            <label for="path">Path</label>
            <input 
              id="path"
              v-model="deepLinkData.path"
              type="text"
              placeholder="/product/123"
              :class="{ error: !isValidPath && deepLinkData.path }"
            >
            <span class="form-hint">Optional path (must start with /)</span>
          </div>

          <div class="form-group full-width">
            <label for="params">Parameters (JSON format)</label>
            <textarea 
              id="params"
              v-model="paramsText"
              placeholder='{"key": "value", "id": "123"}'
              rows="4"
            ></textarea>
            <span class="form-hint">Optional parameters in JSON format</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" @click="handleGenerate" :disabled="!isValidScheme">
            Generate Deep Link
          </button>
          <button class="btn-secondary" @click="clearAll">
            Clear
          </button>
        </div>

        <!-- Generated Result -->
        <div v-if="generatedLink" class="result-section">
          <h3>Generated Deep Link</h3>
          <div class="result-box">
            <code>{{ generatedLink }}</code>
            <button class="copy-btn" @click="copyResult">
              {{ copySuccess ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Parse Section -->
      <div class="tool-section">
        <h2 class="section-title">Parse Deep Link</h2>
        
        <div class="form-group">
          <label for="deepLinkInput">Deep Link URL</label>
          <input 
            id="deepLinkInput"
            v-model="parseInput"
            type="text"
            placeholder="myapp://example.com/product/123?key=value&id=123"
          >
        </div>

        <div class="action-buttons">
          <button class="btn-primary" @click="handleParse">
            Parse Deep Link
          </button>
          <button class="btn-secondary" @click="clearParse">
            Clear
          </button>
        </div>

        <!-- Parsed Result -->
        <div v-if="parsedLink" class="result-section">
          <h3>Parsed Components</h3>
          <div class="parsed-result">
            <div class="parsed-item">
              <strong>Scheme:</strong> {{ parsedLink.scheme }}
            </div>
            <div v-if="parsedLink.host" class="parsed-item">
              <strong>Host:</strong> {{ parsedLink.host }}
            </div>
            <div v-if="parsedLink.port" class="parsed-item">
              <strong>Port:</strong> {{ parsedLink.port }}
            </div>
            <div class="parsed-item">
              <strong>Path:</strong> {{ parsedLink.path }}
            </div>
            <div v-if="Object.keys(parsedLink.params).length > 0" class="parsed-item">
              <strong>Parameters:</strong>
              <ul class="params-list">
                <li v-for="(value, key) in parsedLink.params" :key="key">
                  <strong>{{ key }}:</strong> {{ value }}
                </li>
              </ul>
            </div>
          </div>
          <button class="copy-btn" @click="copyParseResult">
            {{ copyParseSuccess ? 'Copied!' : 'Copy JSON' }}
          </button>
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
import { ref, watch, onMounted } from 'vue'
import { useDeepLink } from '@/composables/useDeepLink'

const {
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
  copyToClipboard
} = useDeepLink()

const paramsText = ref('')
const parseInput = ref('')
const copySuccess = ref(false)
const copyParseSuccess = ref(false)

// Watch for changes in paramsText and update the composable
watch(paramsText, (newText) => {
  updateParams(newText)
})

// Watch for changes in deepLinkData params and update the text area
watch(getParamsAsText, (newText) => {
  if (newText !== paramsText.value) {
    paramsText.value = newText
  }
}, { immediate: true })

const handleGenerate = async () => {
  const success = generateDeepLink()
  if (success) {
    // Clear any previous errors
    errors.value = []
  }
}

const handleParse = async () => {
  const success = parseDeepLink(parseInput.value)
  if (!success) {
    // Errors are already set by the composable
    console.error('Failed to parse deep link')
  }
}

const clearParse = () => {
  parseInput.value = ''
  parsedLink.value = null
  errors.value = []
}

const copyResult = async () => {
  if (generatedLink.value) {
    const success = await copyToClipboard(generatedLink.value)
    if (success) {
      copySuccess.value = true
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
    }
  }
}

const copyParseResult = async () => {
  if (parsedLink.value) {
    const jsonString = JSON.stringify(parsedLink.value, null, 2)
    const success = await copyToClipboard(jsonString)
    if (success) {
      copyParseSuccess.value = true
      setTimeout(() => {
        copyParseSuccess.value = false
      }, 2000)
    }
  }
}

onMounted(() => {
  // Initialize any default values if needed
})
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #f44336;
}

.form-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
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
  font-family: 'Courier New', monospace;
  word-break: break-all;
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

.parsed-result {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

.parsed-item {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.parsed-item strong {
  color: var(--accent-secondary);
}

.params-list {
  margin-top: 0.5rem;
  margin-left: 1rem;
  color: var(--text-secondary);
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
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
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
