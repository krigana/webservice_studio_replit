import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";
import { SiPaypal } from "react-icons/si";

// Компонент яркой иконки пончика
const DonutIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      fill="url(#donutGradient)"
      stroke="#8B4513"
      strokeWidth="0.5"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="4" 
      fill="#F5F5DC"
      stroke="#8B4513"
      strokeWidth="0.5"
    />
    {/* Глазурь */}
    <circle cx="8" cy="8" r="1" fill="#FF69B4" />
    <circle cx="16" cy="9" r="1" fill="#00FF00" />
    <circle cx="9" cy="15" r="1" fill="#FF4500" />
    <circle cx="15" cy="16" r="1" fill="#FFD700" />
    <circle cx="13" cy="7" r="0.8" fill="#FF1493" />
    <circle cx="7" cy="13" r="0.8" fill="#00CED1" />
    <circle cx="17" cy="14" r="0.8" fill="#FF6347" />
    <defs>
      <radialGradient id="donutGradient" cx="0.3" cy="0.3">
        <stop offset="0%" stopColor="#DEB887" />
        <stop offset="100%" stopColor="#8B4513" />
      </radialGradient>
    </defs>
  </svg>
);
import LanguageSwitcher from "@/components/language-switcher";
import { NotificationCenter, useNotifications } from "@/components/notification-center";
import { ProjectDiscussionModal } from "./project-discussion-modal";
import PayPalDonation from "@/components/paypal-donation";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { SiteSettings, CustomMenuItem, Contact } from "@shared/schema";
import { TranslatedText } from "@/components/translated-text";
// Logo використовуємо SVG замість зображення

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const { t, language } = useTranslation();
  const [location, setLocation] = useLocation();
  const { notifications, markAsRead, markAllAsRead, dismissNotification, clearAll, addNotification } = useNotifications();

  // Load site settings for header configuration
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/site-settings"],
    queryFn: getQueryFn({ on401: "ignore" }),
  });

  // Load custom menu items
  const { data: customMenuItems = [] } = useQuery<CustomMenuItem[]>({
    queryKey: ["/api/admin/menu-items"],
    queryFn: getQueryFn({ on401: "ignore" }),
  });

  // Load contacts for notifications
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    queryFn: getQueryFn({ on401: "ignore" }),
    refetchInterval: 30000, // Check for new contacts every 30 seconds
  });

  // Add contact notifications when new unread contacts are received
  // Only show notifications for specific widget feedback types
  useEffect(() => {
    if (!contacts || contacts.length === 0) return;
    
    const unreadContacts = contacts.filter(contact => {
      if (!contact.message.startsWith('[WIDGET]')) return false;
      
      // Check if message contains feedback types we want to show in notifications
      const feedbackTypes = ['Отзыв', 'Ошибка', 'Функция', 'Оценка:', 'звезд'];
      return feedbackTypes.some(type => contact.message.includes(type));
    });
    
    unreadContacts.forEach(contact => {
      const notificationId = `contact-${contact.id}`;
      
      // Check if this specific notification already exists
      if (!notifications.some(n => n.id === notificationId)) {
        // Remove [WIDGET] prefix for display
        const cleanMessage = contact.message.replace('[WIDGET]', '').trim();
        
        addNotification({
          id: notificationId,
          type: 'info',
          priority: 'high', 
          title: t('newFeedback'),
          message: `${contact.name}: ${cleanMessage.substring(0, 50)}${cleanMessage.length > 50 ? '...' : ''}`,
          // Temporarily disabled until admin authorization is implemented
          // action: {
          //   label: 'Посмотреть',
          //   onClick: () => {
          //     fetch(`/api/admin/contacts/${contact.id}/read`, { method: 'PATCH' });
          //     setLocation('/admin?tab=feedback');
          //   }
          // }
        });
      }
    });
  }, [contacts]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    // If we're on the home page, scroll to section
    if (location === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If we're on another page, navigate to home with section hash
      setLocation(`/#${sectionId}`);
    }
  };

  // Helper functions to get translated menu labels from site settings
  const getMenuLabel = (menuType: string) => {
    if (!siteSettings) return t(menuType);
    
    switch (menuType) {
      case 'services':
        switch (language) {
          case 'uk': return siteSettings.servicesMenuUk || t('services');
          case 'ru': return siteSettings.servicesMenuRu || t('services');
          case 'en': return siteSettings.servicesMenuEn || t('services');
          default: return t('services');
        }
      case 'portfolio':
        switch (language) {
          case 'uk': return siteSettings.portfolioMenuUk || t('portfolio');
          case 'ru': return siteSettings.portfolioMenuRu || t('portfolio');
          case 'en': return siteSettings.portfolioMenuEn || t('portfolio');
          default: return t('portfolio');
        }
      case 'about':
        return siteSettings.aboutMenu || t('about');
      case 'contact':
        return siteSettings.contactMenu || t('contact');
      case 'blog':
        return siteSettings.blogMenu || t('blog');
      case 'admin':
        return siteSettings.adminMenu || t('admin');
      default:
        return t(menuType);
    }
  };

  // Helper function to check if menu item should be shown
  const shouldShowMenu = (menuType: string) => {
    if (!siteSettings) return true;
    
    switch (menuType) {
      case 'services': return siteSettings.showServicesMenu ?? true;
      case 'portfolio': return siteSettings.showPortfolioMenu ?? true;
      case 'about': return siteSettings.showAboutMenu ?? true;
      case 'contact': return siteSettings.showContactMenu ?? true;
      case 'blog': return siteSettings.showBlogMenu ?? true;
      case 'admin': return siteSettings.showAdminMenu ?? false;
      default: return true;
    }
  };

  // Get logo URL - use from settings if available, otherwise use default
  const getLogoUrl = () => {
    return siteSettings?.logoUrl || "";
  };

  // Get company name
  const getCompanyName = () => {
    return siteSettings?.companyName || "Webservice Studio";
  };

  // Create a unified menu structure with proper ordering
  const getAllMenuItems = () => {
    const standardMenus = [
      { type: 'services', order: siteSettings?.servicesMenuOrder || 1, isStandard: true },
      { type: 'portfolio', order: siteSettings?.portfolioMenuOrder || 2, isStandard: true },
      { type: 'about', order: siteSettings?.aboutMenuOrder || 3, isStandard: true },
      { type: 'blog', order: siteSettings?.blogMenuOrder || 4, isStandard: true },
      { type: 'contact', order: siteSettings?.contactMenuOrder || 5, isStandard: true },
      { type: 'admin', order: siteSettings?.adminMenuOrder || 6, isStandard: true },
    ].filter(menu => shouldShowMenu(menu.type));

    const customMenus = customMenuItems
      .filter(item => item.isVisible)
      .map(item => ({ ...item, isStandard: false }));

    return [...standardMenus, ...customMenus].sort((a, b) => a.order - b.order);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-md border-b border-slate-200" : "bg-white/90 backdrop-blur-md border-b border-slate-200"
    }`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src={getLogoUrl()} 
              alt={getCompanyName()} 
              className="w-14 h-14 object-contain"
            />
            <div style={{ 
              fontSize: '1rem',
              lineHeight: '1.2',
              fontWeight: '700',
              fontFamily: 'Oswald, sans-serif',
              textTransform: 'uppercase',
              color: '#00a7c7'
            }}>
              <div>Webservice</div>
              <div>Studio</div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {getAllMenuItems().map((menuItem) => {
              if (menuItem.isStandard) {
                // Standard menu items
                const menuType = menuItem.type;
                if (menuType === 'admin') {
                  return (
                    <Link 
                      key={menuType}
                      href="/admin" 
                      className="text-slate-600 hover:text-primary transition-colors duration-200"
                    >
                      <TranslatedText text={getMenuLabel(menuType)} targetLanguage={language} />
                    </Link>
                  );
                } else {
                  return (
                    <button 
                      key={menuType}
                      onClick={() => navigateToSection(menuType)}
                      className="text-slate-600 hover:text-primary transition-colors duration-200"
                    >
                      {['about', 'blog', 'contact'].includes(menuType) ? (
                        <TranslatedText text={getMenuLabel(menuType)} targetLanguage={language} />
                      ) : (
                        getMenuLabel(menuType)
                      )}
                    </button>
                  );
                }
              } else {
                // Custom menu items
                return menuItem.isExternal ? (
                  <a
                    key={menuItem.id}
                    href={menuItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-primary transition-colors duration-200"
                  >
                    <TranslatedText text={menuItem.title} targetLanguage={language} />
                  </a>
                ) : (
                  <Link
                    key={menuItem.id}
                    href={menuItem.url}
                    className="text-slate-600 hover:text-primary transition-colors duration-200"
                  >
                    <TranslatedText text={menuItem.title} targetLanguage={language} />
                  </Link>
                );
              }
            })}
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDismiss={dismissNotification}
                onClearAll={clearAll}
              />
              {/* Кнопка доната */}
              <button 
                onClick={() => setIsDonationModalOpen(true)}
                className="p-1 transition-all duration-300 hover:scale-110 transform"
              >
                <DonutIcon className="w-8 h-8" />
              </button>
            </div>
            <Button 
              onClick={() => setIsDiscussionModalOpen(true)}
              className="bg-primary text-white btn-custom-hover"
            >
              {t('startProject')}
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDismiss={dismissNotification}
              onClearAll={clearAll}
            />
            <button 
              onClick={() => setIsDonationModalOpen(true)}
              className="p-1 transition-all duration-300 hover:scale-110 transform"
            >
              <DonutIcon className="w-6 h-6" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-200">
            <div className="flex flex-col space-y-4 pt-4">
              {getAllMenuItems().map((menuItem) => {
                if (menuItem.isStandard) {
                  // Standard menu items for mobile
                  const menuType = menuItem.type;
                  if (menuType === 'admin') {
                    return (
                      <Link 
                        key={menuType}
                        href="/admin" 
                        className="text-slate-600 hover:text-primary transition-colors duration-200"
                      >
                        <TranslatedText text={getMenuLabel(menuType)} targetLanguage={language} />
                      </Link>
                    );
                  } else {
                    return (
                      <button 
                        key={menuType}
                        onClick={() => navigateToSection(menuType)}
                        className="text-slate-600 hover:text-primary transition-colors duration-200 text-left"
                      >
                        {['about', 'blog', 'contact'].includes(menuType) ? (
                          <TranslatedText text={getMenuLabel(menuType)} targetLanguage={language} />
                        ) : (
                          getMenuLabel(menuType)
                        )}
                      </button>
                    );
                  }
                } else {
                  // Custom menu items for mobile
                  return menuItem.isExternal ? (
                    <a
                      key={menuItem.id}
                      href={menuItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-primary transition-colors duration-200 text-left"
                    >
                      <TranslatedText text={menuItem.title} targetLanguage={language} />
                    </a>
                  ) : (
                    <Link
                      key={menuItem.id}
                      href={menuItem.url}
                      className="text-slate-600 hover:text-primary transition-colors duration-200 text-left"
                    >
                      <TranslatedText text={menuItem.title} targetLanguage={language} />
                    </Link>
                  );
                }
              })}
              
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
              <Button 
                onClick={() => setIsDiscussionModalOpen(true)}
                className="bg-primary text-white btn-custom-hover w-fit"
              >
                {t('startProject')}
              </Button>
            </div>
          </div>
        )}
      </nav>
      
      <ProjectDiscussionModal 
        isOpen={isDiscussionModalOpen}
        onClose={() => setIsDiscussionModalOpen(false)}
      />
      
      {/* Модальное окно PayPal доната */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto my-auto">
            <button
              onClick={() => setIsDonationModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <DonutIcon className="w-10 h-10 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">{t('donateModalTitle')}</h3>
              </div>
              <p className="text-gray-600 text-sm">
                {t('donateModalDescription')}
              </p>
            </div>
            
            <div className="space-y-4 flex justify-center">
              <div className="w-full max-w-xs mx-auto">
                <PayPalDonation amount="10" currency="USD" intent="CAPTURE" />
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {t('donateModalSecurePayment')}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
