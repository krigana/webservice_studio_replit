import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { X, MessageCircle, User, Phone } from "lucide-react";

interface ProjectDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  message: string;
  projectType: string;
  budget: string;
  timeline: string;
}

export function ProjectDiscussionModal({ isOpen, onClose }: ProjectDiscussionModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      projectType: "",
      budget: "",
      timeline: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertContact) => apiRequest("POST", "/api/contacts", data),
    onSuccess: () => {
      toast({
        title: t('thankYou'),
        description: t('messageSuccess'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: t('messageError'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const projectInfo = [];
    if (data.projectType) projectInfo.push(`Тип проекта: ${data.projectType}`);
    if (data.budget) projectInfo.push(`Бюджет: ${data.budget}`);
    if (data.timeline) projectInfo.push(`Сроки: ${data.timeline}`);
    
    const fullMessage = `Обсуждение проекта\n\n${projectInfo.join('\n')}\n\nДополнительная информация: ${data.message}`;
    
    const contactData: InsertContact = {
      name: data.name,
      phone: data.phone,
      message: fullMessage,
    };
    mutation.mutate(contactData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg font-semibold">
              {t('discussProject')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t('name')} *</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t('namePlaceholder')}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{t('phone')} *</span>
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+380..."
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectType">
              Тип проекта
            </Label>
            <select
              id="projectType"
              {...register("projectType")}
              className="w-full p-2 border rounded-md border-gray-300"
            >
              <option value="">Выберите тип проекта</option>
              <option value="website">Веб-сайт</option>
              <option value="mobile-app">Мобильное приложение</option>
              <option value="web-app">Веб-приложение</option>
              <option value="ecommerce">Интернет-магазин</option>
              <option value="redesign">Редизайн</option>
              <option value="consulting">Консультации</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">
              Бюджет
            </Label>
            <select
              id="budget"
              {...register("budget")}
              className="w-full p-2 border rounded-md border-gray-300"
            >
              <option value="">Выберите бюджет</option>
              <option value="under-1000">$500 - $1,000</option>
              <option value="1000-3000">$1,000 - $3,000</option>
              <option value="3000-5000">$3,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="over-10000">Свыше $10,000</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">
              Сроки
            </Label>
            <select
              id="timeline"
              {...register("timeline")}
              className="w-full p-2 border rounded-md border-gray-300"
            >
              <option value="">Выберите сроки</option>
              <option value="asap">Как можно скорее</option>
              <option value="1-month">1 месяц</option>
              <option value="2-3-months">2-3 месяца</option>
              <option value="3-6-months">3-6 месяцев</option>
              <option value="flexible">Гибкие сроки</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Описание проекта
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Расскажите подробнее о вашем проекте..."
              rows={4}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {mutation.isPending ? t('sending') : t('sendMessage')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}