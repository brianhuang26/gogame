import { useEffect, useState, useCallback } from 'react';
import { socket } from '../services/socket';
import { GameState, Move, GameResult } from '../../../shared/contracts/types';

interface UseSocketReturn {
    isConnected: boolean;
    gameState: GameState | null;
    players: any;
    moves: Move[];
    error: string | null;
    joinGame: (gameId: string) => void;
    makeMove: (gameId: string, position: { x: number; y: number }, color: string) => void;
    pass: (gameId: string, color: string) => void;
    resign: (gameId: string) => void;
    clearError: () => void;
    gameResult: GameResult | null;
}

export const useSocket = (gameId: string): UseSocketReturn => {
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [players, setPlayers] = useState<any>(null);
    const [moves, setMoves] = useState<Move[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        socket.connect(token || undefined);

        const onJoined = (data: any) => {
            console.log('Joined game:', data);
            setGameState(data.gameState);
            setPlayers(data.players);
            setMoves(data.moves);
            setIsConnected(true);
            if (data.status === 'completed' && data.result) {
                setGameResult(data.result);
            }
        };

        const onMove = (data: any) => {
            console.log('Move received:', data);
            setGameState(data.gameState);
            setMoves(prev => [...prev, data.move]);
            setError(null);
        };

        const onMoveError = (data: any) => {
            console.error('Move error:', data);
            setError(data.message);
        };

        const onEnded = (data: any) => {
            console.log('Game ended:', data);
            setGameResult(data.result);
            if (data.result.method === 'score') {
                // Update local state to reflect score if needed, though usually handled by gameState update
            }
        };

        const onError = (data: any) => {
            console.error('Game error:', data);
            setError(data.message);
        };

        socket.on('game:joined', onJoined);
        socket.on('game:move', onMove);
        socket.on('game:move:error', onMoveError);
        socket.on('game:ended', onEnded);
        socket.on('game:error', onError);

        return () => {
            socket.off('game:joined', onJoined);
            socket.off('game:move', onMove);
            socket.off('game:move:error', onMoveError);
            socket.off('game:ended', onEnded);
            socket.off('game:error', onError);
        };
    }, [gameId]);

    const joinGame = useCallback((id: string) => {
        socket.joinGame(id);
    }, []);

    const makeMove = useCallback((id: string, position: { x: number; y: number }, color: string) => {
        socket.makeMove(id, position, color);
    }, []);

    const pass = useCallback((id: string, color: string) => {
        socket.pass(id, color);
    }, []);

    const resign = useCallback((id: string) => {
        socket.resign(id);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isConnected,
        gameState,
        players,
        moves,
        error,
        joinGame,
        makeMove,
        pass,
        resign,
        clearError,
        gameResult
    };
};
