import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PlayerRepository } from '../../db/repositories/PlayerRepository';
import { Player } from '../../models/Player';
import { ValidationError, ErrorMessages } from '../../utils/validation';


/**
 * Authentication Service
 * 認證服務
 */
export class AuthService {
    private playerRepository: PlayerRepository;

    constructor() {
        this.playerRepository = new PlayerRepository();
    }

    /**
     * 註冊新使用者
     */
    async register(username: string, email: string, password: string): Promise<{ player: Player; token: string }> {
        // 基本驗證
        if (!username || !email || !password) {
            throw new ValidationError('請填寫所有欄位');
        }

        if (password.length < 6) {
            throw new ValidationError('密碼長度至少需 6 個字元');
        }

        // 檢查 Email 是否已註冊
        const existingEmail = await this.playerRepository.findByEmail(email);
        if (existingEmail) {
            throw new ValidationError('此 Email 已被註冊');
        }

        // 檢查使用者名稱是否已存在
        const existingUser = await this.playerRepository.findByUsername(username);
        if (existingUser) {
            throw new ValidationError('此使用者名稱已被使用');
        }

        // 密碼加密
        const passwordHash = await bcrypt.hash(password, 10);

        // 建立玩家
        const player = await this.playerRepository.create(username, email, passwordHash);

        // 產生 Token
        const token = this.generateToken(player.playerId, player.username);

        return { player, token };
    }

    /**
     * 使用者登入
     */
    async login(email: string, password: string): Promise<{ player: Player; token: string }> {
        const player = await this.playerRepository.findByEmail(email);

        // 為了安全，統一錯誤訊息
        if (!player) {
            throw new ValidationError('Email 或密碼錯誤');
        }

        const isMatch = await bcrypt.compare(password, player.passwordHash);
        if (!isMatch) {
            throw new ValidationError('Email 或密碼錯誤');
        }

        if (player.status !== 'active') {
            throw new ValidationError(`帳號狀態異常 (${player.status})`);
        }

        // 更新最後登入時間
        await this.playerRepository.updateLastLogin(player.playerId);

        const token = this.generateToken(player.playerId, player.username);

        return { player, token };
    }

    /**
     * 取得當前使用者資料
     */
    async getMe(playerId: string): Promise<Player> {
        const player = await this.playerRepository.findById(playerId);
        if (!player) {
            throw new ValidationError(ErrorMessages.UNAUTHORIZED);
        }
        return player;
    }

    /**
     * 產生 JWT Token
     */
    private generateToken(playerId: string, username: string): string {
        return jwt.sign(
            { playerId, username },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
        );
    }
}
