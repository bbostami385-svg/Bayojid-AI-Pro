import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Language = 'en' | 'bn' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar' | 'hi' | 'pt';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];

interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && LANGUAGES.some(l => l.code === savedLanguage)) {
      setLanguage(savedLanguage);
      applyLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      const detectedLang = LANGUAGES.some(l => l.code === browserLang) ? browserLang : 'en';
      setLanguage(detectedLang);
      applyLanguage(detectedLang);
    }
  }, []);

  const applyLanguage = (newLanguage: Language) => {
    document.documentElement.lang = newLanguage;
    localStorage.setItem('language', newLanguage);
    
    // Set text direction for RTL languages
    const rtlLanguages = ['ar', 'he'];
    if (rtlLanguages.includes(newLanguage)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    applyLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const currentLanguage = LANGUAGES.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          title={`Language: ${currentLanguage?.name}`}
        >
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{lang.flag}</span>
            <div className="flex flex-col flex-1">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
            </div>
            {language === lang.code && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
