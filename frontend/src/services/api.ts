import axios, { AxiosInstance } from 'axios';

/**
 * API Client Service
 * API 客戶端服務
 */
class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
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
      (response) => response.data,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Game endpoints
  async createGame(boardSize: number, opponentId: string, komi?: number) {
    return this.client.post('/games', { boardSize, opponentId, komi });
  }

  async getGame(gameId: string) {
    return this.client.get(`/games/${gameId}`);
  }

  async placeStone(gameId: string, position: { x: number; y: number }, color: string) {
    return this.client.post(`/games/${gameId}/moves`, { position, color });
  }

  async endGame(gameId: string, method: string, winner: string) {
    return this.client.post(`/games/${gameId}/end`, { method, winner });
  }
}

export const api = new ApiService();
