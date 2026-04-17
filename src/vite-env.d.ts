/// <reference types="vite/client" />

// Google Ads gtag type declarations
declare global {
  interface Window {
    gtag: (
      command: string,
      eventNameOrTargetId: string,
      eventParams?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export {};
