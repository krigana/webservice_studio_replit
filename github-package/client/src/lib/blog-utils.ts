import { BlogPost } from "@shared/schema";
import type { Language } from "./i18n";

// Функция для удаления HTML-тегов из текста
function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Сначала заменяем HTML-entities на обычные символы
  let text = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
  
  // Удаляем все HTML-теги с помощью регулярного выражения
  text = text.replace(/<[^>]*>/g, '');
  
  // Дополнительно используем DOM для очистки оставшихся тегов
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = text;
    text = tmp.textContent || tmp.innerText || '';
  } catch (e) {
    // Fallback если DOM недоступен
  }
  
  // Убираем лишние пробелы и переносы строк
  return text.replace(/\s+/g, ' ').trim();
}

export function getBlogPostTitle(post: BlogPost, language: Language): string {
  switch (language) {
    case 'uk':
      return post.titleUk || post.title;
    case 'ru':
      return post.titleRu || post.title;
    case 'en':
      return post.titleEn || post.title;
    default:
      return post.title;
  }
}

export function getBlogPostExcerpt(post: BlogPost, language: Language): string {
  let excerpt: string;
  switch (language) {
    case 'uk':
      excerpt = post.excerptUk || post.excerpt;
      break;
    case 'ru':
      excerpt = post.excerptRu || post.excerpt;
      break;
    case 'en':
      excerpt = post.excerptEn || post.excerpt;
      break;
    default:
      excerpt = post.excerpt;
  }
  return stripHtmlTags(excerpt);
}

export function getBlogPostContent(post: BlogPost, language: Language): string {
  switch (language) {
    case 'uk':
      return post.contentUk || post.content;
    case 'ru':
      return post.contentRu || post.content;
    case 'en':
      return post.contentEn || post.content;
    default:
      return post.content;
  }
}

export function formatDate(date: Date, language: Language): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const locale = language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uk-UA';
  return date.toLocaleDateString(locale, options);
}

export function getReadingTime(content: string, language: Language): string {
  const wordsPerMinute = 200;
  const words = content ? content.split(/\s+/).length : 0;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  switch (language) {
    case 'uk':
      return `${minutes} хв читання`;
    case 'ru':
      return `${minutes} мин чтения`;
    case 'en':
      return `${minutes} min read`;
    default:
      return `${minutes} хв читання`;
  }
}