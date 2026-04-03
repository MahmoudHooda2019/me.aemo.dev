<template>
  <div class="extension-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>

    <!-- Extension Content -->
    <div v-else-if="extension" id="extension-content">
      <!-- Hero Card -->
      <div class="extension-card">
        <div class="extension-header">
          <div class="extension-header-main">
            <div class="extension-price" :class="priceClass">{{ priceText }}</div>
            <h1 class="extension-title">{{ extension.title }}</h1>
            <div class="extension-meta">
              <span>Version {{ extension.version || '1.0.0' }}</span>
              <span>Updated {{ extension.lastUpdated || 'Recently' }}</span>
            </div>
          </div>
          <div class="header-right">
            <div class="action-buttons">
              <a 
                :href="hasUrl ? extension.url : '#'" 
                :class="['action-button', isFree ? 'download-button' : 'buy-button']"
                :disabled="!hasUrl"
                target="_blank" 
                rel="noopener"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <template v-if="isFree">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </template>
                  <template v-else>
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </template>
                </svg>
                {{ isFree ? 'Download' : 'Buy Now' }}
              </a>
            </div>
          </div>
        </div>
        
        <div class="extension-description">
          {{ extension.description || extension.subtitle || 'No description available.' }}
        </div>
      </div>

      <!-- Documentation Card -->
      <div class="documentation-card">
        <div v-if="documentation" class="documentation-section">
          <div class="documentation-content" v-html="formattedDocumentation"></div>
        </div>
        <div v-else class="documentation-section">
          <p class="no-docs">No documentation available for this extension.</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <h1>{{ errorTitle }}</h1>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface Extension {
  id: string
  title: string
  subtitle: string
  description: string
  price: string
  version?: string
  lastUpdated?: string
  url?: string
  doc?: string
}

const route = useRoute()
const extension = ref<Extension | null>(null)
const documentation = ref('')
const loading = ref(true)
const errorTitle = ref('Error')
const errorMessage = ref('Something went wrong.')

const priceText = computed(() => {
  return (extension.value?.price || 'Free').toString().trim()
})

const isFree = computed(() => {
  const price = priceText.value
  return /^(free|\$0|0)$/i.test(price) || !extension.value?.price
})

const priceClass = computed(() => isFree.value ? 'free' : 'paid')
const hasUrl = computed(() => extension.value?.url && extension.value.url !== '#')

const formattedDocumentation = computed(() => {
  if (!documentation.value) return ''
  return formatContent(documentation.value)
})

