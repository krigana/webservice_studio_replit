import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { ProjectDiscussionModal } from "./project-discussion-modal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { SiteSettings } from "@shared/schema";

export default function HeroSection() {
  const { t, language } = useTranslation();
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  
  // Load site settings
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
    queryFn: getQueryFn({ on401: "ignore" }),
  });
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper functions to get translated content from site settings
  const getHeroTitle1 = () => {
    if (!siteSettings) return t('heroTitle1');
    switch (language) {
      case 'uk': return siteSettings.heroTitle1Uk || t('heroTitle1');
      case 'ru': return siteSettings.heroTitle1Ru || t('heroTitle1');
      case 'en': return siteSettings.heroTitle1En || t('heroTitle1');
      default: return t('heroTitle1');
    }
  };

  const getHeroTitle2 = () => {
    if (!siteSettings) return t('heroTitle2');
    switch (language) {
      case 'uk': return siteSettings.heroTitle2Uk || t('heroTitle2');
      case 'ru': return siteSettings.heroTitle2Ru || t('heroTitle2');
      case 'en': return siteSettings.heroTitle2En || t('heroTitle2');
      default: return t('heroTitle2');
    }
  };

  const getHeroTitle3 = () => {
    if (!siteSettings) return t('heroTitle3');
    switch (language) {
      case 'uk': return siteSettings.heroTitle3Uk || t('heroTitle3');
      case 'ru': return siteSettings.heroTitle3Ru || t('heroTitle3');
      case 'en': return siteSettings.heroTitle3En || t('heroTitle3');
      default: return t('heroTitle3');
    }
  };

  const getHeroDescription = () => {
    if (!siteSettings) return t('heroDescription');
    switch (language) {
      case 'uk': return siteSettings.heroDescriptionUk || t('heroDescription');
      case 'ru': return siteSettings.heroDescriptionRu || t('heroDescription');
      case 'en': return siteSettings.heroDescriptionEn || t('heroDescription');
      default: return t('heroDescription');
    }
  };

  return (
    <section className="pt-28 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4-5xl font-bold leading-none">
              <span className="text-secondary block sm:inline">{getHeroTitle1()}</span>
              <span className="gradient-text block">{getHeroTitle2()}</span>
              <span className="text-secondary block sm:inline">{getHeroTitle3()}</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 leading-relaxed max-w-lg">
              {getHeroDescription()}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setIsDiscussionModalOpen(true)}
                size="lg"
                className="bg-primary text-white btn-custom-hover transform hover:scale-105"
              >
                {t('discussProject')}
              </Button>
              <Button 
                onClick={() => scrollToSection("portfolio")}
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary btn-custom-hover"
              >
                {t('viewWorks')}
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">50+</div>
                <div className="text-sm text-slate-500">{t('projects')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">5</div>
                <div className="text-sm text-slate-500">{t('experience')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">98%</div>
                <div className="text-sm text-slate-500">{t('happyClients')}</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Modern web development workspace with multiple monitors showing code" 
              className="rounded-2xl shadow-2xl w-full h-auto animate-float" 
            />
            
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-accent to-primary rounded-full opacity-10 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <ProjectDiscussionModal 
        isOpen={isDiscussionModalOpen}
        onClose={() => setIsDiscussionModalOpen(false)}
      />
    </section>
  );
}
