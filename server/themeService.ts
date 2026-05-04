/**
 * Theme Service
 * Manages dark/light theme preferences and customization
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemePreference {
  userId: number;
  mode: ThemeMode;
  customColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    foreground?: string;
    accent?: string;
  };
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
  borderRadius: 'small' | 'medium' | 'large';
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeConfig {
  light: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
    muted: string;
    mutedForeground: string;
  };
  dark: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
    muted: string;
    mutedForeground: string;
  };
}

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    foreground: '#000000',
    accent: '#ec4899',
    muted: '#f3f4f6',
    mutedForeground: '#6b7280',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    background: '#0f172a',
    foreground: '#f8fafc',
    accent: '#f472b6',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
  },
};

const userThemePreferences = new Map<number, ThemePreference>();

/**
 * Get user theme preference
 */
export function getThemePreference(userId: number): ThemePreference {
  let preference = userThemePreferences.get(userId);

  if (!preference) {
    preference = {
      userId,
      mode: 'auto',
      fontSize: 'medium',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userThemePreferences.set(userId, preference);
  }

  return preference;
}

/**
 * Update theme mode
 */
export function setThemeMode(userId: number, mode: ThemeMode): ThemePreference {
  const preference = getThemePreference(userId);
  preference.mode = mode;
  preference.updatedAt = new Date();
  return preference;
}

/**
 * Update custom colors
 */
export function setCustomColors(userId: number, colors: Partial<ThemePreference['customColors']>): ThemePreference {
  const preference = getThemePreference(userId);
  preference.customColors = {
    ...preference.customColors,
    ...colors,
  };
  preference.updatedAt = new Date();
  return preference;
}

/**
 * Reset to default theme
 */
export function resetToDefaultTheme(userId: number): ThemePreference {
  const preference = getThemePreference(userId);
  preference.customColors = undefined;
  preference.mode = 'auto';
  preference.fontSize = 'medium';
  preference.borderRadius = 'medium';
  preference.updatedAt = new Date();
  return preference;
}

/**
 * Update font size
 */
export function setFontSize(userId: number, size: 'small' | 'medium' | 'large'): ThemePreference {
  const preference = getThemePreference(userId);
  preference.fontSize = size;
  preference.updatedAt = new Date();
  return preference;
}

/**
 * Update border radius
 */
export function setBorderRadius(userId: number, radius: 'small' | 'medium' | 'large'): ThemePreference {
  const preference = getThemePreference(userId);
  preference.borderRadius = radius;
  preference.updatedAt = new Date();
  return preference;
}

/**
 * Update font family
 */
export function setFontFamily(userId: number, fontFamily: string): ThemePreference {
  const preference = getThemePreference(userId);
  preference.fontFamily = fontFamily;
  preference.updatedAt = new Date();
  return preference;
}

/**
 * Get CSS variables for theme
 */
export function getThemeCSSVariables(userId: number): Record<string, string> {
  const preference = getThemePreference(userId);
  const isDark = preference.mode === 'dark' || (preference.mode === 'auto' && isSystemDarkMode());

  const baseTheme = isDark ? DEFAULT_THEME_CONFIG.dark : DEFAULT_THEME_CONFIG.light;
  const customColors = preference.customColors || {};

  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };

  const borderRadiusMap = {
    small: '4px',
    medium: '8px',
    large: '12px',
  };

  return {
    '--primary': customColors.primary || baseTheme.primary,
    '--secondary': customColors.secondary || baseTheme.secondary,
    '--background': customColors.background || baseTheme.background,
    '--foreground': customColors.foreground || baseTheme.foreground,
    '--accent': customColors.accent || baseTheme.accent,
    '--muted': baseTheme.muted,
    '--muted-foreground': baseTheme.mutedForeground,
    '--font-size': fontSizeMap[preference.fontSize],
    '--font-family': preference.fontFamily,
    '--border-radius': borderRadiusMap[preference.borderRadius],
  };
}

/**
 * Get theme CSS as string
 */
export function getThemeCSSString(userId: number): string {
  const variables = getThemeCSSVariables(userId);
  let css = ':root {\n';

  Object.entries(variables).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });

  css += '}\n';

  return css;
}

/**
 * Check if system prefers dark mode
 */
function isSystemDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Export theme configuration
 */
export function exportThemeConfig(): ThemeConfig {
  return DEFAULT_THEME_CONFIG;
}

/**
 * Get all available themes
 */
export function getAvailableThemes() {
  return {
    modes: ['light', 'dark', 'auto'],
    fontSizes: ['small', 'medium', 'large'],
    borderRadii: ['small', 'medium', 'large'],
    defaultFonts: [
      'system-ui, -apple-system, sans-serif',
      'Georgia, serif',
      'Courier New, monospace',
      'Trebuchet MS, sans-serif',
    ],
  };
}

/**
 * Get theme statistics
 */
export function getThemeStatistics() {
  const preferences = Array.from(userThemePreferences.values());

  const modeDistribution = {
    light: 0,
    dark: 0,
    auto: 0,
  };

  const fontSizeDistribution = {
    small: 0,
    medium: 0,
    large: 0,
  };

  const borderRadiusDistribution = {
    small: 0,
    medium: 0,
    large: 0,
  };

  preferences.forEach((pref) => {
    modeDistribution[pref.mode]++;
    fontSizeDistribution[pref.fontSize]++;
    borderRadiusDistribution[pref.borderRadius]++;
  });

  return {
    totalUsers: preferences.length,
    modeDistribution,
    fontSizeDistribution,
    borderRadiusDistribution,
    usersWithCustomColors: preferences.filter((p) => p.customColors).length,
  };
}

/**
 * Preset themes
 */
export const PRESET_THEMES = {
  ocean: {
    light: {
      primary: '#0369a1',
      secondary: '#0ea5e9',
      accent: '#06b6d4',
    },
    dark: {
      primary: '#38bdf8',
      secondary: '#0ea5e9',
      accent: '#06b6d4',
    },
  },
  forest: {
    light: {
      primary: '#15803d',
      secondary: '#22c55e',
      accent: '#84cc16',
    },
    dark: {
      primary: '#4ade80',
      secondary: '#22c55e',
      accent: '#84cc16',
    },
  },
  sunset: {
    light: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
    },
    dark: {
      primary: '#fb923c',
      secondary: '#f97316',
      accent: '#ea580c',
    },
  },
  midnight: {
    light: {
      primary: '#1e1b4b',
      secondary: '#312e81',
      accent: '#4f46e5',
    },
    dark: {
      primary: '#818cf8',
      secondary: '#6366f1',
      accent: '#4f46e5',
    },
  },
};

/**
 * Apply preset theme
 */
export function applyPresetTheme(userId: number, presetName: keyof typeof PRESET_THEMES): ThemePreference {
  const preset = PRESET_THEMES[presetName];
  if (!preset) {
    throw new Error(`Preset theme "${presetName}" not found`);
  }

  const preference = getThemePreference(userId);
  preference.customColors = {
    primary: preference.mode === 'dark' ? preset.dark.primary : preset.light.primary,
    secondary: preference.mode === 'dark' ? preset.dark.secondary : preset.light.secondary,
    accent: preference.mode === 'dark' ? preset.dark.accent : preset.light.accent,
  };
  preference.updatedAt = new Date();

  return preference;
}
