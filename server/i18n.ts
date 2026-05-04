/**
 * Internationalization (i18n) Service
 * Multi-language support for the application
 */

export type Language = 'en' | 'bn' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar' | 'hi' | 'pt';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

export interface Translation {
  key: string;
  [key: string]: string;
}

const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: '.', thousands: ',' },
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: '.', thousands: ',' },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: ',', thousands: '.' },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: ',', thousands: ' ' },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: ',', thousands: '.' },
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: '.', thousands: ',' },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: '.', thousands: ',' },
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: ',', thousands: '.' },
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: '.', thousands: ',' },
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: { decimal: ',', thousands: '.' },
  },
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'Advanced AI Chat Application',
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'button.send': 'Send',
    'button.export': 'Export',
    'button.share': 'Share',
    'button.delete': 'Delete',
    'button.save': 'Save',
    'button.cancel': 'Cancel',
    'message.welcome': 'Welcome to Bayojid AI Pro',
    'message.error': 'An error occurred',
    'message.success': 'Success',
  },
  bn: {
    'app.title': 'বায়োজিড এআই প্রো',
    'app.description': 'উন্নত এআই চ্যাট অ্যাপ্লিকেশন',
    'nav.home': 'হোম',
    'nav.chat': 'চ্যাট',
    'nav.settings': 'সেটিংস',
    'nav.profile': 'প্রোফাইল',
    'nav.logout': 'লগআউট',
    'button.send': 'পাঠান',
    'button.export': 'রপ্তানি',
    'button.share': 'শেয়ার',
    'button.delete': 'মুছুন',
    'button.save': 'সংরক্ষণ করুন',
    'button.cancel': 'বাতিল করুন',
    'message.welcome': 'বায়োজিড এআই প্রো-তে স্বাগতম',
    'message.error': 'একটি ত্রুটি ঘটেছে',
    'message.success': 'সফল',
  },
  es: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'Aplicación avanzada de chat de IA',
    'nav.home': 'Inicio',
    'nav.chat': 'Chat',
    'nav.settings': 'Configuración',
    'nav.profile': 'Perfil',
    'nav.logout': 'Cerrar sesión',
    'button.send': 'Enviar',
    'button.export': 'Exportar',
    'button.share': 'Compartir',
    'button.delete': 'Eliminar',
    'button.save': 'Guardar',
    'button.cancel': 'Cancelar',
    'message.welcome': 'Bienvenido a Bayojid AI Pro',
    'message.error': 'Ocurrió un error',
    'message.success': 'Éxito',
  },
  fr: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'Application de chat IA avancée',
    'nav.home': 'Accueil',
    'nav.chat': 'Chat',
    'nav.settings': 'Paramètres',
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',
    'button.send': 'Envoyer',
    'button.export': 'Exporter',
    'button.share': 'Partager',
    'button.delete': 'Supprimer',
    'button.save': 'Enregistrer',
    'button.cancel': 'Annuler',
    'message.welcome': 'Bienvenue dans Bayojid AI Pro',
    'message.error': 'Une erreur est survenue',
    'message.success': 'Succès',
  },
  de: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'Fortgeschrittene KI-Chat-Anwendung',
    'nav.home': 'Startseite',
    'nav.chat': 'Chat',
    'nav.settings': 'Einstellungen',
    'nav.profile': 'Profil',
    'nav.logout': 'Abmelden',
    'button.send': 'Senden',
    'button.export': 'Exportieren',
    'button.share': 'Teilen',
    'button.delete': 'Löschen',
    'button.save': 'Speichern',
    'button.cancel': 'Abbrechen',
    'message.welcome': 'Willkommen bei Bayojid AI Pro',
    'message.error': 'Ein Fehler ist aufgetreten',
    'message.success': 'Erfolg',
  },
  ja: {
    'app.title': 'Bayojid AI Pro',
    'app.description': '高度なAIチャットアプリケーション',
    'nav.home': 'ホーム',
    'nav.chat': 'チャット',
    'nav.settings': '設定',
    'nav.profile': 'プロフィール',
    'nav.logout': 'ログアウト',
    'button.send': '送信',
    'button.export': 'エクスポート',
    'button.share': '共有',
    'button.delete': '削除',
    'button.save': '保存',
    'button.cancel': 'キャンセル',
    'message.welcome': 'Bayojid AI Proへようこそ',
    'message.error': 'エラーが発生しました',
    'message.success': '成功',
  },
  zh: {
    'app.title': 'Bayojid AI Pro',
    'app.description': '高级AI聊天应用程序',
    'nav.home': '首页',
    'nav.chat': '聊天',
    'nav.settings': '设置',
    'nav.profile': '个人资料',
    'nav.logout': '登出',
    'button.send': '发送',
    'button.export': '导出',
    'button.share': '分享',
    'button.delete': '删除',
    'button.save': '保存',
    'button.cancel': '取消',
    'message.welcome': '欢迎使用 Bayojid AI Pro',
    'message.error': '发生错误',
    'message.success': '成功',
  },
  ar: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'تطبيق دردشة ذكاء اصطناعي متقدم',
    'nav.home': 'الصفحة الرئيسية',
    'nav.chat': 'الدردشة',
    'nav.settings': 'الإعدادات',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'button.send': 'إرسال',
    'button.export': 'تصدير',
    'button.share': 'مشاركة',
    'button.delete': 'حذف',
    'button.save': 'حفظ',
    'button.cancel': 'إلغاء',
    'message.welcome': 'مرحبا بك في Bayojid AI Pro',
    'message.error': 'حدث خطأ',
    'message.success': 'نجح',
  },
  hi: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'उन्नत AI चैट एप्लिकेशन',
    'nav.home': 'होम',
    'nav.chat': 'चैट',
    'nav.settings': 'सेटिंग्स',
    'nav.profile': 'प्रोफाइल',
    'nav.logout': 'लॉगआउट',
    'button.send': 'भेजें',
    'button.export': 'निर्यात',
    'button.share': 'साझा करें',
    'button.delete': 'हटाएं',
    'button.save': 'सहेजें',
    'button.cancel': 'रद्द करें',
    'message.welcome': 'Bayojid AI Pro में आपका स्वागत है',
    'message.error': 'एक त्रुटि हुई',
    'message.success': 'सफल',
  },
  pt: {
    'app.title': 'Bayojid AI Pro',
    'app.description': 'Aplicativo avançado de chat de IA',
    'nav.home': 'Início',
    'nav.chat': 'Bate-papo',
    'nav.settings': 'Configurações',
    'nav.profile': 'Perfil',
    'nav.logout': 'Sair',
    'button.send': 'Enviar',
    'button.export': 'Exportar',
    'button.share': 'Compartilhar',
    'button.delete': 'Excluir',
    'button.save': 'Salvar',
    'button.cancel': 'Cancelar',
    'message.welcome': 'Bem-vindo ao Bayojid AI Pro',
    'message.error': 'Ocorreu um erro',
    'message.success': 'Sucesso',
  },
};

