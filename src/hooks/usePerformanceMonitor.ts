import { useEffect, useRef } from 'react'

export interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(Date.now())
  const metricsRef = useRef<PerformanceMetrics[]>([])

  useEffect(() => {
    // Start timing when component mounts
    renderStartTime.current = performance.now()

    return () => {
      // Clean up on unmount
      if (renderStartTime.current) {
        const renderTime = performance.now() - renderStartTime.current
        
        const metric: PerformanceMetrics = {
          renderTime,
          componentName,
          timestamp: Date.now()
        }

        metricsRef.current.push(metric)
        
        // Log in development
        if (import.meta.env.DEV) {
          console.log(`🚀 ${componentName} render time: ${renderTime.toFixed(2)}ms`)
        }

        // Send to monitoring service in production
        if (import.meta.env.PROD && renderTime > 100) { // Only log slow renders
          // Add your monitoring service here
          // Example: sendMetric('component-render-time', metric)
        }
      }
    }
  }, [componentName])

  const getMetrics = () => metricsRef.current

  const clearMetrics = () => {
    metricsRef.current = []
  }

  return {
    getMetrics,
    clearMetrics
  }
}

// Global performance monitor
export function useGlobalPerformanceMonitor() {
  useEffect(() => {
    // Monitor page load performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart
          
          if (import.meta.env.DEV) {
            console.log(`📊 Page load time: ${loadTime.toFixed(2)}ms`)
          }
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })

    return () => observer.disconnect()
  }, [])
}
