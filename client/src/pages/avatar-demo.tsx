import { AvatarShowcase } from "@/components/micro-avatar";
import { useTranslation } from "@/lib/i18n";

export default function AvatarDemo() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Микро-аватар
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Интерактивный аватар с настраиваемыми эмоциями для персонализации пользовательского опыта
          </p>
        </div>
        
        <div className="flex justify-center">
          <AvatarShowcase />
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Возможности</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3 text-orange">8 Эмоций</h3>
              <p className="text-sm text-muted-foreground">
                Счастливый, грустный, взволнованный, спокойный, удивленный, сосредоточенный, игривый и уверенный
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3 text-purple">3 Размера</h3>
              <p className="text-sm text-muted-foreground">
                Малый, средний и большой размеры для различных интерфейсов
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3 text-coral">Интерактивность</h3>
              <p className="text-sm text-muted-foreground">
                Смена эмоций по клику, селектор для выбора, анимации переходов
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3 text-primary">Цветовая схема</h3>
              <p className="text-sm text-muted-foreground">
                Каждая эмоция имеет свой цвет и фон, соответствующий настроению
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3 text-orange">Простая интеграция</h3>
              <p className="text-sm text-muted-foreground">
                Легко встраивается в любую часть интерфейса с настраиваемыми параметрами
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold mb-3 text-purple">Responsive</h3>
              <p className="text-sm text-muted-foreground">
                Адаптивный дизайн для всех устройств и экранов
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}