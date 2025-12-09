import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { dbConnection } from './db/connection';
import { logger } from './utils/logger';
import { errorHandler } from './api/middleware/errorHandler';
import { rateLimitMiddleware } from './api/middleware/rateLimit';

dotenv.config();

/**
 * Express Application Setup
 * Express 應用程式設定
 */
class App {
  public app: Application;
  public httpServer: HttpServer;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
      },
      path: process.env.SOCKET_PATH || '/socket.io'
    });

    this.initializeMiddleware();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting
    this.app.use(rateLimitMiddleware);

    // Logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  public initializeRoutes(): void {
    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    const gamesRouter = require('./api/routes/games').default;
    this.app.use('/api/v1/games', gamesRouter);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await dbConnection.connect();

      // Initialize routes after database connection
      this.initializeRoutes();

      const port = process.env.PORT || 3000;
      this.httpServer.listen(port, () => {
        logger.info(`伺服器啟動於 port ${port}`);
      });
    } catch (error) {
      logger.error('伺服器啟動失敗', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await dbConnection.disconnect();
    this.httpServer.close();
    logger.info('伺服器已關閉');
  }
}

export default App;
