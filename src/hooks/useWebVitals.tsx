import { useEffect } from 'react';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    INP: [200, 500],
    TTFB: [800, 1800],
  };
  
  const [good, poor] = thresholds[name] || [0, 0];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Hook to monitor Core Web Vitals in development
 * Logs performance metrics to console for debugging
 */
export const useWebVitals = (enabled = true) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    // Only run in development or preview environments
    const isDev = import.meta.env.DEV || 
                  window.location.hostname.includes('lovable') ||
                  window.location.hostname === 'localhost';
    
    if (!isDev) return;

    const logMetric = (metric: WebVitalMetric) => {
      const colors = {
        good: '#0cce6b',
        'needs-improvement': '#ffa400',
        poor: '#ff4e42',
      };
      
      console.log(
        `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} (${metric.rating})`,
        `color: ${colors[metric.rating]}; font-weight: bold;`
      );
    };

    // Use Performance Observer for more detailed metrics
    const observers: PerformanceObserver[] = [];

    // Observe LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        if (lastEntry) {
          logMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: getRating('LCP', lastEntry.startTime),
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    } catch (e) {
      // LCP not supported
    }

    // Observe FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            logMetric({
              name: 'FCP',
              value: entry.startTime,
              rating: getRating('FCP', entry.startTime),
            });
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observers.push(fcpObserver);
    } catch (e) {
      // FCP not supported
    }

    // Observe CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);

      // Log final CLS on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          logMetric({
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
          });
        }
      });
    } catch (e) {
      // CLS not supported
    }

    // Log TTFB
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const navTiming = navEntries[0] as PerformanceNavigationTiming;
      const ttfb = navTiming.responseStart - navTiming.requestStart;
      logMetric({
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
      });
    }

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [enabled]);
};

export default useWebVitals;
