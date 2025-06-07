import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Monitor, Smartphone, ShoppingCart, Palette, Search, ArrowLeft } from "lucide-react";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { getServiceTitle, getServiceDescription, getServiceFeatures } from "@/lib/project-utils";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Service } from "@shared/schema";
import { ServiceOrderModal } from "@/components/service-order-modal";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ServicesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Прокрутка в начало страницы при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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
      <>
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-slate-600">{t('loading')}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button 
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToMain')}
            </Button>
          </Link>
        </div>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            {t('services')}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('servicesDescription')}
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
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
        
        <div className="text-center mt-12">
          <Link href="/">
            <Button 
              size="lg"
              variant="outline"
              className="border-orange text-orange hover:bg-orange hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToMain')}
            </Button>
          </Link>
        </div>
        
        <ServiceOrderModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
        />
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}