import { useState, useEffect, useCallback } from "react";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeConfig {
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

const PRESET_THEMES: Record<string, ThemeConfig> = {
  light: {
    name: "Light",
    isDark: false,
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      background: "#ffffff",
      foreground: "#000000",
      muted: "#f3f4f6",
      mutedForeground: "#6b7280",
      border: "#e5e7eb",
      input: "#f3f4f6",
      ring: "#3b82f6",
    },
  },
  dark: {
    name: "Dark",
    isDark: true,
    colors: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#ec4899",
      background: "#000000",
      foreground: "#ffffff",
      muted: "#1f2937",
      mutedForeground: "#9ca3af",
      border: "#374151",
      input: "#1f2937",
      ring: "#3b82f6",
    },
  },
  ocean: {
    name: "Ocean",
    isDark: true,
    colors: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      accent: "#14b8a6",
      background: "#0f172a",
      foreground: "#f1f5f9",
      muted: "#1e293b",
      mutedForeground: "#94a3b8",
      border: "#334155",
      input: "#1e293b",
      ring: "#0ea5e9",
    },
  },
  sunset: {
    name: "Sunset",
    isDark: true,
    colors: {
      primary: "#f97316",
      secondary: "#f43f5e",
      accent: "#fbbf24",
      background: "#1f1f1f",
      foreground: "#fafafa",
      muted: "#2d2d2d",
      mutedForeground: "#a3a3a3",
      border: "#3d3d3d",
      input: "#2d2d2d",
      ring: "#f97316",
    },
  },
  forest: {
    name: "Forest",
    isDark: true,
    colors: {
      primary: "#10b981",
      secondary: "#059669",
      accent: "#84cc16",
      background: "#0f172a",
      foreground: "#f0fdf4",
      muted: "#1e3a1f",
      mutedForeground: "#86efac",
      border: "#2d5a2d",
      input: "#1e3a1f",
      ring: "#10b981",
    },
  },
};

export function useAdvancedTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(PRESET_THEMES.dark);
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("advancedTheme");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setCurrentTheme(parsed);
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const colors = { ...currentTheme.colors, ...customColors };

    // Set CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--color-${key}`;
      document.documentElement.style.setProperty(cssVar, value);
    });

    // Save to localStorage
    localStorage.setItem("advancedTheme", JSON.stringify(currentTheme));
  }, [currentTheme, customColors, isLoaded]);

  // Switch to preset theme
  const switchTheme = useCallback((themeName: string) => {
    if (PRESET_THEMES[themeName]) {
      setCurrentTheme(PRESET_THEMES[themeName]);
      setCustomColors({});
    }
  }, []);

  // Update custom color
  const updateColor = useCallback((colorKey: keyof ThemeColors, value: string) => {
    setCustomColors((prev) => ({
      ...prev,
      [colorKey]: value,
    }));
  }, []);

  // Reset to preset
  const resetToPreset = useCallback(() => {
    setCustomColors({});
  }, []);

  // Get all available themes
  const getAvailableThemes = useCallback(() => {
    return Object.values(PRESET_THEMES).map((theme) => ({
      name: theme.name,
      isDark: theme.isDark,
    }));
  }, []);

  return {
    currentTheme,
    customColors,
    switchTheme,
    updateColor,
    resetToPreset,
    getAvailableThemes,
    presetThemes: PRESET_THEMES,
  };
}
