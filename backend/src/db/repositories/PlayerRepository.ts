import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { dbConnection } from '../connection';
import { Player } from '../../models/Player';
import { logger } from '../../utils/logger';

/**
 * Player Repository for MongoDB operations
 * 玩家資料庫操作
 */
export class PlayerRepository {
    private collection: Collection<Player>;

    constructor() {
        this.collection = dbConnection.getDb().collection<Player>('players');
    }

    /**
     * 建立新玩家
     */
    async create(username: string, email: string, passwordHash: string): Promise<Player> {
        const now = new Date();
        const player: Player = {
            playerId: uuidv4(),
            username,
            email,
            passwordHash,
            rating: 1200,
            ratingHistory: [],
            stats: {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0
            },
            status: 'active',
            violations: [],
            createdAt: now,
            lastLoginAt: now
        };

        await this.collection.insertOne(player as any);
        logger.info(`建立新玩家: ${player.username} (${player.playerId})`);

        return player;
    }

    /**
     * 根據 Email 查詢玩家
     */
    async findByEmail(email: string): Promise<Player | null> {
        return this.collection.findOne({ email });
    }

    /**
     * 根據使用者名稱查詢玩家
     */
    async findByUsername(username: string): Promise<Player | null> {
        return this.collection.findOne({ username });
    }

    /**
     * 根據 ID 查詢玩家
     */
    async findById(playerId: string): Promise<Player | null> {
        return this.collection.findOne({ playerId });
    }

    /**
     * 更新最後登入時間
     */
    async updateLastLogin(playerId: string): Promise<void> {
        await this.collection.updateOne(
            { playerId },
            { $set: { lastLoginAt: new Date() } }
        );
    }

    /**
     * 更新玩家戰績
     */
    async updateStats(playerId: string, isWin: boolean, isDraw: boolean): Promise<void> {
        const update: any = {
            $inc: {
                'stats.totalGames': 1
            }
        };

        if (isDraw) {
            update.$inc['stats.draws'] = 1;
        } else if (isWin) {
            update.$inc['stats.wins'] = 1;
        } else {
            update.$inc['stats.losses'] = 1;
        }

        await this.collection.updateOne({ playerId }, update);

        // Recalculate win rate
        const player = await this.findById(playerId);
        if (player && player.stats.totalGames > 0) {
            const winRate = player.stats.wins / player.stats.totalGames;
            await this.collection.updateOne(
                { playerId },
                { $set: { 'stats.winRate': winRate } }
            );
        }
    }
}
