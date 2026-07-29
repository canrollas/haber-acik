import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging, subscribeToTopic as _subscribeToTopic, unsubscribeFromTopic as _unsubscribeFromTopic } from '@react-native-firebase/messaging';

const subscribeToTopic = (topic: string) => _subscribeToTopic(getMessaging(), topic);
const unsubscribeFromTopic = (topic: string) => _unsubscribeFromTopic(getMessaging(), topic);

const CATEGORIES_STORAGE_KEY = 'haberacik.selectedCategories';
const SOURCES_STORAGE_KEY = 'haberacik.followedSources';
const BREAKING_ALERTS_STORAGE_KEY = 'haberacik.breakingAlerts';

interface PreferencesContextType {
  selectedCategories: string[]; // category slugs
  followedSources: string[]; // source slugs
  breakingAlertsEnabled: boolean;
  isLoaded: boolean;
  setSelectedCategories: (slugs: string[]) => void;
  setFollowedSources: (slugs: string[]) => void;
  toggleCategory: (slug: string) => void;
  toggleSource: (slug: string) => void;
  setBreakingAlertsEnabled: (enabled: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>([]);
  const [followedSources, setFollowedSourcesState] = useState<string[]>([]);
  const [breakingAlertsEnabled, setBreakingAlertsEnabledState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CATEGORIES_STORAGE_KEY),
      AsyncStorage.getItem(SOURCES_STORAGE_KEY),
      AsyncStorage.getItem(BREAKING_ALERTS_STORAGE_KEY),
    ]).then(([categoriesRaw, sourcesRaw, breakingAlertsRaw]) => {
      let categories: string[] = [];
      let sources: string[] = [];
      const breakingAlerts = breakingAlertsRaw === null ? true : breakingAlertsRaw === 'true';

      if (categoriesRaw) {
        try {
          categories = JSON.parse(categoriesRaw);
          setSelectedCategoriesState(categories);
        } catch { }
      }
      if (sourcesRaw) {
        try {
          sources = JSON.parse(sourcesRaw);
          setFollowedSourcesState(sources);
        } catch { }
      }
      setBreakingAlertsEnabledState(breakingAlerts);
      setIsLoaded(true);

      // Ensure the device's FCM topic subscriptions actually match the
      // loaded/default preferences, in case a prior session never synced them
      // (e.g. first launch defaults, or a reinstalled app with a new FCM token).
      categories.forEach(slug => {
        subscribeToTopic(`category_${slug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`).catch(console.error);
      });
      sources.forEach(slug => {
        subscribeToTopic(`source_${slug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`).catch(console.error);
      });
      if (breakingAlerts) {
        subscribeToTopic('breaking_alerts').catch(console.error);
      }
    });
  }, []);

  const setSelectedCategories = (slugs: string[]) => {
    // Sync FCM Topics for Categories
    selectedCategories.forEach(oldSlug => {
      if (!slugs.includes(oldSlug)) {
        unsubscribeFromTopic(`category_${oldSlug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`).catch(console.error);
      }
    });
    slugs.forEach(newSlug => {
      if (!selectedCategories.includes(newSlug)) {
        subscribeToTopic(`category_${newSlug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`).catch(console.error);
      }
    });

    setSelectedCategoriesState(slugs);
    AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(slugs));
  };

  const setFollowedSources = (slugs: string[]) => {
    // Sync FCM Topics for Sources
    followedSources.forEach(oldSlug => {
      if (!slugs.includes(oldSlug)) {
        unsubscribeFromTopic(`source_${oldSlug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`).catch(console.error);
      }
    });
    slugs.forEach(newSlug => {
      if (!followedSources.includes(newSlug)) {
        subscribeToTopic(`source_${newSlug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`).catch(console.error);
      }
    });

    setFollowedSourcesState(slugs);
    AsyncStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(slugs));
  };

  const toggleCategory = (slug: string) => {
    const isSelected = selectedCategories.includes(slug);
    const topic = `category_${slug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`;

    if (isSelected) {
      unsubscribeFromTopic(topic).catch(console.error);
      setSelectedCategoriesState(selectedCategories.filter(s => s !== slug));
      AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(selectedCategories.filter(s => s !== slug)));
    } else {
      subscribeToTopic(topic).catch(console.error);
      setSelectedCategoriesState([...selectedCategories, slug]);
      AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify([...selectedCategories, slug]));
    }
  };

  const toggleSource = (slug: string) => {
    const isSelected = followedSources.includes(slug);
    const topic = `source_${slug.replace(/[^a-zA-Z0-9-_.~%]/g, '')}`;

    if (isSelected) {
      unsubscribeFromTopic(topic).catch(console.error);
      setFollowedSourcesState(followedSources.filter(s => s !== slug));
      AsyncStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(followedSources.filter(s => s !== slug)));
    } else {
      subscribeToTopic(topic).catch(console.error);
      setFollowedSourcesState([...followedSources, slug]);
      AsyncStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify([...followedSources, slug]));
    }
  };

  const setBreakingAlertsEnabled = (enabled: boolean) => {
    if (enabled) {
      subscribeToTopic('breaking_alerts').catch(console.error);
    } else {
      unsubscribeFromTopic('breaking_alerts').catch(console.error);
    }
    setBreakingAlertsEnabledState(enabled);
    AsyncStorage.setItem(BREAKING_ALERTS_STORAGE_KEY, String(enabled));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <PreferencesContext.Provider
      value={{
        selectedCategories,
        followedSources,
        breakingAlertsEnabled,
        isLoaded,
        setSelectedCategories,
        setFollowedSources,
        toggleCategory,
        toggleSource,
        setBreakingAlertsEnabled,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
