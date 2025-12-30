import App from './app';
import { SocketManager } from './websocket/SocketManager';
import { logger } from './utils/logger';

/**
 * Server Entry Point
 * 伺服器入口
 */
async function main() {
  try {
    const app = new App();

    // Start server and connect to database
    await app.start();

    // Initialize Socket.IO after database connection
    new SocketManager(app.io);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('收到 SIGTERM 信號，準備關閉伺服器');
      await app.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('收到 SIGINT 信號，準備關閉伺服器');
      await app.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error('伺服器啟動失敗', error);
    process.exit(1);
  }
}

main();
 
