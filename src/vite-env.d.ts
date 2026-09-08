/// <reference types="vite/client" />
/// <reference types="google.maps" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    /** Google Cloud key for the Maps JavaScript API — see .env.example. */
    readonly VITE_GOOGLE_MAPS_API_KEY?: string;
    /** Map ID for cloud-based styling; required by advanced markers. */
    readonly VITE_GOOGLE_MAPS_MAP_ID?: string;
  }

  // Google Ads gtag type declarations
  interface Window {
    gtag: (
      command: string,
      eventNameOrTargetId: string,
      eventParams?: Record<string, any>
    ) => void;
    dataLayer: any[];
    /** Set by the Maps JavaScript API once src/lib/googleMaps.ts injects it. */
    google?: typeof google;
  }
}

export {};
