import { useLanguage } from "@/lib/i18n";
import { TranslatedText } from "./translated-text";
import { useQuery } from "@tanstack/react-query";

export default function AboutSection() {
  const { language } = useLanguage();
  
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
  });
  
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            <TranslatedText 
              text={siteSettings?.aboutTitle || "Про нас"} 
              targetLanguage={language}
            />
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            <TranslatedText 
              text={siteSettings?.aboutDescription || "Ми - команда досвідчених розробників, дизайнерів та проектних менеджерів, що спеціалізуються на створенні сучасних веб-рішень. Наша мета - допомогти бізнесу розвиватися в цифровому світі."} 
              targetLanguage={language}
            />
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="flex flex-col justify-center">
            <div className="space-y-8 max-w-lg">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-[#00a7c7] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    <TranslatedText 
                      text={siteSettings?.feature1Title || "Швидкість"} 
                      targetLanguage={language}
                    />
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    <TranslatedText 
                      text={siteSettings?.feature1Description || "Оперативне виконання проектів з дотриманням усіх термінів"} 
                      targetLanguage={language}
                    />
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-[#feab6b] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    <TranslatedText 
                      text={siteSettings?.feature2Title || "Якість"} 
                      targetLanguage={language}
                    />
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    <TranslatedText 
                      text={siteSettings?.feature2Description || "Високі стандарти розробки та ретельне тестування"} 
                      targetLanguage={language}
                    />
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-[#9693e6] text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    <TranslatedText 
                      text={siteSettings?.feature3Title || "Підтримка"} 
                      targetLanguage={language}
                    />
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    <TranslatedText 
                      text={siteSettings?.feature3Description || "Постійна підтримка та супровід проектів"} 
                      targetLanguage={language}
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Team Image */}
          <div className="relative">
            {siteSettings?.aboutImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px]">
                <img 
                  src={siteSettings.aboutImageUrl} 
                  alt="Наша команда"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    <TranslatedText 
                      text="Webservice Studio" 
                      targetLanguage={language}
                    />
                  </h3>
                  <p className="text-white/90">
                    <TranslatedText 
                      text="Професійна веб-розробка з використанням сучасних технологій" 
                      targetLanguage={language}
                    />
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#00a7c7] via-[#9693e6] to-[#feab6b] p-8 min-h-[400px] flex flex-col justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V11h2v7h2v-6h3v6h2v-7.5c0-.83.67-1.5 1.5-1.5S24 9.67 24 10.5V18h-2v-6h-3v6h-2v-7h-2v-.5c0-1.93-1.57-3.5-3.5-3.5S7 8.57 7 10.5V18H4z"/>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    <TranslatedText 
                      text="Webservice Studio" 
                      targetLanguage={language}
                    />
                  </h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    <TranslatedText 
                      text="Професійна веб-розробка з використанням сучасних технологій" 
                      targetLanguage={language}
                    />
                  </p>
                  <div className="mt-6 flex justify-center space-x-4">
                    <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}