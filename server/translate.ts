interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
    }>;
  };
}

// Простое кеширование переводов в памяти
const translationCache = new Map<string, string>();

function getCacheKey(text: string, targetLanguage: string): string {
  return `${targetLanguage}:${text.substring(0, 100)}`;
}

interface ProjectTranslations {
  uk: { title: string; description: string };
  ru: { title: string; description: string };
  en: { title: string; description: string };
}

interface ServiceTranslations {
  uk: { title: string; description: string; features: string[] };
  ru: { title: string; description: string; features: string[] };
  en: { title: string; description: string; features: string[] };
}

interface BlogPostTranslations {
  uk: { title: string; excerpt: string; content: string };
  ru: { title: string; excerpt: string; content: string };
  en: { title: string; excerpt: string; content: string };
}

// Функция для извлечения и замещения изображений плейсхолдерами
function extractImages(html: string): { cleanText: string; images: string[] } {
  if (!html) return { cleanText: html, images: [] };
  
  const images: string[] = [];
  let cleanText = html;
  
  // Находим все img теги и заменяем их на плейсхолдеры
  cleanText = cleanText.replace(/<img[^>]*>/gi, (match) => {
    images.push(match);
    return `__IMAGE_${images.length - 1}__`;
  });
  
  // Удаляем base64 изображения, которые слишком большие
  cleanText = cleanText.replace(/data:image\/[^;]+;base64,[^"'\s>]+/gi, '');
  
  return { cleanText, images };
}

// Функция для восстановления изображений в переведенном тексте
function restoreImages(translatedText: string, images: string[]): string {
  let result = translatedText;
  
  images.forEach((image, index) => {
    const placeholder = `__IMAGE_${index}__`;
    result = result.replace(new RegExp(placeholder, 'g'), image);
  });
  
  return result;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('Google Translate API key not found');
  }

  // Извлекаем изображения и заменяем их плейсхолдерами
  const { cleanText, images } = extractImages(text);
  
  // Проверяем кеш
  const cacheKey = getCacheKey(cleanText, targetLanguage);
  if (translationCache.has(cacheKey)) {
    const cachedTranslation = translationCache.get(cacheKey)!;
    console.log(`⚡ Using cached translation for "${cleanText.substring(0, 50)}..."`);
    return restoreImages(cachedTranslation, images);
  }
  
  const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
  
  console.log(`🔄 Translating "${cleanText.substring(0, 100)}..." to ${targetLanguage}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: cleanText,
        target: targetLanguage,
        format: 'text'
      }),
    });

    console.log(`📡 Translation API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Translation API error: ${response.status} - ${errorText}`);
      throw new Error(`Translation API error: ${response.status} - ${errorText}`);
    }

    const data: TranslationResponse = await response.json();
    const translatedText = data.data.translations[0].translatedText;
    
    // Сохраняем в кеш
    translationCache.set(cacheKey, translatedText);
    
    // Восстанавливаем изображения в переведенном тексте
    const finalText = restoreImages(translatedText, images);
    
    console.log(`✅ Translation completed`);
    return finalText;
  } catch (error) {
    console.error('❌ Translation error:', error);
    throw error;
  }
}

export async function translateProject(title: string, description: string, sourceLanguage: string): Promise<ProjectTranslations> {
  const languages = [
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ru', name: 'Russian' },  
    { code: 'en', name: 'English' }
  ];

  const translations: ProjectTranslations = {
    uk: { title: '', description: '' },
    ru: { title: '', description: '' },
    en: { title: '', description: '' }
  };

  // If source language matches target, use original text
  for (const lang of languages) {
    if (lang.code === sourceLanguage) {
      translations[lang.code as keyof ProjectTranslations] = { title, description };
    } else {
      try {
        const translatedTitle = await translateText(title, lang.code);
        const translatedDescription = await translateText(description, lang.code);
        
        translations[lang.code as keyof ProjectTranslations] = {
          title: translatedTitle,
          description: translatedDescription
        };
      } catch (error) {
        console.error(`Failed to translate to ${lang.name}:`, error);
        // Fallback to original text if translation fails
        translations[lang.code as keyof ProjectTranslations] = { title, description };
      }
    }
  }

  return translations;
}

export async function translateService(title: string, description: string, features: string[], sourceLanguage: string): Promise<ServiceTranslations> {
  const languages = [
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ru', name: 'Russian' },
    { code: 'en', name: 'English' }
  ];

  const translations: ServiceTranslations = {
    uk: { title: '', description: '', features: [] },
    ru: { title: '', description: '', features: [] },
    en: { title: '', description: '', features: [] }
  };

  // If source language matches target, use original text
  for (const lang of languages) {
    if (lang.code === sourceLanguage) {
      translations[lang.code as keyof ServiceTranslations] = { title, description, features };
    } else {
      try {
        const translatedTitle = await translateText(title, lang.code);
        const translatedDescription = await translateText(description, lang.code);
        
        // Translate each feature
        const translatedFeatures = [];
        console.log(`🔧 Translating ${features.length} features to ${lang.name}`);
        for (const feature of features) {
          try {
            const translatedFeature = await translateText(feature, lang.code);
            console.log(`✅ Feature translated: "${feature}" -> "${translatedFeature}"`);
            translatedFeatures.push(translatedFeature);
          } catch (error) {
            console.error(`Failed to translate feature "${feature}" to ${lang.name}:`, error);
            translatedFeatures.push(feature); // fallback to original
          }
        }
        
        translations[lang.code as keyof ServiceTranslations] = { 
          title: translatedTitle, 
          description: translatedDescription,
          features: translatedFeatures
        };
      } catch (error) {
        console.error(`Translation error for ${lang.name}:`, error);
        // Fallback to original text if translation fails
        translations[lang.code as keyof ServiceTranslations] = { title, description, features };
      }
    }
  }

  return translations;
}

export async function translateBlogPost(title: string, excerpt: string, content: string, sourceLanguage: string): Promise<BlogPostTranslations> {
  const languages = [
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ru', name: 'Russian' },
    { code: 'en', name: 'English' }
  ];

  const translations: BlogPostTranslations = {
    uk: { title, excerpt, content },
    ru: { title, excerpt, content },
    en: { title, excerpt, content }
  };

  for (const lang of languages) {
    if (lang.code !== sourceLanguage) {
      try {
        console.log(`🔄 Translating blog post to ${lang.name}...`);
        const translatedTitle = await translateText(title, lang.code);
        const translatedExcerpt = await translateText(excerpt, lang.code);
        const translatedContent = await translateText(content, lang.code);
        
        translations[lang.code as keyof BlogPostTranslations] = {
          title: translatedTitle,
          excerpt: translatedExcerpt,
          content: translatedContent
        };
        console.log(`✅ Blog post translated to ${lang.name}`);
      } catch (error) {
        console.error(`Translation error for ${lang.name}:`, error);
        // Fallback to original text if translation fails
        translations[lang.code as keyof BlogPostTranslations] = { title, excerpt, content };
      }
    }
  }

  return translations;
}

export async function translateCompanyDescription(description: string, sourceLanguage: string): Promise<{
  uk: string;
  ru: string;
  en: string;
}> {
  const translations = {
    uk: sourceLanguage === 'uk' ? description : await translateText(description, 'uk'),
    ru: sourceLanguage === 'ru' ? description : await translateText(description, 'ru'),
    en: sourceLanguage === 'en' ? description : await translateText(description, 'en'),
  };

  return translations;
}

export async function translateAboutSection(title: string, description: string, sourceLanguage: string): Promise<{
  uk: { title: string; description: string };
  ru: { title: string; description: string };
  en: { title: string; description: string };
}> {
  const translations = {
    uk: {
      title: sourceLanguage === 'uk' ? title : await translateText(title, 'uk'),
      description: sourceLanguage === 'uk' ? description : await translateText(description, 'uk'),
    },
    ru: {
      title: sourceLanguage === 'ru' ? title : await translateText(title, 'ru'), 
      description: sourceLanguage === 'ru' ? description : await translateText(description, 'ru'),
    },
    en: {
      title: sourceLanguage === 'en' ? title : await translateText(title, 'en'),
      description: sourceLanguage === 'en' ? description : await translateText(description, 'en'),
    },
  };

  return translations;
}

export async function translateFeatureCard(title: string, description: string, sourceLanguage: string): Promise<{
  uk: { title: string; description: string };
  ru: { title: string; description: string };
  en: { title: string; description: string };
}> {
  const translations = {
    uk: {
      title: sourceLanguage === 'uk' ? title : await translateText(title, 'uk'),
      description: sourceLanguage === 'uk' ? description : await translateText(description, 'uk'),
    },
    ru: {
      title: sourceLanguage === 'ru' ? title : await translateText(title, 'ru'),
      description: sourceLanguage === 'ru' ? description : await translateText(description, 'ru'),
    },
    en: {
      title: sourceLanguage === 'en' ? title : await translateText(title, 'en'),
      description: sourceLanguage === 'en' ? description : await translateText(description, 'en'),
    },
  };

  return translations;
}

export function generateTranslationEntries(translations: ProjectTranslations): string {
  let entries = '';
  
  // Ukrainian entries (original keys)
  entries += `    "${translations.uk.title}": "${translations.uk.title}",\n`;
  entries += `    "${translations.uk.description}": "${translations.uk.description}",\n`;
  
  // Russian entries  
  entries += `    "${translations.uk.title}": "${translations.ru.title}",\n`;
  entries += `    "${translations.uk.description}": "${translations.ru.description}",\n`;
  
  // English entries
  entries += `    "${translations.uk.title}": "${translations.en.title}",\n`;
  entries += `    "${translations.uk.description}": "${translations.en.description}",\n`;
  
  return entries;
}