/**
 * White-Label Customization Service
 * Allows resellers and partners to customize branding
 */

export interface BrandingConfig {
  id: string;
  partnerId: number;
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain: string;
  supportEmail: string;
  supportPhone?: string;
  termsUrl?: string;
  privacyUrl?: string;
  aboutUrl?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  customCSS?: string;
  enableBranding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeConfig {
  darkMode: boolean;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
  shadows: boolean;
  animations: boolean;
}

const brandingConfigs: Map<number, BrandingConfig> = new Map();
const themeConfigs: Map<number, ThemeConfig> = new Map();

/**
 * Create white-label branding configuration
 */
export function createBrandingConfig(
  partnerId: number,
  config: Partial<BrandingConfig>
): BrandingConfig {
  const brandingConfig: BrandingConfig = {
    id: `branding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    partnerId,
    appName: config.appName || 'AI Pro',
    logoUrl: config.logoUrl || '/default-logo.png',
    faviconUrl: config.faviconUrl || '/default-favicon.ico',
    primaryColor: config.primaryColor || '#667eea',
    secondaryColor: config.secondaryColor || '#764ba2',
    accentColor: config.accentColor || '#00d4ff',
    customDomain: config.customDomain || '',
    supportEmail: config.supportEmail || 'support@example.com',
    supportPhone: config.supportPhone,
    termsUrl: config.termsUrl,
    privacyUrl: config.privacyUrl,
    aboutUrl: config.aboutUrl,
    socialLinks: config.socialLinks || {},
    customCSS: config.customCSS,
    enableBranding: config.enableBranding !== false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  brandingConfigs.set(partnerId, brandingConfig);
  return brandingConfig;
}

/**
 * Update branding configuration
 */
export function updateBrandingConfig(
  partnerId: number,
  updates: Partial<BrandingConfig>
): BrandingConfig | undefined {
  const config = brandingConfigs.get(partnerId);
  if (!config) return undefined;

  const updated: BrandingConfig = {
    ...config,
    ...updates,
    id: config.id,
    partnerId: config.partnerId,
    createdAt: config.createdAt,
    updatedAt: new Date(),
  };

  brandingConfigs.set(partnerId, updated);
  return updated;
}

/**
 * Get branding configuration
 */
export function getBrandingConfig(partnerId: number): BrandingConfig | undefined {
  return brandingConfigs.get(partnerId);
}

/**
 * Get default branding configuration
 */
export function getDefaultBrandingConfig(): BrandingConfig {
  return {
    id: 'default-branding',
    partnerId: 0,
    appName: 'Bayojid AI Pro',
    logoUrl: '/bayojid-ai-logo.jpg',
    faviconUrl: '/favicon.ico',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#00d4ff',
    customDomain: '',
    supportEmail: 'support@bayojid-ai.com',
    supportPhone: '+1-800-BAYOJID',
    termsUrl: 'https://bayojid-ai.com/terms',
    privacyUrl: 'https://bayojid-ai.com/privacy',
    aboutUrl: 'https://bayojid-ai.com/about',
    socialLinks: {
      twitter: 'https://twitter.com/bayojidai',
      facebook: 'https://facebook.com/bayojidai',
      linkedin: 'https://linkedin.com/company/bayojidai',
      instagram: 'https://instagram.com/bayojidai',
    },
    enableBranding: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Create theme configuration
 */
export function createThemeConfig(
  partnerId: number,
  config: Partial<ThemeConfig> = {}
): ThemeConfig {
  const themeConfig: ThemeConfig = {
    darkMode: config.darkMode !== false,
    fontFamily: config.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: config.borderRadius || '8px',
    spacing: config.spacing || '4px',
    shadows: config.shadows !== false,
    animations: config.animations !== false,
  };

  themeConfigs.set(partnerId, themeConfig);
  return themeConfig;
}

/**
 * Get theme configuration
 */
export function getThemeConfig(partnerId: number): ThemeConfig {
  return (
    themeConfigs.get(partnerId) || {
      darkMode: true,
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '8px',
      spacing: '4px',
      shadows: true,
      animations: true,
    }
  );
}

/**
 * Generate CSS variables from branding config
 */
export function generateCSSVariables(config: BrandingConfig): string {
  return `
    :root {
      --primary-color: ${config.primaryColor};
      --secondary-color: ${config.secondaryColor};
      --accent-color: ${config.accentColor};
      --app-name: '${config.appName}';
    }
    
    ${config.customCSS || ''}
  `;
}

/**
 * Generate HTML meta tags from branding config
 */
export function generateMetaTags(config: BrandingConfig): string {
  return `
    <meta name="application-name" content="${config.appName}">
    <meta name="theme-color" content="${config.primaryColor}">
    <link rel="icon" href="${config.faviconUrl}">
    <link rel="apple-touch-icon" href="${config.logoUrl}">
    <meta property="og:image" content="${config.logoUrl}">
    <meta name="twitter:image" content="${config.logoUrl}">
  `;
}

/**
 * Validate branding configuration
 */
export function validateBrandingConfig(config: Partial<BrandingConfig>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.appName || config.appName.length < 2) {
    errors.push('App name must be at least 2 characters');
  }

  if (!config.logoUrl) {
    errors.push('Logo URL is required');
  }

  if (!config.primaryColor || !/^#[0-9A-F]{6}$/i.test(config.primaryColor)) {
    errors.push('Primary color must be a valid hex color');
  }

  if (!config.supportEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.supportEmail)) {
    errors.push('Support email must be a valid email address');
  }

  if (config.customDomain && !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(config.customDomain)) {
    errors.push('Custom domain must be a valid domain name');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get branding configuration for rendering
 */
export function getBrandingForRender(partnerId: number): BrandingConfig {
  return getBrandingConfig(partnerId) || getDefaultBrandingConfig();
}

/**
 * List all branding configurations (admin)
 */
export function listBrandingConfigs(): BrandingConfig[] {
  return Array.from(brandingConfigs.values());
}

/**
 * Delete branding configuration
 */
export function deleteBrandingConfig(partnerId: number): boolean {
  return brandingConfigs.delete(partnerId);
}

/**
 * Export branding configuration as JSON
 */
export function exportBrandingConfig(partnerId: number): string | null {
  const config = getBrandingConfig(partnerId);
  if (!config) return null;
  return JSON.stringify(config, null, 2);
}

/**
 * Import branding configuration from JSON
 */
export function importBrandingConfig(partnerId: number, json: string): BrandingConfig | null {
  try {
    const config = JSON.parse(json);
    const validation = validateBrandingConfig(config);
    if (!validation.valid) {
      console.error('Invalid branding config:', validation.errors);
      return null;
    }
    return createBrandingConfig(partnerId, config);
  } catch (error) {
    console.error('Failed to import branding config:', error);
    return null;
  }
}

/**
 * Get branding statistics
 */
export function getBrandingStats() {
  return {
    totalConfigs: brandingConfigs.size,
    configs: Array.from(brandingConfigs.entries()).map(([partnerId, config]) => ({
      partnerId,
      appName: config.appName,
      customDomain: config.customDomain,
      enableBranding: config.enableBranding,
      createdAt: config.createdAt,
    })),
  };
}
