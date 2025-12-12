import { useEffect, useCallback, useState } from 'react';
import { api } from '../services/api';
import { useSocket } from './useSocket';

export const useGame = (gameId: string) => {
    const {
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
    } = useSocket(gameId);

    const [notFound, setNotFound] = useState(false);



    useEffect(() => {
        const loadGame = async () => {
            setNotFound(false);
            try {
                const response = await api.getGame(gameId);
                if (response.success) {
                    joinGame(gameId);
                }
            } catch (err: any) {
                console.error('Failed to load game:', err);
                if (err.error?.code === 'GAME_NOT_FOUND' || err.code === 'GAME_NOT_FOUND') {
                    setNotFound(true);
                } else {
                    if (err.error?.code === 'GAME_NOT_FOUND') {
                        setNotFound(true);
                    }
                }
            }
        };

        loadGame();
    }, [gameId, joinGame]);

    const handleStonePlace = useCallback((position: { x: number; y: number }) => {
        if (!gameState || !players) return;
        const currentColor = gameState.currentTurn;
        makeMove(gameId, position, currentColor);
    }, [gameId, gameState, players, makeMove]);

    const handlePass = useCallback(() => {
        if (!gameState) return;
        const currentColor = gameState.currentTurn;
        pass(gameId, currentColor);
    }, [gameId, gameState, pass]);

    const handleResign = useCallback(() => {
        if (confirm('確定要投降嗎？')) {
            resign(gameId);
        }
    }, [gameId, resign]);

    return {
        gameState,
        players,
        moves,
        error,
        isConnected,
        gameResult,
        notFound,
        handleStonePlace,
        handlePass,
        handleResign,
        clearError
    };
};
