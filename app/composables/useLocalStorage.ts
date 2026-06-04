export function useLocalStorage<T>(key: string, defaultValue: T) {
  const isBrowser = typeof window !== 'undefined'
  const storedValue = ref<T>(defaultValue)

  // Initialize
  if (isBrowser) {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        storedValue.value = JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading LocalStorage key "${key}":`, error)
    }
  }

  // Watch for reactive updates
  watch(
    storedValue,
    (newValue) => {
      if (isBrowser) {
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue))
        } catch (error) {
          console.warn(`Error writing LocalStorage key "${key}":`, error)
        }
      }
    },
    { deep: true }
  )

  return storedValue
}
