/**
 * Player Model Interface
 * 玩家模型介面
 */

export type PlayerStatus = 'active' | 'banned' | 'suspended';

export interface RatingChange {
  gameId: string;
  ratingBefore: number;
  ratingAfter: number;
  opponentRating: number;
  result: 'win' | 'loss' | 'draw';
  timestamp: Date;
}

export interface Violation {
  violationType: 'fast_moves' | 'ai_pattern' | 'multi_device' | 'other';
  gameId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  reviewStatus: 'pending' | 'confirmed' | 'dismissed';
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Player {
  _id?: string;
  playerId: string;
  username: string;
  email: string;
  passwordHash: string;
  rating: number;
  ratingHistory: RatingChange[];
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
  status: PlayerStatus;
  violations: Violation[];
  createdAt: Date;
  lastLoginAt: Date;
}
