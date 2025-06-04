import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type AvatarEmotion = 'happy' | 'sad' | 'excited' | 'calm' | 'surprised' | 'focused' | 'playful' | 'confident';

export interface MicroAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  emotion?: AvatarEmotion;
  color?: string;
  interactive?: boolean;
  showControls?: boolean;
  onEmotionChange?: (emotion: AvatarEmotion) => void;
}

const emotionConfig = {
  happy: {
    eyes: '😊',
    mouth: '😄',
    color: '#feab6b',
    bgColor: '#fff7ed',
    label: 'Счастливый'
  },
  sad: {
    eyes: '😢',
    mouth: '😞',
    color: '#9693e6',
    bgColor: '#f3f4f6',
    label: 'Грустный'
  },
  excited: {
    eyes: '🤩',
    mouth: '😃',
    color: '#ff8a8a',
    bgColor: '#fef2f2',
    label: 'Взволнованный'
  },
  calm: {
    eyes: '😌',
    mouth: '😊',
    color: '#00a7c7',
    bgColor: '#f0f9ff',
    label: 'Спокойный'
  },
  surprised: {
    eyes: '😲',
    mouth: '😮',
    color: '#feab6b',
    bgColor: '#fffbeb',
    label: 'Удивленный'
  },
  focused: {
    eyes: '🤔',
    mouth: '😐',
    color: '#9693e6',
    bgColor: '#faf5ff',
    label: 'Сосредоточенный'
  },
  playful: {
    eyes: '😜',
    mouth: '😋',
    color: '#ff8a8a',
    bgColor: '#fef7f7',
    label: 'Игривый'
  },
  confident: {
    eyes: '😎',
    mouth: '😏',
    color: '#00a7c7',
    bgColor: '#f0fdfa',
    label: 'Уверенный'
  }
};

const sizeConfig = {
  sm: { container: 'w-12 h-12', face: 'text-lg', controls: 'text-xs' },
  md: { container: 'w-16 h-16', face: 'text-xl', controls: 'text-sm' },
  lg: { container: 'w-24 h-24', face: 'text-3xl', controls: 'text-base' }
};

export function MicroAvatar({ 
  size = 'md', 
  emotion = 'happy', 
  interactive = false,
  showControls = false,
  onEmotionChange 
}: MicroAvatarProps) {
  const [currentEmotion, setCurrentEmotion] = useState<AvatarEmotion>(emotion);
  const config = emotionConfig[currentEmotion];
  const sizeStyles = sizeConfig[size];

  const handleEmotionChange = (newEmotion: AvatarEmotion) => {
    setCurrentEmotion(newEmotion);
    onEmotionChange?.(newEmotion);
  };

  const handleClick = () => {
    if (interactive) {
      const emotions = Object.keys(emotionConfig) as AvatarEmotion[];
      const currentIndex = emotions.indexOf(currentEmotion);
      const nextEmotion = emotions[(currentIndex + 1) % emotions.length];
      handleEmotionChange(nextEmotion);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div 
        className={`
          ${sizeStyles.container} 
          rounded-full 
          flex items-center justify-center 
          transition-all duration-300 
          ${interactive ? 'cursor-pointer hover:scale-110' : ''}
          shadow-lg
        `}
        style={{ 
          backgroundColor: config.bgColor,
          border: `2px solid ${config.color}`
        }}
        onClick={handleClick}
        title={config.label}
      >
        <div className={`${sizeStyles.face} transition-all duration-300`}>
          <span className="block">{config.eyes}</span>
        </div>
      </div>

      {showControls && (
        <div className="flex flex-col items-center space-y-2">
          <Badge 
            variant="secondary" 
            className={sizeStyles.controls}
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </Badge>
          
          <Select value={currentEmotion} onValueChange={handleEmotionChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(emotionConfig).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <span>{value.eyes}</span>
                    <span>{value.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export function AvatarShowcase() {
  const [selectedEmotion, setSelectedEmotion] = useState<AvatarEmotion>('happy');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Микро-аватар с эмоциями</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Главный аватар */}
        <div className="flex justify-center">
          <MicroAvatar 
            size="lg" 
            emotion={selectedEmotion}
            showControls={true}
            onEmotionChange={setSelectedEmotion}
          />
        </div>

        {/* Примеры всех размеров */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Размеры</h3>
          <div className="flex justify-center items-center space-x-6">
            <div className="text-center">
              <MicroAvatar size="sm" emotion={selectedEmotion} />
              <p className="text-xs mt-2 text-muted-foreground">Малый</p>
            </div>
            <div className="text-center">
              <MicroAvatar size="md" emotion={selectedEmotion} />
              <p className="text-xs mt-2 text-muted-foreground">Средний</p>
            </div>
            <div className="text-center">
              <MicroAvatar size="lg" emotion={selectedEmotion} />
              <p className="text-xs mt-2 text-muted-foreground">Большой</p>
            </div>
          </div>
        </div>

        {/* Интерактивный пример */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Интерактивный аватар</h3>
          <div className="flex justify-center">
            <div className="text-center">
              <MicroAvatar 
                size="md" 
                emotion={selectedEmotion}
                interactive={true}
              />
              <p className="text-xs mt-2 text-muted-foreground">Нажмите для смены эмоций</p>
            </div>
          </div>
        </div>

        {/* Галерея всех эмоций */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Все эмоции</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(emotionConfig).map(([emotion, config]) => (
              <div 
                key={emotion}
                className="text-center cursor-pointer transition-transform hover:scale-105"
                onClick={() => setSelectedEmotion(emotion as AvatarEmotion)}
              >
                <MicroAvatar 
                  size="sm" 
                  emotion={emotion as AvatarEmotion}
                />
                <p className="text-xs mt-1 text-muted-foreground">{config.label}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}