import { useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';

export const useMatchmaking = (onMatchFound: (gameId: string) => void) => {
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handleMatchFound = (data: { gameId: string }) => {
            setIsSearching(false);
            onMatchFound(data.gameId);
        };

        socket.on('matchmaking:found', handleMatchFound);

        const handleMatchError = (data: { message: string }) => {
            setIsSearching(false);
            alert(data.message);
        };
        socket.on('matchmaking:error', handleMatchError);

        return () => {
            socket.off('matchmaking:found', handleMatchFound);
            socket.off('matchmaking:error', handleMatchError);
        };
    }, [onMatchFound]);

    const findMatch = useCallback(() => {
        setIsSearching(true);
        socket.findMatch();
    }, []);

    const cancelMatch = useCallback(() => {
        setIsSearching(false);
        socket.cancelFindMatch();
    }, []);

    return {
        isSearching,
        findMatch,
        cancelMatch
    };
};
