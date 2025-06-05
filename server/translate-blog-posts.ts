import { storage } from "./storage";
import { translateBlogPost } from "./translate";

async function translateBlogPosts() {
  console.log("🔄 Перевод статей блога...");
  
  try {
    const posts = await storage.getAllBlogPosts();
    
    // Найдем статьи, которые нуждаются в переводе
    const postsToTranslate = posts.filter(p => 
      p.title.includes('Финальная статья333') || 
      p.title.includes('Сучасні тренди')
    );
    
    for (const post of postsToTranslate) {
      console.log(`📝 Переводим: ${post.title}`);
      
      // Определяем исходный язык
      const sourceLanguage = post.title.includes('Сучасні') ? 'uk' : 'ru';
      
      try {
        // Получаем переводы
        const translations = await translateBlogPost(
          post.title,
          post.excerpt || '',
          post.content || '',
          sourceLanguage
        );
        
        // Обновляем статью с переводами
        await storage.updateBlogPost(post.id, {
          titleUk: translations.uk.title,
          titleRu: translations.ru.title,
          titleEn: translations.en.title,
          excerptUk: translations.uk.excerpt,
          excerptRu: translations.ru.excerpt,
          excerptEn: translations.en.excerpt,
          contentUk: translations.uk.content,
          contentRu: translations.ru.content,
          contentEn: translations.en.content,
        });
        
        console.log(`✅ Переведена статья: ${post.title}`);
      } catch (error) {
        console.error(`❌ Ошибка перевода статьи ${post.title}:`, error);
      }
    }
    
    console.log("🎉 Перевод завершен!");
  } catch (error) {
    console.error("❌ Ошибка перевода:", error);
  }
}

// Запускаем перевод
translateBlogPosts().then(() => {
  process.exit(0);
}).catch(error => {
  console.error("Перевод не удался:", error);
  process.exit(1);
});