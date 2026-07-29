import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, typography, spacing, rounded, shadows, AppTheme, Typography } from './theme';

type ThemeMode = 'system' | 'light' | 'dark';
export type TextScale = 'small' | 'medium' | 'large';

const TEXT_SCALE_FACTORS: Record<TextScale, number> = {
  small: 0.92,
  medium: 1,
  large: 1.15,
};

function scaleTypography(scale: TextScale): Typography {
  const factor = TEXT_SCALE_FACTORS[scale];
  return Object.fromEntries(
    Object.entries(typography).map(([key, style]) => [
      key,
      {
        ...style,
        fontSize: Math.round(style.fontSize * factor),
        lineHeight: Math.round(style.lineHeight * factor),
      },
    ])
  ) as Typography;
}

interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
}

const THEME_STORAGE_KEY = 'haberacik.themeMode';
const TEXT_SCALE_STORAGE_KEY = 'haberacik.textScale';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [textScale, setTextScaleState] = useState<TextScale>('medium');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      AsyncStorage.getItem(TEXT_SCALE_STORAGE_KEY),
    ]).then(([themeValue, textScaleValue]) => {
      if (themeValue === 'light' || themeValue === 'dark' || themeValue === 'system') {
        setThemeModeState(themeValue as ThemeMode);
      }
      if (textScaleValue === 'small' || textScaleValue === 'medium' || textScaleValue === 'large') {
        setTextScaleState(textScaleValue as TextScale);
      }
      setIsLoaded(true);
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const setTextScale = async (scale: TextScale) => {
    setTextScaleState(scale);
    await AsyncStorage.setItem(TEXT_SCALE_STORAGE_KEY, scale);
  };

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const theme: AppTheme = {
    colors: isDark ? darkColors : lightColors,
    typography: scaleTypography(textScale),
    spacing,
    rounded,
    shadows,
    isDark,
  };

  if (!isLoaded) {
    return null; // Or some loading state if preferred, but usually this is very fast
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, textScale, setTextScale }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
