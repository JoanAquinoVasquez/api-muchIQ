import { create } from 'zustand';
import { translations, Language, TranslationKeys } from '../i18n/translations';

interface LanguageStore {
  language: Language;
  t: TranslationKeys;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: 'es',
  t: translations.es,
  
  setLanguage: (lang: Language) => {
    set({ 
      language: lang, 
      t: translations[lang] 
    });
  },
  
  toggleLanguage: () => {
    const currentLang = get().language;
    const newLang: Language = currentLang === 'es' ? 'en' : 'es';
    set({ 
      language: newLang, 
      t: translations[newLang] 
    });
  },
}));