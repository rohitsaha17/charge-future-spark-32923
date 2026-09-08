/**
 * Single loader for the Google Maps JavaScript API.
 *
 * Every map in the app (ChargingStationsMap, LocationPickerMap) goes through
 * `loadGoogleMaps()`, so the SDK script is injected exactly once no matter how
 * many maps mount, and concurrent callers share one in-flight promise.
 *
 * Configuration lives in env vars, not source:
 *   VITE_GOOGLE_MAPS_API_KEY  — billing-enabled key from the Google Cloud
 *                               project that owns this site's Maps usage.
 *   VITE_GOOGLE_MAPS_MAP_ID   — Map ID for cloud-based map styling. Advanced
 *                               markers (the custom HTML pins) require one;
 *                               we fall back to Google's DEMO_MAP_ID so local
 *                               dev works before a styled map is created.
 */

const API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim();

/** DEMO_MAP_ID is Google's public development Map ID — fine for dev, but a
 *  real one should be created in the Cloud console for production styling. */
export const GOOGLE_MAPS_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? '').trim() || 'DEMO_MAP_ID';

export const isGoogleMapsConfigured = () => API_KEY.length > 0;

/** Centre of the service area (Guwahati) — shared default for both maps. */
export const DEFAULT_MAP_CENTER = { lat: 26.1445, lng: 91.7362 };

const CALLBACK_NAME = '__apluschargeGoogleMapsReady';
const SCRIPT_ID = 'aplus-google-maps-sdk';

let loadPromise: Promise<typeof google.maps> | null = null;

export const loadGoogleMaps = (): Promise<typeof google.maps> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<typeof google.maps>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps can only be loaded in the browser.'));
      return;
    }

    if (window.google?.maps?.Map) {
      resolve(window.google.maps);
      return;
    }

    if (!API_KEY) {
      reject(
        new Error(
          'VITE_GOOGLE_MAPS_API_KEY is not set — add it to .env to render maps.'
        )
      );
      return;
    }

    // A hot reload can leave the tag behind while `loadPromise` was reset;
    // reuse it rather than injecting the SDK twice (Google warns loudly).
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    const settle = () => {
      if (window.google?.maps?.Map) resolve(window.google.maps);
      else reject(new Error('Google Maps loaded without a maps namespace.'));
    };

    const fail = () => {
      loadPromise = null;
      reject(new Error('Failed to load the Google Maps JavaScript API.'));
    };

    if (existing) {
      existing.addEventListener('load', settle, { once: true });
      existing.addEventListener('error', fail, { once: true });
      return;
    }

    (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = settle;

    const params = new URLSearchParams({
      key: API_KEY,
      // `marker` gives us AdvancedMarkerElement, which is what lets the custom
      // HTML pins keep their gradients, pulse ring and charger-count badge.
      libraries: 'marker',
      loading: 'async',
      language: 'en',
      region: 'IN',
      callback: CALLBACK_NAME,
    });

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.addEventListener('error', fail, { once: true });
    document.head.appendChild(script);
  });

  return loadPromise;
};

/** Google's fitBounds has no maxZoom option, so clamp once the camera settles. */
export const clampZoomAfterFit = (map: google.maps.Map, maxZoom: number) => {
  google.maps.event.addListenerOnce(map, 'idle', () => {
    const zoom = map.getZoom();
    if (typeof zoom === 'number' && zoom > maxZoom) map.setZoom(maxZoom);
  });
};
