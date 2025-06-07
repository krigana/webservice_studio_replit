import { useLanguage, type Language } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; flag: string }[] = [
    { code: 'uk', flag: '🇺🇦' },
    { code: 'en', flag: '🇺🇸' },
    { code: 'ru', flag: '🇷🇺' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`w-7 h-7 rounded text-base transition-all duration-200 flex items-center justify-center ${
            language === lang.code 
              ? 'bg-orange text-white shadow-md scale-105' 
              : 'hover:bg-purple hover:text-white opacity-60 hover:opacity-100'
          }`}
          title={lang.code.toUpperCase()}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}