import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Monitor, Smartphone, ShoppingCart, Palette, Search, ArrowRight } from "lucide-react";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { getServiceTitle, getServiceDescription, getServiceFeatures } from "@/lib/project-utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Service } from "@shared/schema";
import { ServiceOrderModal } from "./service-order-modal";

export default function ServicesSection() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const handleOrderClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const getServiceIcon = (iconName: string, index: number) => {
    const colors = [
      'text-[#00a7c7]', // primary blue
      'text-[#feab6b]', // orange
      'text-[#9693e6]', // purple
      'text-[#ff8a8a]', // coral
      'text-[#00a7c7]'  // primary blue again
    ];
    
    const colorClass = colors[index % colors.length];
    
    switch (iconName) {
      case 'Monitor':
        return <Monitor className={`w-8 h-8 ${colorClass}`} />;
      case 'Smartphone':
        return <Smartphone className={`w-8 h-8 ${colorClass}`} />;
      case 'ShoppingCart':
        return <ShoppingCart className={`w-8 h-8 ${colorClass}`} />;
      case 'Palette':
        return <Palette className={`w-8 h-8 ${colorClass}`} />;
      case 'Search':
        return <Search className={`w-8 h-8 ${colorClass}`} />;
      default:
        return <Monitor className={`w-8 h-8 ${colorClass}`} />;
    }
  };

  if (isLoading) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">{t('servicesTitle')}</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('servicesDescription')}
            </p>
          </div>
          <div className="text-center py-8 text-slate-600">
            {t('noServicesAvailable')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-secondary mb-4">{t('servicesTitle')}</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('servicesDescription')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 3).map((service, index) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              <div className="p-8 flex-grow">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    {getServiceIcon(service.icon, index)}
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-3">
                    {getServiceTitle(service, language)}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {getServiceDescription(service, language)}
                  </p>
                </div>
                
                <ul className="space-y-3">
                  {getServiceFeatures(service, language).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-8 pt-0">
                <Button 
                  onClick={() => handleOrderClick(service)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {t('orderService')}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {services.length > 3 && (
          <div className="text-center mt-12">
            <Link href="/services">
              <Button 
                size="lg"
                className="bg-orange text-white hover:bg-purple transition-all duration-200 transform hover:scale-105"
              >
                {t('viewAllServices')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
        
        <ServiceOrderModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
        />
      </div>
    </section>
  );
}