const userLanguagePreferences = new Map<number, Language>();

/**
 * Get user's preferred language
 */
export function getUserLanguage(userId: number): Language {
  return userLanguagePreferences.get(userId) || 'en';
}

/**
 * Set user's preferred language
 */
export function setUserLanguage(userId: number, language: Language): void {
  if (!LANGUAGE_CONFIGS[language]) {
    throw new Error(`Language "${language}" is not supported`);
  }
  userLanguagePreferences.set(userId, language);
}

/**
 * Get translation for a key
 */
export function t(key: string, language: Language = 'en'): string {
  const translations = TRANSLATIONS[language];
  if (!translations) return key;
  return translations[key] || key;
}

/**
 * Get all translations for a language
 */
export function getTranslations(language: Language): Record<string, string> {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

/**
 * Get language configuration
 */
export function getLanguageConfig(language: Language): LanguageConfig {
  return LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.en;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGE_CONFIGS);
}

/**
 * Format date according to language
 */
export function formatDate(date: Date, language: Language): string {
  const config = getLanguageConfig(language);
  const formatter = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Format time according to language
 */
export function formatTime(date: Date, language: Language): string {
  const config = getLanguageConfig(language);
  const formatter = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Format number according to language
 */
export function formatNumber(num: number, language: Language): string {
  const config = getLanguageConfig(language);
  return new Intl.NumberFormat(language).format(num);
}

/**
 * Get language statistics
 */
export function getLanguageStatistics() {
  const preferences = Array.from(userLanguagePreferences.values());
  const distribution: Record<Language, number> = {} as any;

  Object.keys(LANGUAGE_CONFIGS).forEach((lang) => {
    distribution[lang as Language] = 0;
  });

  preferences.forEach((lang) => {
    distribution[lang]++;
  });

  return {
    totalUsers: preferences.length,
    distribution,
    supportedLanguages: Object.keys(LANGUAGE_CONFIGS).length,
  };
}

/**
 * Add custom translation
 */
export function addTranslation(language: Language, key: string, value: string): void {
  if (!TRANSLATIONS[language]) {
    TRANSLATIONS[language] = {};
  }
  TRANSLATIONS[language][key] = value;
}

/**
 * Detect language from browser
 */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0];
  const supportedLangs = Object.keys(LANGUAGE_CONFIGS) as Language[];

  if (supportedLangs.includes(browserLang as Language)) {
    return browserLang as Language;
  }

  return 'en';
}
