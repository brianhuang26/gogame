import { MongoClient, Db } from 'mongodb';
import { logger } from '../utils/logger';

/**
 * MongoDB Connection Manager
 * MongoDB 連線管理
 */
class DatabaseConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gogame';
      
      this.client = new MongoClient(uri);
      await this.client.connect();
      
      this.db = this.client.db();
      
      await this.createIndexes();
      
      logger.info('MongoDB 連線成功');
    } catch (error) {
      logger.error('MongoDB 連線失敗', error);
      throw error;
    }
  }

  /**
   * 建立資料庫索引
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // Games collection indexes
      await this.db.collection('games').createIndex({ gameId: 1 }, { unique: true });
      await this.db.collection('games').createIndex({ 'players.black.playerId': 1, createdAt: -1 });
      await this.db.collection('games').createIndex({ 'players.white.playerId': 1, createdAt: -1 });
      await this.db.collection('games').createIndex({ status: 1, createdAt: -1 });

      // Players collection indexes
      await this.db.collection('players').createIndex({ playerId: 1 }, { unique: true });
      await this.db.collection('players').createIndex({ username: 1 }, { unique: true });
      await this.db.collection('players').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('players').createIndex({ rating: -1 });

      // Match requests collection with TTL
      await this.db.collection('matchRequests').createIndex({ status: 1, createdAt: 1 });
      await this.db.collection('matchRequests').createIndex({ playerId: 1 });
      await this.db.collection('matchRequests').createIndex(
        { expiredAt: 1 }, 
        { expireAfterSeconds: 0 }
      );

      logger.info('資料庫索引建立完成');
    } catch (error) {
      logger.error('索引建立失敗', error);
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('資料庫未連線');
    }
    return this.db;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      logger.info('MongoDB 連線已關閉');
    }
  }
}

export const dbConnection = new DatabaseConnection();
