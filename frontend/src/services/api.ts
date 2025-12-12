import axios, { AxiosInstance } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * API Client Service
 * API 客戶端服務
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor - 加入 JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Game endpoints
  async createGame(boardSize: number, opponentId: string, komi?: number): Promise<ApiResponse> {
    return this.client.post('/games', { boardSize, opponentId, komi }) as any;
  }

  async getGame(gameId: string): Promise<ApiResponse> {
    return this.client.get(`/games/${gameId}`) as any;
  }

  async placeStone(gameId: string, position: { x: number; y: number }, color: string): Promise<ApiResponse> {
    return this.client.post(`/games/${gameId}/moves`, { position, color }) as any;
  }

  async endGame(gameId: string, method: string, winner: string): Promise<ApiResponse> {
    return this.client.post(`/games/${gameId}/end`, { method, winner }) as any;
  }

  // Auth endpoints
  async register(data: any): Promise<ApiResponse> {
    return this.client.post('/auth/register', data) as any;
  }

  async login(data: any): Promise<ApiResponse> {
    return this.client.post('/auth/login', data) as any;
  }

  async getMe(): Promise<ApiResponse> {
    return this.client.get('/auth/me') as any;
  }

  async getPlayer(playerId: string): Promise<ApiResponse> {
    return this.client.get(`/players/${playerId}`) as any;
  }

  async getPlayerStats(playerId: string): Promise<ApiResponse> {
    return this.client.get(`/players/${playerId}/stats`) as any;
  }
}

export const api = new ApiService();
