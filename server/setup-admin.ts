import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function setupDefaultAdmin() {
  try {
    // Check if admin already exists
    let existingAdmin = await storage.getAdminByUsername("admin");
    
    if (existingAdmin) {
      console.log('✅ Администратор уже существует');
      console.log('   Логин: admin');
      console.log('   Email:', existingAdmin.email || 'admin@web-service.studio');
      console.log('   Для входа используйте стандартные данные');
      return;
    }

    // Create default admin if doesn't exist
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await storage.createAdmin({
      username: "admin",
      password: hashedPassword,
      email: "admin@web-service.studio"
    });

    console.log('✅ Создан администратор по умолчанию:');
    console.log('   Логин: admin');
    console.log('   Пароль: admin123');
    console.log('   Email: admin@web-service.studio');
    console.log('⚠️  Обязательно смените пароль после первого входа!');
    
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error);
  }
}

export { setupDefaultAdmin };