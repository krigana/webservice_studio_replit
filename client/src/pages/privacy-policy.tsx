import { useQuery } from "@tanstack/react-query";
import { useLanguage, useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useState, useEffect } from "react";

interface SiteSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  privacyPolicyTitle: string;
  privacyPolicyContent: string;
  privacyPolicyLastUpdated: string;
}

export default function PrivacyPolicy() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { data: siteSettings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
  });

  const [translatedTitle, setTranslatedTitle] = useState<string>("");
  const [translatedContent, setTranslatedContent] = useState<string>("");
  const [translatedLastUpdated, setTranslatedLastUpdated] = useState<string>("");
  const [translatedLabels, setTranslatedLabels] = useState<{
    lastUpdated: string;
    contactInfo: string;
    company: string;
    phone: string;
    address: string;
  }>({
    lastUpdated: "",
    contactInfo: "",
    company: "",
    phone: "",
    address: ""
  });

  // Translate content when language or data changes
  useEffect(() => {
    const translateContent = async () => {
      if (!siteSettings) return;

      try {
        // Translate title
        const titleToTranslate = siteSettings.privacyPolicyTitle || "Політика конфіденціальності";
        const titleResponse = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: titleToTranslate,
            targetLanguage: language
          })
        });
        const titleData = await titleResponse.json();
        setTranslatedTitle(titleData.translatedText || titleToTranslate);

        // Translate content
        const contentToTranslate = siteSettings.privacyPolicyContent || `<h2>1. Загальні положення</h2>
<p>Ця Політика конфіденціальності описує, як ми збираємо, використовуємо та захищаємо вашу персональну інформацію при використанні нашого веб-сайту.</p>

<h2>2. Збір інформації</h2>
<p>Ми можемо збирати наступну інформацію: ім'я, контактну інформацію (включаючи адресу електронної пошти), демографічну інформацію, а також іншу інформацію, що стосується опитувань та/або пропозицій клієнтів.</p>

<h2>3. Використання файлів cookie</h2>
<p>Файли cookie — це невеликі файли, які веб-сайт або його постачальник послуг передає на жорсткий диск вашого комп'ютера через ваш веб-браузер (якщо ви дозволите це), що дозволяє системам веб-сайту або постачальника послуг розпізнавати ваш браузер і захоплювати та запам'ятовувати певну інформацію.</p>

<h2>4. Захист інформації</h2>
<p>Ми впроваджуємо різні заходи безпеки для підтримки безпеки вашої персональної інформації, коли ви розміщуєте замовлення або вводите, надсилаєте або отримуєте доступ до своєї персональної інформації.</p>

<h2>5. Розкриття інформації третім особам</h2>
<p>Ми не продаємо, не обмінюємо і не передаємо третім особам вашу персональну інформацію без вашої згоди, за винятком випадків, передбачених цією політикою.</p>

<h2>6. Контактна інформація</h2>
<p>Якщо у вас є питання щодо цієї Політики конфіденціальності, ви можете зв'язатися з нами, використовуючи інформацію нижче:</p>`;
        
        const contentResponse = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: contentToTranslate,
            targetLanguage: language
          })
        });
        const contentData = await contentResponse.json();
        setTranslatedContent(contentData.translatedText || contentToTranslate);

        // Translate last updated
        const lastUpdatedToTranslate = siteSettings.privacyPolicyLastUpdated || "грудень 2024";
        const lastUpdatedResponse = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: lastUpdatedToTranslate,
            targetLanguage: language
          })
        });
        const lastUpdatedData = await lastUpdatedResponse.json();
        setTranslatedLastUpdated(lastUpdatedData.translatedText || lastUpdatedToTranslate);

        // Translate labels
        const labelsToTranslate = [
          "Останнє оновлення:",
          "Контактна інформація:",
          "Компанія:",
          "Телефон:",
          "Адреса:"
        ];

        const labelResponses = await Promise.all(
          labelsToTranslate.map(async (label) => {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: label,
                targetLanguage: language
              })
            });
            return response.json();
          })
        );

        setTranslatedLabels({
          lastUpdated: labelResponses[0].translatedText || labelsToTranslate[0],
          contactInfo: labelResponses[1].translatedText || labelsToTranslate[1],
          company: labelResponses[2].translatedText || labelsToTranslate[2],
          phone: labelResponses[3].translatedText || labelsToTranslate[3],
          address: labelResponses[4].translatedText || labelsToTranslate[4]
        });

      } catch (error) {
        console.error("Translation error:", error);
        // Fallback to original content if translation fails
        setTranslatedTitle(siteSettings.privacyPolicyTitle || "Політика конфіденціальності");
        setTranslatedContent(siteSettings.privacyPolicyContent || "");
        setTranslatedLastUpdated(siteSettings.privacyPolicyLastUpdated || "грудень 2024");
        setTranslatedLabels({
          lastUpdated: "Останнє оновлення:",
          contactInfo: "Контактна інформація:",
          company: "Компанія:",
          phone: "Телефон:",
          address: "Адреса:"
        });
      }
    };

    if (siteSettings && language) {
      translateContent();
    }
  }, [siteSettings, language]);

  if (isLoading || !translatedTitle) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {translatedTitle}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {translatedLabels.lastUpdated} {translatedLastUpdated}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: translatedContent }}
              />
              
              {siteSettings && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {translatedLabels.contactInfo}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>{translatedLabels.company}</strong> {siteSettings.companyName || 'Webservice Studio'}
                    </div>
                    <div>
                      <strong>Email:</strong> {siteSettings.email}
                    </div>
                    <div>
                      <strong>{translatedLabels.phone}</strong> {siteSettings.phone}
                    </div>
                    <div>
                      <strong>{translatedLabels.address}</strong> {siteSettings.address}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}