async function loadExtension() {
  const extensionId = route.params.id as string
  
  if (!extensionId) {
    errorTitle.value = 'No Extension ID'
    errorMessage.value = 'Please provide an extension ID in the URL.'
    loading.value = false
    return
  }

  try {
    const response = await fetch('/scripts/extensions.json', {
      headers: { 'Cache-Control': 'no-cache' }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json() as Extension[]
    const found = data.find((e: Extension) => e.id === extensionId)
    
    if (!found) {
      throw new Error('Extension not found')
    }
    
    extension.value = found
    
    // Load markdown documentation if doc field exists
    if (found.doc) {
      try {
        const docResponse = await fetch(`/extensions/${found.doc}`)
        if (docResponse.ok) {
          documentation.value = await docResponse.text()
        }
      } catch (e) {
        console.warn('Failed to load documentation:', e)
      }
    }
    
    // Update page title
    document.title = `${found.title} - Extension Details`
    
  } catch (error) {
    console.error('Failed to load extension:', error)
    errorTitle.value = 'Extension Not Found'
    errorMessage.value = "The extension you're looking for doesn't exist or failed to load."
  } finally {
    loading.value = false
  }
}

function formatContent(content: string): string {
  // If content contains HTML tags (and no markdown patterns), render as-is
  if (content.includes('<') && !content.match(/[\[*#`]|\[.*\]\(|^\s*[-\d]\.|^\s*>|\|/)) {
    return content
  }
  
  let html = content
  
  // Code blocks (```language...```)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${escapeHtml(code.trim())}</code></pre>`
  })
  
  // Inline code (`code`) - process after code blocks
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Bold + Italic (***text***)
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
  
  // Bold (**text** or #text#)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/#([^#\s][^#]*)#/g, '<strong>$1</strong>')
  
  // Italic (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  
  // Strikethrough (~~text~~)
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  
  // Headings (# H1, ## H2, ### H3)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Horizontal rule (--- or *** or ___)
  html = html.replace(/^\s*[-*_]{3,}\s*$/gim, '<hr>')
  
  // Blockquotes (> text)
  html = html.replace(/^>(>*)\s*(.*$)/gim, (_match, level, text) => {
    const depth = level.length + 1
    return `<blockquote class="quote-level-${depth}">${text}</blockquote>`
  })
  
  // Images (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
  
  // Links ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  
  // Tables (| A | B |)
  html = html.replace(/((?:^\|[^\n]+\|\n?)+)/gm, (match) => {
    const lines = match.trim().split('\n').filter(l => l.trim())
    if (lines.length < 2) return match
    
    let table = '<table><thead>'
    // Header row
    const headerCells = lines[0].split('|').filter(c => c.trim())
    table += '<tr>' + headerCells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr>'
    table += '</thead><tbody>'
    
    // Skip separator line (|---|---|) and process data rows
    for (let i = 2; i < lines.length; i++) {
      const cells = lines[i].split('|').filter(c => c.trim())
      if (cells.length > 0) {
        table += '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>'
      }
    }
    table += '</tbody></table>'
    return table
  })
  
  // Emoji (:smile: :heart:)
  const emojiMap: Record<string, string> = {
    ':smile:': '😊', ':happy:': '😊', ':joy:': '😂',
    ':heart:': '❤️', ':love:': '❤️', ':star:': '⭐',
    ':thumbsup:': '👍', ':thumbsdown:': '👎',
    ':fire:': '🔥', ':rocket:': '🚀', ':check:': '✅',
    ':warning:': '⚠️', ':x:': '❌', ':bulb:': '💡',
    ':note:': '📝', ':info:': 'ℹ️', ':idea:': '💡'
  }
  html = html.replace(/:([a-z]+):/g, (match, _name) => emojiMap[match] || match)
  
  // Details/Collapsible ([details="Title"]...[/details])
  html = html.replace(/\[details="([^"]+)"\]([\s\S]*?)\[\/details\]/g, '<details><summary>$1</summary>$2</details>')
  
  // Spoiler ([spoiler]...[/spoiler])
  html = html.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/g, '<span class="spoiler">$1</span>')
  
  // RTL ([rtl]...[/rtl])
  html = html.replace(/\[rtl\]([\s\S]*?)\[\/rtl\]/g, '<div dir="rtl">$1</div>')
  
  // Mentions (@username)
  html = html.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
  
  // Hashtags (#topic - but not when it's a heading)
  html = html.replace(/(?<!^|\n)#(\w+)/g, '<span class="hashtag">#$1</span>')
  
  // Numbered lists (1. item)
  html = html.replace(/(^\d+\.\s+.+$)/gm, (match) => {
    if (!match.startsWith('<')) {
      return `<ol start="${match.match(/^\d+/)![0]}"><li>${match.replace(/^\d+\.\s*/, '')}</li></ol>`
    }
    return match
  })
  
  // Bulleted lists (- item or • item)
  html = html.replace(/(^[\-\*]\s+.+$)/gm, (match) => {
    if (!match.startsWith('<')) {
      return `<ul><li>${match.replace(/^[\-\*]\s*/, '')}</li></ul>`
    }
    return match
  })
  
  // Merge consecutive list items
  html = html.replace(/<\/li><\/ul>\s*<ul><li>/g, '</li><li>')
  html = html.replace(/<\/li><\/ol>\s*<ol[^>]*><li>/g, '</li><li>')
  
  // Convert remaining newlines to paragraphs
  const paragraphs = html.split('\n\n').filter(p => p.trim())
  html = paragraphs.map(p => {
    p = p.trim()
    if (p.startsWith('<') && !p.startsWith('<p>')) {
      return p
    }
    return `<p>${p}</p>`
  }).join('')
  
  return html
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

onMounted(() => {
  loadExtension()
})
</script>

<style scoped>
.extension-detail {
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.extension-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.extension-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.extension-header-main {
  flex: 1;
}

.extension-price {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.extension-price.free {
  background: linear-gradient(135deg, #22c55e20, #22c55e40);
  color: #22c55e;
}

.extension-price.paid {
  background: linear-gradient(135deg, #f59e0b20, #f59e0b40);
  color: #f59e0b;
}

.extension-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.extension-meta {
  display: flex;
  gap: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.header-right {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-button.download-button {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.action-button.buy-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.action-button[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.extension-description {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 1rem;
}

.documentation-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
}

.documentation-section {
  max-width: 100%;
}

.documentation-content :deep(h1),
.documentation-content :deep(h2),
.documentation-content :deep(h3) {
  color: var(--text-primary);
  margin-bottom: 1rem;
  margin-top: 1.5rem;
}

.documentation-content :deep(h1) {
  font-size: 1.75rem;
  font-weight: 700;
}

.documentation-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.documentation-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
}

.documentation-content :deep(p) {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.documentation-content :deep(ul),
.documentation-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.documentation-content :deep(li) {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

.documentation-content :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
}

.documentation-content :deep(a:hover) {
  text-decoration: underline;
}

.documentation-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}

.documentation-content :deep(blockquote) {
  border-left: 4px solid var(--accent-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.documentation-content :deep(code) {
  background: var(--bg-primary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
}

.documentation-content :deep(pre) {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.documentation-content :deep(pre code) {
  background: none;
  padding: 0;
}

.documentation-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.documentation-content :deep(th),
.documentation-content :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

.documentation-content :deep(th) {
  background: var(--bg-primary);
  font-weight: 600;
}

.no-docs {
  color: var(--text-muted);
  text-align: center;
  padding: 2rem;
}

.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.error-state h1 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.error-state p {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .extension-detail {
    padding: 1rem;
  }
  
  .extension-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .extension-title {
    font-size: 1.5rem;
  }
  
  .extension-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
