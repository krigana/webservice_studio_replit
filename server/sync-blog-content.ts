import { storage } from "./storage";

async function syncBlogContent() {
  console.log("🔄 Синхронизация контента блога...");
  
  try {
    const allPosts = await storage.getAllBlogPosts();
    
    for (const post of allPosts) {
      const updates: any = {};
      let needsUpdate = false;
      
      // Если украинская версия заголовка пустая, берем из основного поля
      if (!post.titleUk && post.title) {
        updates.titleUk = post.title;
        needsUpdate = true;
      }
      
      // Если украинская версия содержимого пустая, берем из основного поля
      if (!post.contentUk && post.content) {
        updates.contentUk = post.content;
        needsUpdate = true;
      }
      
      // Если украинская версия выдержки пустая, берем из основного поля
      if (!post.excerptUk && post.excerpt) {
        updates.excerptUk = post.excerpt;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await storage.updateBlogPost(post.id, updates);
        console.log(`✅ Обновлен пост ${post.id}: ${post.title}`);
      }
    }
    
    console.log("🎉 Синхронизация завершена!");
  } catch (error) {
    console.error("❌ Ошибка синхронизации:", error);
  }
}

// Запускаем синхронизацию
syncBlogContent().then(() => {
  process.exit(0);
}).catch(error => {
  console.error("Синхронизация не удалась:", error);
  process.exit(1);
});