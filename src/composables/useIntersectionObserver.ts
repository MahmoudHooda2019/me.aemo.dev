import { ref, onUnmounted } from 'vue'

export const useIntersectionObserver = () => {
  const observedElements = ref<Set<Element>>(new Set())
  let observer: IntersectionObserver | null = null

  const observeElements = (selector: string, options?: IntersectionObserverInit): void => {
    const elements = document.querySelectorAll(selector)
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, {
      threshold: 0.1,
      ...options
    })

    elements.forEach(element => {
      observer?.observe(element)
      observedElements.value.add(element)
    })
  }

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    observeElements,
    observedElements
  }
}
