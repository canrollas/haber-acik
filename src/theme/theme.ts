export const lightColors = {
  primary: '#0037b0',
  primaryContainer: '#1d4ed8',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#cad3ff',
  
  surface: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  
  onSurface: '#0b1c30',
  onSurfaceVariant: '#434655',
  
  background: '#f8f9ff',
  onBackground: '#0b1c30',
  
  outline: '#747686',
  outlineVariant: '#c4c5d7',
  
  secondary: '#565e74',
  secondaryContainer: '#dae2fd',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#5c647a',
  
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  breaking: '#e11d2e',
  onBreaking: '#ffffff',
};

export const darkColors = {
  primary: '#adc6ff',
  primaryContainer: '#0037b0',
  onPrimary: '#00164e',
  onPrimaryContainer: '#d8e2ff',
  
  surface: '#111318',
  surfaceDim: '#111318',
  surfaceBright: '#37393e',
  surfaceContainerLowest: '#0c0e13',
  surfaceContainerLow: '#191b20',
  surfaceContainer: '#1d2024',
  surfaceContainerHigh: '#282a2f',
  surfaceContainerHighest: '#33353a',
  
  onSurface: '#e1e2e8',
  onSurfaceVariant: '#c4c6d0',
  
  background: '#111318',
  onBackground: '#e1e2e8',
  
  outline: '#8e9099',
  outlineVariant: '#44474e',
  
  secondary: '#bfc6dc',
  secondaryContainer: '#3f4759',
  onSecondary: '#293041',
  onSecondaryContainer: '#dbe2f9',
  
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  breaking: '#ffb4ab',
  onBreaking: '#690005',
};

export type Colors = typeof lightColors;

export const typography = {
  headlineXl: {
    fontFamily: 'SourceSerif4_700Bold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72, // -0.02em
  },
  headlineLg: {
    fontFamily: 'SourceSerif4_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.28, // -0.01em
  },
  headlineLgMobile: {
    fontFamily: 'SourceSerif4_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  headlineMd: {
    fontFamily: 'SourceSerif4_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 30,
  },
  bodyMd: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.7, // 0.05em
  },
  labelSm: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
};

export const spacing = {
  marginMobile: 20, // 1.25rem
  marginDesktop: 40, // 2.5rem
  gutter: 16, // 1rem
  stackSm: 8, // 0.5rem
  stackMd: 24, // 1.5rem
  stackLg: 48, // 3rem
};

export const rounded = {
  sm: 2, // 0.125rem
  DEFAULT: 4, // 0.25rem
  md: 6, // 0.375rem
  lg: 8, // 0.5rem
  xl: 12, // 0.75rem
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 1,
  },
};

export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Rounded = typeof rounded;
export type Shadows = typeof shadows;

export interface AppTheme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  rounded: Rounded;
  shadows: Shadows;
  isDark: boolean;
}

// Keep the default export for backwards compatibility during transition or default usages
export const theme = {
  colors: lightColors,
  typography,
  spacing,
  rounded,
  shadows,
};
