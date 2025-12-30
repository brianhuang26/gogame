import { io, Socket } from 'socket.io-client';

/**
 * Socket.IO Client Service
 * Socket.IO 客戶端服務
 */
class SocketService {
  private socket: Socket | null = null;

  connect(token?: string): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    this.socket = io(url, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinGame(gameId: string): void {
    this.socket?.emit('game:join', { gameId });
  }

  makeMove(gameId: string, position: { x: number; y: number }, color: string): void {
    this.socket?.emit('game:move', { gameId, position, color });
  }

  pass(gameId: string, color: string): void {
    this.socket?.emit('game:pass', { gameId, color });
  }

  resign(gameId: string): void {
    this.socket?.emit('game:resign', { gameId });
  }

  findMatch(): void {
    this.socket?.emit('matchmaking:join', {});
  }

  cancelFindMatch(): void {
    this.socket?.emit('matchmaking:cancel', {});
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socket = new SocketService();
