import { useJsApiLoader, Libraries } from '@react-google-maps/api';

/**
 * Single source of truth for the Google Maps API key.
 *
 * Read from VITE_GOOGLE_MAPS_API_KEY (set via .env locally or via the
 * hosting platform's env UI in production). We intentionally do NOT
 * hardcode a key here — the key is the only identity the browser has to
 * your Google Cloud billing account, and a committed key is constantly
 * scraped by bots. Restrict the key by HTTP referrer in Google Cloud
 * Console to your domains (apluscharge.in, localhost:8080).
 */
export const GOOGLE_MAPS_API_KEY: string =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';

/**
 * Libraries we actually use across the app:
 *  - `places` for the search-as-you-type Autocomplete on the Partner page
 *  - `geometry` for future distance / heading helpers
 * Keep this tuple referentially stable so the loader dedupes the script tag.
 */
export const GOOGLE_MAPS_LIBRARIES: Libraries = ['places', 'geometry'];

/**
 * Shared Google Maps JS API loader. All map components call this; the
 * underlying `useJsApiLoader` dedupes to a single `<script>` insertion.
 */
export const useGoogleMapsApi = () => {
  const hasKey = !!GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'aplus-google-maps',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: 'en',
    region: 'IN',
    // Skip loading entirely if there's no key so we can fail gracefully
    preventGoogleFontsLoading: false,
  });
  return { isLoaded: hasKey && isLoaded, loadError, hasKey };
};

/** Default map center: Guwahati, Assam. */
export const DEFAULT_CENTER = { lat: 26.1445, lng: 91.7362 };

/**
 * Minimal custom map style — hides POI clutter, keeps roads + transit,
 * softens colours to match the site's blue/cyan palette.
 */
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

/** Build an inline SVG-data-URL marker for charging stations. */
export const buildMarkerIcon = (kind: 'ac' | 'dc'): google.maps.Icon => {
  const colors = kind === 'dc'
    ? { start: '#9333EA', end: '#EC4899' }
    : { start: '#2674EC', end: '#00C6FF' };
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.start}"/>
          <stop offset="100%" stop-color="${colors.end}"/>
        </linearGradient>
      </defs>
      <path d="M18 1 C9.7 1 3 7.7 3 16 C3 27 18 42 18 42 S33 27 33 16 C33 7.7 26.3 1 18 1 Z"
            fill="url(#g)" stroke="white" stroke-width="2"/>
      <path d="M19 8 L11 19 L17 19 L15 28 L23 17 L17 17 Z" fill="white"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 44),
    anchor: new google.maps.Point(18, 42),
  };
};

/** Pin marker for the Partner location picker. */
export const buildPinIcon = (): google.maps.Icon => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
      <defs>
        <linearGradient id="p" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2674EC"/>
          <stop offset="100%" stop-color="#00E5FF"/>
        </linearGradient>
        <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2674EC" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g filter="url(#s)">
        <path d="M22 1 C11.5 1 3 9.5 3 20 C3 34 22 52 22 52 S41 34 41 20 C41 9.5 32.5 1 22 1 Z"
              fill="url(#p)" stroke="white" stroke-width="3"/>
        <circle cx="22" cy="20" r="7" fill="white"/>
      </g>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(44, 54),
    anchor: new google.maps.Point(22, 52),
  };
};
