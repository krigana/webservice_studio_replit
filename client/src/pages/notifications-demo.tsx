import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationCenter, useNotifications } from '@/components/notification-center';
import { Badge } from '@/components/ui/badge';
import { Bell, Zap, CheckCircle, AlertTriangle, Info, Star, Heart } from 'lucide-react';

export default function NotificationsDemo() {
  const { notifications, addNotification, markAsRead, markAllAsRead, dismissNotification, clearAll } = useNotifications();

  const demoNotifications = [
    {
      type: 'success' as const,
      priority: 'high' as const,
      title: 'Проект завершен',
      message: 'Ваш веб-сайт успешно развернут и готов к использованию!',
      action: {
        label: 'Просмотреть',
        onClick: () => alert('Открытие проекта...')
      }
    },
    {
      type: 'warning' as const,
      priority: 'medium' as const,
      title: 'Обновление системы',
      message: 'Запланированное обслуживание сервера завтра в 02:00'
    },
    {
      type: 'info' as const,
      priority: 'low' as const,
      title: 'Новая функция',
      message: 'Добавлена поддержка темной темы в админ-панель'
    },
    {
      type: 'error' as const,
      priority: 'urgent' as const,
      title: 'Критическая ошибка',
      message: 'Обнаружена проблема с SSL-сертификатом. Требуется немедленное внимание!'
    },
    {
      type: 'feature' as const,
      priority: 'medium' as const,
      title: 'Бета-тестирование',
      message: 'Приглашаем вас протестировать новый редактор контента',
      action: {
        label: 'Участвовать',
        onClick: () => alert('Переход к бета-версии...')
      }
    },
    {
      type: 'celebration' as const,
      priority: 'low' as const,
      title: 'Поздравляем!',
      message: 'Ваш сайт посетили уже 1000 пользователей этот месяц!'
    }
  ];

  const addRandomNotification = () => {
    const notification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
    addNotification(notification);
  };

  const addUrgentNotification = () => {
    addNotification({
      type: 'error',
      priority: 'urgent',
      title: 'Срочное уведомление',
      message: 'Это критически важное уведомление требует немедленного внимания!'
    });
  };

  const addBulkNotifications = () => {
    demoNotifications.forEach((notification, index) => {
      setTimeout(() => addNotification(notification), index * 500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bell className="w-12 h-12 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-900">Центр Уведомлений</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Интерактивная система уведомлений с приоритетами, анимированными иконками и умной сортировкой
          </p>
        </div>

        {/* Notification Center Display */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
            <span className="text-sm font-medium text-gray-700">Центр уведомлений:</span>
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDismiss={dismissNotification}
              onClearAll={clearAll}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange" />
                Быстрые действия
              </CardTitle>
              <CardDescription>
                Добавьте различные типы уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={addRandomNotification}
                className="w-full"
                variant="outline"
              >
                Случайное уведомление
              </Button>
              <Button 
                onClick={addUrgentNotification}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
              >
                Срочное уведомление
              </Button>
              <Button 
                onClick={addBulkNotifications}
                className="w-full bg-purple text-white hover:bg-purple/90"
              >
                Массовые уведомления
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple" />
                Приоритеты
              </CardTitle>
              <CardDescription>
                Различные уровни важности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white">Срочно</Badge>
                <span className="text-sm text-gray-600">Критические ошибки</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange text-white">Высокий</Badge>
                <span className="text-sm text-gray-600">Важные события</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white">Средний</Badge>
                <span className="text-sm text-gray-600">Обычные уведомления</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-400 text-white">Низкий</Badge>
                <span className="text-sm text-gray-600">Информационные</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-coral" />
                Типы уведомлений
              </CardTitle>
              <CardDescription>
                Различные категории с иконками
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Успех</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Предупреждение</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm">Ошибка</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Информация</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple" />
                <span className="text-sm">Функция</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-coral" />
                <span className="text-sm">Празднование</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Особенности центра уведомлений</CardTitle>
            <CardDescription>
              Современная система уведомлений с богатым функционалом
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Умная сортировка</h3>
                <p className="text-sm text-gray-600">Автоматическая сортировка по приоритету и времени</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-orange" />
                </div>
                <h3 className="font-semibold mb-2">Анимированные иконки</h3>
                <p className="text-sm text-gray-600">Живые анимации для привлечения внимания</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple" />
                </div>
                <h3 className="font-semibold mb-2">Уровни приоритета</h3>
                <p className="text-sm text-gray-600">4 уровня приоритета с цветовой кодировкой</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Интерактивные действия</h3>
                <p className="text-sm text-gray-600">Кнопки действий для быстрого реагирования</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-coral" />
                </div>
                <h3 className="font-semibold mb-2">Автоудаление</h3>
                <p className="text-sm text-gray-600">Низкоприоритетные уведомления удаляются автоматически</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Info className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Умные метки времени</h3>
                <p className="text-sm text-gray-600">Относительное время с автообновлением</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 bg-white p-4 rounded-lg shadow-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <div className="text-sm text-gray-600">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange">{notifications.filter(n => !n.isRead).length}</div>
              <div className="text-sm text-gray-600">Непрочитанных</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{notifications.filter(n => n.priority === 'urgent').length}</div>
              <div className="text-sm text-gray-600">Срочных</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}