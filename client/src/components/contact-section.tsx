import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { insertContactSchema } from "@shared/schema";
import type { InsertContact } from "@shared/schema";
import { z } from "zod";



// Компонент карты Google Maps
function StaticMap() {
  const officeLocation = {
    lat: 48.3167,
    lng: 35.5167,
    address: "Україна, 52501, м.Синельникове, вул.Миру 36"
  };

  // Google Maps Embed URL (не требует API ключа для базового отображения)
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2550.1234567890!2d${officeLocation.lng}!3d${officeLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDE5JzAwLjEiTiAzNcKwMzEnMDAuMSJF!5e0!3m2!1suk!2sua!4v1234567890123!5m2!1suk!2sua`;

  return (
    <div className="h-96 rounded-lg overflow-hidden relative group">
      {/* Google Maps iframe */}
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Webservice Studio - Синельникове, вул.Миру 36"
        className="w-full h-full"
      />
      
      {/* Compact overlay with office info */}
      <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none">
        <div className="absolute bottom-3 left-3 right-3 pointer-events-auto">
          <div className="bg-slate-900 bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm mb-1">Webservice Studio</h3>
                <p className="text-slate-200 text-xs">
                  м.Синельникове, вул.Миру 36
                </p>
              </div>
              
              <div className="flex gap-2">
                <a
                  href={`https://maps.google.com/?q=${officeLocation.lat},${officeLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-[#00a7c7] hover:bg-[#feab6b] text-white rounded text-xs font-medium transition-colors duration-200 shadow-md"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  Google Maps
                </a>
                
                <a
                  href={`https://www.openstreetmap.org/?mlat=${officeLocation.lat}&mlon=${officeLocation.lng}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded text-xs font-medium transition-colors duration-200 shadow-md"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  OSM
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Enhanced validation schema
  const validationSchema = insertContactSchema.extend({
    name: z.string()
      .min(2, "Ім'я повинно містити принаймні 2 символи")
      .max(50, "Ім'я не може бути довшим 50 символів")
      .regex(/^[a-zA-Zа-яА-ЯіІїЇєЄ'\s-]+$/, "Ім'я може містити лише літери, пробіли та дефіси"),
    phone: z.string()
      .min(10, "Номер телефону занадто короткий")
      .regex(/^(\+380|380|0)(39|50|63|66|67|68|73|91|92|93|94|95|96|97|98|99)\d{7}$/, "Введіть дійсний український мобільний номер (+380XX, 380XX або 0XX)"),
    message: z.string()
      .min(10, "Повідомлення повинно містити принаймні 10 символів")
      .max(500, "Повідомлення не може бути довшим 500 символів")
  });

  const form = useForm<InsertContact>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: ""
    },
    mode: "onChange" // Real-time validation
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      return apiRequest("POST", "/api/contacts", data);
    },
    onSuccess: () => {
      toast({
        title: t('messageSuccess'),
        description: t('messageSuccess'),
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: t('messageError'),
        description: t('messageError'),
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InsertContact) => {
    setSubmitStatus('idle');
    contactMutation.mutate(data, {
      onSuccess: () => {
        setSubmitStatus('success');
        form.reset();
        toast({
          title: "Дякуємо!",
          description: "Ваше повідомлення успішно відправлено. Ми зв'яжемося з вами найближчим часом.",
          duration: 5000,
        });
        // Сбрасываем статус через 5 секунд
        setTimeout(() => setSubmitStatus('idle'), 5000);
      },
      onError: () => {
        setSubmitStatus('error');
        toast({
          title: "Помилка",
          description: "Не вдалося відправити повідомлення. Спробуйте ще раз або зв'яжіться з нами по телефону.",
          variant: "destructive",
          duration: 5000,
        });
        // Сбрасываем статус через 5 секунд
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }
    });
  };

  return (
    <section id="contact" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t('contact')}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Contact Information */}
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 flex flex-col">
            <h3 className="text-2xl font-semibold text-white mb-6">{t('letsWorkTogether')}</h3>
            <p className="text-slate-300 mb-6 text-left leading-relaxed">
              {t('contactDescription')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 content-center">
              <div className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600 h-full">
                <div className="w-10 h-10 bg-[#feab6b] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-white mb-1">{t('phone')}</h3>
                  <a href="tel:+380959212203" className="text-sm text-slate-300 hover:text-[#00a7c7] transition-colors break-all">
                    {t('phoneValue')}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600 h-full">
                <div className="w-10 h-10 bg-[#9693e6] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-white mb-1">{t('email')}</h3>
                  <a href="mailto:support@web-service.studio" className="text-sm text-slate-300 hover:text-[#00a7c7] transition-colors break-all">
                    {t('emailValue')}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600 h-full">
                <div className="w-10 h-10 bg-[#ff8a8a] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-white mb-1">{t('address')}</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-line leading-tight">
                    {t('addressValue')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-700 rounded-lg border border-slate-600 h-full">
                <div className="w-10 h-10 bg-[#00a7c7] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h3 className="text-sm font-semibold text-white mb-1">{t('workingHours')}</h3>
                  <p className="text-sm text-slate-300">
                    {t('workingHoursValue')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300 whitespace-pre-line">{t('responseTime')}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300">{t('freeConsultation')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h3 className="text-2xl font-semibold text-white mb-6">{t('sendMessage')}</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">{t('name')} *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('namePlaceholder')}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#00a7c7]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">{t('phone')} *</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="+380 XX XXX XX XX"
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#00a7c7]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">{t('message')} *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('messagePlaceholder')}
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-[#00a7c7] resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Message */}
                {submitStatus === 'success' && (
                  <div className="flex items-center space-x-3 p-4 bg-green-600/20 border border-green-600/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-400 font-medium">Дякуємо!</p>
                      <p className="text-green-300 text-sm">Ваше повідомлення успішно відправлено. Ми зв'яжемося з вами найближчим часом.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center space-x-3 p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 font-medium">Помилка</p>
                      <p className="text-red-300 text-sm">Не вдалося відправити повідомлення. Спробуйте ще раз або зв'яжіться з нами по телефону.</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-[#00a7c7] hover:bg-[#feab6b] text-white font-semibold py-3 transition-colors duration-200"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Відправляємо...</span>
                    </div>
                  ) : (
                    t('sendButton')
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-white mb-2">{t('ourLocation')}</h3>
          </div>
          <StaticMap />
        </div>
      </div>
    </section>
  );
}