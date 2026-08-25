import { useState, useEffect } from 'react';
import { siteSettings } from '@/lib/api';

interface VisibilitySettings {
  pages: {
    services: boolean;
    blog: boolean;
    partner: boolean;
    invest: boolean;
    about: boolean;
  };
  sections: {
    home_map: boolean;
    home_benefits: boolean;
    home_testimonials: boolean;
    home_faq: boolean;
    home_app_download: boolean;
    about_team: boolean;
    about_timeline: boolean;
  };
}

const DEFAULT_VISIBILITY: VisibilitySettings = {
  pages: {
    services: true,
    blog: true,
    partner: true,
    invest: true,
    about: true,
  },
  sections: {
    home_map: true,
    home_benefits: true,
    home_testimonials: true,
    home_faq: true,
    home_app_download: true,
    about_team: true,
    about_timeline: true,
  }
};

export const useSiteSettings = () => {
  const [visibility, setVisibility] = useState<VisibilitySettings>(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // The API always returns a complete object, merging any missing keys
      // with the defaults, so there is nothing to guard against here.
      setVisibility((await siteSettings.get()) as unknown as VisibilitySettings);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching site settings:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPageVisible = (page: keyof VisibilitySettings['pages']) => {
    return visibility.pages[page] ?? true;
  };

  const isSectionVisible = (section: keyof VisibilitySettings['sections']) => {
    return visibility.sections[section] ?? true;
  };

  return {
    visibility,
    loading,
    isPageVisible,
    isSectionVisible,
    refetch: fetchSettings
  };
};

export type { VisibilitySettings };
export { DEFAULT_VISIBILITY };