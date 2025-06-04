import { useState, useEffect } from 'react';

interface TranslatedTextProps {
  text: string;
  targetLanguage: string;
  fallback?: string;
}

export function TranslatedText({ text, targetLanguage, fallback }: TranslatedTextProps) {
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Если целевой язык украинский или текст пустой, показываем оригинальный текст
    if (targetLanguage === 'uk' || !text.trim()) {
      setTranslatedText(text);
      return;
    }

    const translateText = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            targetLanguage: targetLanguage,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTranslatedText(data.translatedText);
        } else {
          // В случае ошибки показываем оригинальный текст
          setTranslatedText(fallback || text);
        }
      } catch (error) {
        console.warn('Translation failed, using original text:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [text, targetLanguage, fallback]);

  if (isLoading) {
    return <span className="opacity-70">{text}</span>;
  }

  return <span>{translatedText}</span>;
}

export default TranslatedText;