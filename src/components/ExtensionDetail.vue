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
                :href="downloadUrl || '#'" 
                :class="['action-button', isFree ? 'download-button' : 'buy-button', { disabled: !hasUrl }]"
                :aria-disabled="!hasUrl"
                @click="handleDownloadClick"
                target="_blank" 
                rel="noopener noreferrer"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useExtensions } from '@/composables/useExtensions'
import type { Extension } from '@/types/extension'

const SAFE_DOC_NAME = /^[a-zA-Z0-9_-]+\.md$/

const route = useRoute()
const { getExtensionById } = useExtensions()
const extension = ref<Extension | null>(null)
const documentation = ref('')
const loading = ref(true)
const errorTitle = ref('Error')
const errorMessage = ref('Something went wrong.')

const priceText = computed(() => {
  return (extension.value?.price || 'Free').trim()
})

const isFree = computed(() => {
  const price = priceText.value
  return /^(free|\$0|0)$/i.test(price) || !extension.value?.price
})

const priceClass = computed(() => isFree.value ? 'free' : 'paid')
const downloadUrl = computed(() => {
  const url = extension.value?.url?.trim()
  return url && url !== '#' ? url : ''
})
const hasUrl = computed(() => Boolean(downloadUrl.value))

const formattedDocumentation = computed(() => {
  if (!documentation.value) return ''
  return sanitizeDocumentationHtml(formatContent(documentation.value))
})

async function loadExtension() {
  const extensionId = getRouteExtensionId()
  loading.value = true
  extension.value = null
  documentation.value = ''
  
  if (!extensionId) {
    errorTitle.value = 'No Extension ID'
    errorMessage.value = 'Please provide an extension ID in the URL.'
    loading.value = false
    return
  }

  try {
    const found = await getExtensionById(extensionId)
    
    if (!found) {
      throw new Error('Extension not found')
    }
    
    extension.value = found
    documentation.value = await loadDocumentation(found)
    document.title = `${found.title} - Extension Details`
    
  } catch (error) {
    console.error('Failed to load extension:', error)
    errorTitle.value = 'Extension Not Found'
    errorMessage.value = "The extension you're looking for doesn't exist or failed to load."
  } finally {
    loading.value = false
  }
}

function handleDownloadClick(event: MouseEvent) {
  if (!hasUrl.value) {
    event.preventDefault()
  }
}

async function loadDocumentation(found: Extension): Promise<string> {
  const docName = getDocumentationFileName(found)
  if (!docName) return ''

  try {
    const docResponse = await fetch(`/extensions/${encodeURIComponent(docName)}`, {
      headers: { 'Cache-Control': 'no-cache' }
    })

    if (!docResponse.ok) return ''
    return await docResponse.text()
  } catch (e) {
    console.warn('Failed to load documentation:', e)
    return ''
  }
}

function getDocumentationFileName(found: Extension): string {
  const explicitDoc = found.doc?.trim()
  const docName = explicitDoc || `${found.id}.md`
  return SAFE_DOC_NAME.test(docName) ? docName : ''
}

function getRouteExtensionId(): string {
  const rawId = route.params.id
  return Array.isArray(rawId) ? rawId[0] || '' : rawId || ''
}

function formatContent(content: string): string {
  let html = escapeHtml(content)
  
  // Code blocks (```language...```)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    return `<pre><code${lang ? ` class="language-${escapeAttribute(lang)}"` : ''}>${code.trim()}</code></pre>`
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
  
  html = replaceMarkdownLinksAndImages(html)
  
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

function replaceMarkdownLinksAndImages(html: string): string {
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const safeUrl = sanitizeUrl(url)
    if (!safeUrl) return ''
    return `<img src="${escapeAttribute(safeUrl)}" alt="${escapeAttribute(decodeHtmlEntities(alt))}" loading="lazy">`
  })
  
  return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    const safeUrl = sanitizeUrl(url, { allowMailto: true })
    if (!safeUrl) return text
    return `<a href="${escapeAttribute(safeUrl)}" target="_blank" rel="noopener noreferrer">${text}</a>`
  })
}

