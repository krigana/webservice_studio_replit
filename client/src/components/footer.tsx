import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { getQueryFn } from "@/lib/queryClient";
import type { SiteSettings, Service } from "@shared/schema";
import { TranslatedText } from "./translated-text";
import { DonutIcon } from "lucide-react";



export default function Footer() {
  const { t, language } = useTranslation();
  
  // Load site settings
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
  }) as { data: SiteSettings | undefined };

  // Load services for footer
  const { data: services } = useQuery({
    queryKey: ["/api/services"],
  }) as { data: Service[] | undefined };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePageNavigation = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.href = path;
  };

  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings?.companyName || "Webservice Studio"} 
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <DonutIcon className="w-12 h-12 text-primary" />
              )}
              <div style={{ 
                fontSize: '1rem',
                lineHeight: '1.2',
                fontWeight: '700',
                fontFamily: 'Oswald, sans-serif',
                textTransform: 'uppercase'
              }}>
                {siteSettings?.companyName ? (
                  siteSettings.companyName.split(' ').map((word, index) => (
                    <div key={index}>{word}</div>
                  ))
                ) : (
                  <>
                    <div>Webservice</div>
                    <div>Studio</div>
                  </>
                )}
              </div>
            </div>
            <p className="text-slate-400">
              {siteSettings && siteSettings.footerDescription ? (
                <TranslatedText 
                  text={siteSettings.footerDescription} 
                  targetLanguage={language}
                  fallback={t('footerDescription')}
                />
              ) : t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              {/* Facebook - показываем если нет настроек или если видимость включена */}
              {(!siteSettings || siteSettings.facebookVisible !== false) && (
                <a 
                  href={siteSettings?.facebookUrl || "#"} 
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook text-xl"></i>
                </a>
              )}
              {/* Instagram - показываем если нет настроек или если видимость включена */}
              {(!siteSettings || siteSettings.instagramVisible !== false) && (
                <a 
                  href={siteSettings?.instagramUrl || "#"} 
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram text-xl"></i>
                </a>
              )}
              {/* YouTube - показываем если видимость включена и есть URL */}
              {siteSettings?.youtubeVisible && siteSettings?.youtubeUrl && (
                <a 
                  href={siteSettings.youtubeUrl} 
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              )}
              {/* Telegram - показываем если видимость включена и есть URL */}
              {siteSettings?.telegramVisible && siteSettings?.telegramUrl && (
                <a 
                  href={siteSettings.telegramUrl} 
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-telegram text-xl"></i>
                </a>
              )}
              {/* GitHub - показываем если видимость включена и есть URL */}
              {siteSettings?.githubVisible && siteSettings?.githubUrl && (
                <a 
                  href={siteSettings.githubUrl} 
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-github text-xl"></i>
                </a>
              )}
              {/* LinkedIn - показываем если видимость включена и есть URL */}
              {siteSettings?.linkedinVisible && siteSettings?.linkedinUrl && (
                <a 
                  href={siteSettings.linkedinUrl} 
                  className="text-slate-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2 text-slate-400">
              {services?.filter(service => service.isVisible)
                .slice(0, 4) // Показываем только первые 4 услуги
                .map((service) => {
                  const currentLang = localStorage.getItem('language') || 'uk';
                  let title = service.title;
                  
                  if (currentLang === 'uk' && service.titleUk) title = service.titleUk;
                  else if (currentLang === 'ru' && service.titleRu) title = service.titleRu;
                  else if (currentLang === 'en' && service.titleEn) title = service.titleEn;
                  
                  return (
                    <li key={service.id}>
                      <button 
                        onClick={() => scrollToSection("services")}
                        className="hover:text-white transition-colors duration-200 text-left"
                      >
                        {title}
                      </button>
                    </li>
                  );
                })}
              
              {/* Показать ссылку "Все услуги" если их больше 4 */}
              {services && services.filter(service => service.isVisible).length > 4 && (
                <li>
                  <Link href="/services">
                    <button className="hover:text-white transition-colors duration-200 text-primary">
                      {t('viewAllServices')}
                    </button>
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button 
                  onClick={() => scrollToSection("about")}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('about')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("portfolio")}
                  className="hover:text-white transition-colors duration-200"
                >
                  {t('portfolio')}
                </button>
              </li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">{t('blog')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a 
                  href={`tel:${siteSettings?.phone || t('phoneValue')}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {siteSettings?.phone || t('phoneValue')}
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${siteSettings?.email || t('emailValue')}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {siteSettings?.email || t('emailValue')}
                </a>
              </li>
              <li>{siteSettings?.address || t('addressValue')}</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {siteSettings?.companyName || "Webservice Studio"}. {t('allRightsReserved')}</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <button 
                onClick={() => handlePageNavigation('/privacy-policy')}
                className="hover:text-white transition-colors duration-200"
              >
                {t('privacyPolicy')}
              </button>
              <button 
                onClick={() => handlePageNavigation('/sitemap')}
                className="hover:text-white transition-colors duration-200"
              >
                {t('sitemap') || 'Карта сайта'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
