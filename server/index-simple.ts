import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes-simple";

async function startServer() {
  const app = express();
  
  // Basic middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Register routes
  const httpServer = await registerRoutes(app);

  // Basic error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({ 
      message: "Внутрішня помилка сервера",
      error: err.message 
    });
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Webservice Studio API запущено на порту ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Помилка запуску сервера:", error);
  process.exit(1);
});