function sanitizeDocumentationHtml(html: string): string {
  const template = document.createElement('template')
  template.innerHTML = html
  sanitizeChildNodes(template.content)
  return template.innerHTML
}

function sanitizeChildNodes(parent: ParentNode): void {
  Array.from(parent.childNodes).forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) return

    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.remove()
      return
    }

    sanitizeElement(child as HTMLElement)
  })
}

function sanitizeElement(element: HTMLElement): void {
  const tag = element.tagName.toLowerCase()

  if (!ALLOWED_DOC_TAGS.has(tag)) {
    element.replaceWith(document.createTextNode(element.textContent || ''))
    return
  }

  Array.from(element.attributes).forEach(attribute => {
    if (!isAllowedAttribute(tag, attribute.name, attribute.value)) {
      element.removeAttribute(attribute.name)
    }
  })

  if (tag === 'a') {
    const safeHref = sanitizeUrl(element.getAttribute('href') || '', { allowMailto: true })
    if (!safeHref) {
      element.replaceWith(document.createTextNode(element.textContent || ''))
      return
    }

    element.setAttribute('href', safeHref)
    element.setAttribute('target', '_blank')
    element.setAttribute('rel', 'noopener noreferrer')
  }

  if (tag === 'img') {
    const safeSrc = sanitizeUrl(element.getAttribute('src') || '')
    if (!safeSrc) {
      element.remove()
      return
    }

    element.setAttribute('src', safeSrc)
    element.setAttribute('loading', 'lazy')
  }

  sanitizeChildNodes(element)
}

function isAllowedAttribute(tag: string, name: string, value: string): boolean {
  const normalizedName = name.toLowerCase()
  const allowedAttributes = ALLOWED_DOC_ATTRIBUTES[tag]
  if (!allowedAttributes?.has(normalizedName)) return false

  if (normalizedName === 'class') {
    return isAllowedClass(tag, value)
  }

  if (tag === 'div' && normalizedName === 'dir') {
    return /^(ltr|rtl|auto)$/i.test(value)
  }

  if (tag === 'ol' && normalizedName === 'start') {
    return /^\d+$/.test(value)
  }

  return true
}

function isAllowedClass(tag: string, value: string): boolean {
  const classes = value.split(/\s+/).filter(Boolean)
  if (classes.length === 0) return false

  if (tag === 'code') {
    return classes.every(className => /^language-[a-z0-9_-]+$/i.test(className))
  }

  if (tag === 'blockquote') {
    return classes.every(className => /^quote-level-\d+$/i.test(className))
  }

  if (tag === 'span') {
    return classes.every(className => ALLOWED_SPAN_CLASSES.has(className))
  }

  return false
}

function sanitizeUrl(url: string, options: { allowMailto?: boolean } = {}): string {
  const trimmed = decodeHtmlEntities(url).trim()
  if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) return ''

  if (trimmed.startsWith('#')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return ''
    return trimmed
  }

  try {
    const parsed = new URL(trimmed, window.location.origin)
    const allowedProtocols = options.allowMailto ? ['http:', 'https:', 'mailto:'] : ['http:', 'https:']
    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href
    }
  } catch {
    return ''
  }

  return ''
}

function escapeAttribute(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

const ALLOWED_DOC_TAGS = new Set([
  'a',
  'blockquote',
  'code',
  'del',
  'details',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'summary',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul'
])

const ALLOWED_DOC_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  blockquote: new Set(['class']),
  code: new Set(['class']),
  div: new Set(['dir']),
  img: new Set(['src', 'alt', 'loading']),
  ol: new Set(['start']),
  span: new Set(['class'])
}

const ALLOWED_SPAN_CLASSES = new Set(['hashtag', 'mention', 'spoiler'])

onMounted(() => {
  loadExtension()
})

watch(() => route.params.id, () => {
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

.action-button.disabled {
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
