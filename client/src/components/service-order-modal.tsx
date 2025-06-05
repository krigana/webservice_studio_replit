import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, type Service, type InsertContact } from "@shared/schema";

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

export function ServiceOrderModal({ isOpen, onClose, service }: ServiceOrderModalProps) {
  if (!service) return null;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Enhanced validation schema (same as contact form)
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
    }
  });

  const contactMutation = useMutation({
    mutationFn: (data: InsertContact) => apiRequest("POST", "/api/contacts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setSubmitStatus('success');
      form.reset();
      toast({
        title: "Дякуємо за замовлення!",
        description: "Ваша заявка на послугу успішно відправлена. Ми зв'яжемося з вами найближчим часом.",
        duration: 5000,
      });
      setTimeout(() => {
        setSubmitStatus('idle');
        onClose();
      }, 3000);
    },
    onError: (error) => {
      setSubmitStatus('error');
      toast({
        title: "Помилка",
        description: "Не вдалося відправити заявку. Спробуйте ще раз або зв'яжіться з нами по телефону.",
        variant: "destructive",
      });
      console.error("Contact submission error:", error);
    }
  });

  const handleClose = () => {
    form.reset();
    setSubmitStatus('idle');
    onClose();
  };

  const onSubmit = (data: InsertContact) => {
    console.log('🚀 Form submitted with data:', data);
    console.log('📋 Service info:', service);
    setSubmitStatus('idle');
    // Add service name to message
    const orderData = {
      ...data,
      message: `Замовлення послуги: ${service.title}\n\n${data.message}`
    };
    console.log('📦 Sending order data:', orderData);
    contactMutation.mutate(orderData);
  };

  if (submitStatus === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Дякуємо за замовлення!
            </h3>
            <p className="text-slate-600 mb-4">
              Ваша заявка на послугу "<strong>{service.title}</strong>" успішно відправлена.
            </p>
            <p className="text-sm text-slate-500">
              Ми зв'яжемося з вами найближчим часом для обговорення деталей.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-800">
            Замовити послугу: {service.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
            <p className="text-sm text-slate-600">Послуга:</p>
            <p className="font-medium text-slate-800">{service.title}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Ім'я *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Введіть ваше ім'я"
                        className="border-slate-300 focus:border-[#00a7c7] focus:ring-[#00a7c7]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Телефон *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+380XXXXXXXXX"
                        className="border-slate-300 focus:border-[#00a7c7] focus:ring-[#00a7c7]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Повідомлення *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Опишіть детально ваші потреби..."
                        className="border-slate-300 focus:border-[#00a7c7] focus:ring-[#00a7c7] min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  className="bg-[#00a7c7] hover:bg-[#feab6b] text-white"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Відправляємо...</span>
                    </div>
                  ) : (
                    "Відправити заявку"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}