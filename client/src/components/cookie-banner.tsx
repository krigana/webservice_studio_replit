import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Settings as SettingsIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";

interface SiteSettings {
  cookieConsentEnabled: boolean;
  cookieTitle: string;
  cookieMessage: string;
  cookieAcceptText: string;
  cookieDeclineText: string;
  cookieSettingsText: string;
  cookiePolicyUrl: string;
  cookiePosition: string;
  cookieTheme: string;
  cookieTitleUk: string | null;
  cookieTitleRu: string | null;
  cookieTitleEn: string | null;
  cookieMessageUk: string | null;
  cookieMessageRu: string | null;
  cookieMessageEn: string | null;
  cookieAcceptTextUk: string | null;
  cookieAcceptTextRu: string | null;
  cookieAcceptTextEn: string | null;
  cookieDeclineTextUk: string | null;
  cookieDeclineTextRu: string | null;
  cookieDeclineTextEn: string | null;
  cookieSettingsTextUk: string | null;
  cookieSettingsTextRu: string | null;
  cookieSettingsTextEn: string | null;
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { language } = useLanguage();

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  // Базовые переводы для куки-баннера
  const getDefaultTexts = () => ({
    title: {
      uk: "Ми використовуємо файли cookie",
      ru: "Мы используем файлы cookie", 
      en: "We use cookies"
    },
    message: {
      uk: "Цей сайт використовує файли cookie для покращення вашого досвіду користування.",
      ru: "Этот сайт использует файлы cookie для улучшения вашего опыта пользования.",
      en: "This website uses cookies to improve your browsing experience."
    },
    accept: {
      uk: "Прийняти",
      ru: "Принять",
      en: "Accept"
    },
    decline: {
      uk: "Відхилити", 
      ru: "Отклонить",
      en: "Decline"
    },
    settings: {
      uk: "Налаштування",
      ru: "Настройки", 
      en: "Settings"
    },
    learnMore: {
      uk: "Дізнатися більше",
      ru: "Узнать больше",
      en: "Learn more"
    }
  });

  // Функция для получения текста на нужном языке
  const getLocalizedText = (textUk: string | null, textRu: string | null, textEn: string | null, textKey: keyof ReturnType<typeof getDefaultTexts>) => {
    const defaults = getDefaultTexts();
    
    switch (language) {
      case 'uk':
        return textUk || defaults[textKey].uk;
      case 'ru':
        return textRu || defaults[textKey].ru;
      case 'en':
        return textEn || defaults[textKey].en;
      default:
        return textUk || defaults[textKey].uk;
    }
  };

  useEffect(() => {
    // Проверяем, согласился ли пользователь на куки
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent && siteSettings?.cookieConsentEnabled) {
      setIsVisible(true);
    }
  }, [siteSettings]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  if (!isVisible || !siteSettings?.cookieConsentEnabled) {
    return null;
  }

  const positionClasses = {
    top: "top-0 left-0 right-0",
    bottom: "bottom-0 left-0 right-0",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  };

  const themeClasses = {
    light: "bg-white text-black border-gray-200",
    dark: "bg-gray-900 text-white border-gray-700",
    auto: "bg-white dark:bg-gray-900 text-black dark:text-white border-gray-200 dark:border-gray-700"
  };

  return (
    <div className={`fixed z-50 ${positionClasses[siteSettings.cookiePosition as keyof typeof positionClasses] || positionClasses.bottom}`}>
      <Card className={`mx-4 my-4 shadow-lg ${themeClasses[siteSettings.cookieTheme as keyof typeof themeClasses] || themeClasses.light}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {getLocalizedText(
                siteSettings?.cookieTitleUk,
                siteSettings?.cookieTitleRu,
                siteSettings?.cookieTitleEn,
                "title"
              )}
            </h3>
          </div>
          
          <p className="text-sm mb-4 opacity-90">
            {getLocalizedText(
              siteSettings?.cookieMessageUk,
              siteSettings?.cookieMessageRu,
              siteSettings?.cookieMessageEn,
              "message"
            )}
            {" "}
            <a 
              href="/privacy-policy" 
              className="text-primary hover:text-accent underline"
            >
              {getLocalizedText(null, null, null, "learnMore")}
            </a>
          </p>

          {showSettings && (
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">Налаштування куки</h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked disabled className="mr-2" />
                  Необхідні куки (завжди активні)
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  Аналітичні куки
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Маркетингові куки
                </label>
              </div>
              {siteSettings.cookiePolicyUrl && (
                <a 
                  href={siteSettings.cookiePolicyUrl}
                  className="text-blue-600 dark:text-blue-400 text-sm underline mt-2 inline-block"
                >
                  Политика конфиденциальности
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-primary hover:bg-accent text-primary-foreground"
            >
              {getLocalizedText(
                siteSettings?.cookieAcceptTextUk,
                siteSettings?.cookieAcceptTextRu,
                siteSettings?.cookieAcceptTextEn,
                "accept"
              )}
            </Button>
            
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {getLocalizedText(
                siteSettings?.cookieDeclineTextUk,
                siteSettings?.cookieDeclineTextRu,
                siteSettings?.cookieDeclineTextEn,
                "decline"
              )}
            </Button>
            
            <Button
              onClick={handleSettings}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-primary hover:bg-primary/10"
            >
              <SettingsIcon className="h-4 w-4" />
              {getLocalizedText(
                siteSettings?.cookieSettingsTextUk,
                siteSettings?.cookieSettingsTextRu,
                siteSettings?.cookieSettingsTextEn,
                "settings"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}