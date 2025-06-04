import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Star, ThumbsUp, ThumbsDown, Heart, DollarSign, CreditCard } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { useTranslation } from "@/lib/i18n";
import { MicroAvatar } from "@/components/micro-avatar";
import { useNotifications } from "@/components/notification-system";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertContact } from "@shared/schema";
import PayPalDonation from "@/components/paypal-donation";

type FeedbackType = 'general' | 'bug' | 'feature' | 'compliment' | 'donation';
type QuickRating = 1 | 2 | 3 | 4 | 5;
type FeedbackStep = 'type' | 'rating' | 'message' | 'contact' | 'donation';

interface FeedbackData {
  type: FeedbackType;
  rating?: QuickRating;
  message: string;
  email?: string;
  name?: string;
}

const feedbackTypes = {
  general: { icon: MessageCircle, color: 'bg-primary', emoji: '💬' },
  bug: { icon: ThumbsDown, color: 'bg-coral', emoji: '🐛' },
  feature: { icon: ThumbsUp, color: 'bg-purple', emoji: '💡' },
  compliment: { icon: Heart, color: 'bg-orange', emoji: '❤️' },
  donation: { icon: SiPaypal, color: 'bg-blue-600', emoji: '💰' }
};

export function InstantFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<FeedbackStep>('type');
  const [feedbackData, setFeedbackData] = useState<Partial<FeedbackData>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Get feedback type labels based on current language
  const getFeedbackTypeLabel = (type: FeedbackType) => {
    switch (type) {
      case 'general': return t('general_feedback');
      case 'bug': return t('report_bug');
      case 'feature': return t('suggest_feature');
      case 'compliment': return t('compliment');
      case 'donation': return t('donate_project');
      default: return t('general_feedback');
    }
  };
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      addNotification({
        type: 'success',
        title: 'Спасибо за отзыв!',
        message: 'Ваше сообщение получено и будет рассмотрено в ближайшее время.',
      });
      setStep('donation'); // Show donation step instead of closing
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Ошибка отправки',
        message: 'Попробуйте еще раз или свяжитесь с нами другим способом.',
      });
    }
  });

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setStep('type');
      setFeedbackData({});
      setIsAnimating(false);
    }, 200);
  };

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackData({ ...feedbackData, type });
    if (type === 'donation') {
      setStep('donation');
    } else if (type === 'compliment') {
      setStep('message');
    } else {
      setStep('rating');
    }
  };

  const handleRatingSelect = (rating: QuickRating) => {
    setFeedbackData({ ...feedbackData, rating });
    setStep('message');
  };

  const handleSubmit = () => {
    if (!feedbackData.message?.trim()) return;

    const subject = `${feedbackTypes[feedbackData.type!].emoji} ${getFeedbackTypeLabel(feedbackData.type!)}${
      feedbackData.rating ? ` (${feedbackData.rating}/5 звезд)` : ''
    }`;

    const message = `${feedbackData.message}${
      feedbackData.rating ? `\n\nОценка: ${feedbackData.rating}/5 звезд` : ''
    }`;

    feedbackMutation.mutate({
      name: feedbackData.name || 'Анонимный пользователь',
      phone: feedbackData.email || '',
      message: `[WIDGET] ${subject}\n\n${message}`
    });
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Плавающая кнопка */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleOpen}
          className={`
            w-14 h-14 rounded-full shadow-lg 
            bg-primary hover:bg-primary/90 
            transition-all duration-300 ease-out
            ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
            hover:scale-110 hover:shadow-xl
            group
          `}
          aria-label="Миттєвий зворотний зв'язок"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Модальное окно обратной связи */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Затемненный фон */}
          <div 
            className={`
              absolute inset-0 bg-black/50 backdrop-blur-sm
              transition-opacity duration-300
              ${isAnimating ? 'opacity-0' : 'opacity-100'}
            `}
            onClick={handleClose}
          />
          
          {/* Контент модального окна */}
          <div
            ref={formRef}
            className={`
              relative w-full max-w-md
              transition-all duration-300 ease-out
              ${isAnimating ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}
            `}
          >
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MicroAvatar size="sm" emotion="happy" />
                    {t('instant_feedback_title')}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="w-8 h-8 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {step !== 'type' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {feedbackTypes[feedbackData.type!].emoji} {getFeedbackTypeLabel(feedbackData.type!)}
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Шаг 1: Выбор типа обратной связи */}
                {step === 'type' && (
                  <div className="space-y-3 animate-fade-in">
                    <p className="text-sm text-muted-foreground text-center">
                      {t('widget_question')}
                    </p>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(feedbackTypes)
                          .filter(([key]) => key !== 'donation')
                          .map(([key, config]) => (
                          <Button
                            key={key}
                            variant="outline"
                            onClick={() => handleTypeSelect(key as FeedbackType)}
                            className="h-20 flex flex-col gap-2 hover:scale-105 transition-all duration-200"
                          >
                            <span className="text-2xl">{config.emoji}</span>
                            <span className="text-xs text-center">{getFeedbackTypeLabel(key as FeedbackType)}</span>
                          </Button>
                        ))}
                      </div>
                      {/* Кнопка донации на всю ширину */}
                      <Button
                        variant="outline"
                        onClick={() => handleTypeSelect('donation')}
                        className="w-full h-16 flex items-center gap-3 hover:scale-105 transition-all duration-200 bg-[#0070ba] hover:bg-[#005ea6] text-white border-[#0070ba]"
                      >
                        <SiPaypal className="w-6 h-6" />
                        <span className="text-sm font-medium">{getFeedbackTypeLabel('donation')}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Шаг 2: Оценка */}
                {step === 'rating' && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground text-center">
                      {t('rate_experience')}
                    </p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRatingSelect(rating as QuickRating)}
                          className="w-12 h-12 p-0 hover:scale-110 transition-all duration-200"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              rating <= (feedbackData.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep('message')}
                        className="text-xs"
                      >
                        {t('skip_rating')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Шаг 3: Сообщение */}
                {step === 'message' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium">
                        {t('your_message')}
                      </Label>
                      <Textarea
                        id="message"
                        placeholder={t('message_placeholder')}
                        value={feedbackData.message || ''}
                        onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                        className="mt-1 min-h-[80px] resize-none"
                        autoFocus
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep('contact')}
                        className="flex-1"
                      >
                        Добавить контакты
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!feedbackData.message?.trim() || feedbackMutation.isPending}
                        className="flex-1"
                      >
                        {feedbackMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Отправка...
                          </div>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Отправить
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Шаг 4: Контактная информация */}
                {step === 'contact' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Имя (необязательно)
                      </Label>
                      <Input
                        id="name"
                        placeholder="Ваше имя"
                        value={feedbackData.name || ''}
                        onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email (необязательно)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={feedbackData.email || ''}
                        onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep('message')}
                        className="flex-1"
                      >
{t('back')}
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!feedbackData.message?.trim() || feedbackMutation.isPending}
                        className="flex-1"
                      >
                        {feedbackMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Отправка...
                          </div>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Отправить
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Шаг 5: Donation */}
                {step === 'donation' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold">{t('feedbackThankYou')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('supportProjectQuestion')}
                      </p>
                    </div>
                    
                    <PayPalDonation />
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        {t('noThanks')}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}