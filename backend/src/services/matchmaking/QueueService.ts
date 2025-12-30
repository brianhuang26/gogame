import { logger } from '../../utils/logger';

interface QueueEntry {
    socketId: string;
    playerId: string;
    username: string;
    joinedAt: Date;
    rating?: number;
}

export class QueueService {
    private queue: QueueEntry[] = [];

    constructor() {
        this.queue = [];
    }

    /**
     * Add a player to the matchmaking queue
     */
    addToQueue(entry: { socketId: string; playerId: string; username: string; rating?: number }): void {
        // Check if player is already in queue
        const existingIndex = this.queue.findIndex(e => e.playerId === entry.playerId);
        if (existingIndex !== -1) {
            // Update socket ID if re-joining
            this.queue[existingIndex].socketId = entry.socketId;
            logger.info(`Player re-joined queue: ${entry.username}`);
            return;
        }

        this.queue.push({
            ...entry,
            joinedAt: new Date()
        });
        logger.info(`Player added to queue: ${entry.username}. Queue size: ${this.queue.length}`);
    }

    /**
     * Remove a player from the queue
     */
    removeFromQueue(socketId: string): void {
        const index = this.queue.findIndex(e => e.socketId === socketId);
        if (index !== -1) {
            const removed = this.queue.splice(index, 1)[0];
            logger.info(`Player removed from queue: ${removed.username}. Queue size: ${this.queue.length}`);
        }
    }

    /**
     * Try to find a match
     * Simple FIFO matching for now
     */
    findMatch(): { black: QueueEntry; white: QueueEntry } | null {
        if (this.queue.length < 2) {
            return null;
        }

        // Take the first two players
        const p1 = this.queue.shift()!;
        const p2 = this.queue.shift()!;

        // Randomize colors
        if (Math.random() > 0.5) {
            return { black: p1, white: p2 };
        } else {
            return { black: p2, white: p1 };
        }
    }

    /**
     * Remove player by playerId
     */
    removeByPlayerId(playerId: string): void {
        const index = this.queue.findIndex(e => e.playerId === playerId);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }
    }
}
