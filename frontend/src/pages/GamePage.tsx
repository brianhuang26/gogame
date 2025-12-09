import React, { useState, useEffect } from 'react';
import { Board } from '../components/Board/Board';
import { GameInfo } from '../components/GameInfo/GameInfo';
import { socket } from '../services/socket';
import { api } from '../services/api';
import { GameState, Position, Move } from '../../../shared/contracts/types';

/**
 * GamePage - Main game interface
 * 對局頁面
 */
export const GamePage: React.FC<{ gameId: string }> = ({ gameId }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<any>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (token) {
      socket.connect(token);
    }

    // Load game data
    loadGame();

    // Socket event listeners
    socket.on('game:joined', (data: any) => {
      console.log('Joined game:', data);
      setGameState(data.gameState);
      setPlayers(data.players);
      setMoves(data.moves);
      setIsConnected(true);
    });

    socket.on('game:move', (data: any) => {
      console.log('Move received:', data);
      setGameState(data.gameState);
      setMoves(prev => [...prev, data.move]);
      setError(null);
    });

    socket.on('game:move:error', (data: any) => {
      console.error('Move error:', data);
      setError(data.message);
    });

    socket.on('game:ended', (data: any) => {
      console.log('Game ended:', data);
      alert(`對局結束! 勝者: ${data.result.winner === 'black' ? '黑棋' : '白棋'}`);
    });

    socket.on('game:error', (data: any) => {
      console.error('Game error:', data);
      setError(data.message);
    });

    return () => {
      socket.off('game:joined');
      socket.off('game:move');
      socket.off('game:move:error');
      socket.off('game:ended');
      socket.off('game:error');
    };
  }, [gameId]);

  const loadGame = async () => {
    try {
      const response = await api.getGame(gameId);
      if (response.success) {
        const game = response.data;
        setGameState(game.state);
        setPlayers(game.players);
        setMoves(game.moves);

        // Join game room
        socket.joinGame(gameId);
      }
    } catch (err: any) {
      setError(err.error?.message || '載入對局失敗');
    }
  };

  const handleStonePlace = (position: Position) => {
    if (!gameState || !players) return;

    // Determine current player's color
    const currentColor = gameState.currentTurn;
    
    // Emit move via socket
    socket.makeMove(gameId, position, currentColor);
  };

  const handleResign = () => {
    if (confirm('確定要投降嗎？')) {
      socket.resign(gameId);
    }
  };

  if (!gameState || !players) {
    return <div style={{ padding: '20px' }}>載入中...</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>圍棋對局</h1>

      {error && (
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start'
      }}>
        <Board
          board={gameState.currentBoard}
          boardSize={gameState.currentBoard.length}
          lastMove={gameState.lastMove}
          onStonePlace={handleStonePlace}
          disabled={!isConnected}
        />

        <div>
          <GameInfo
            gameState={gameState}
            blackPlayerName={players.black.name}
            whitePlayerName={players.white.name}
          />

          <button
            onClick={handleResign}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            投降
          </button>

          <div style={{
            marginTop: '10px',
            fontSize: '0.9em',
            color: isConnected ? '#4caf50' : '#f44336'
          }}>
            {isConnected ? '● 已連線' : '● 未連線'}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h3>著手記錄</h3>
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {moves.map((move, index) => (
            <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid #ddd' }}>
              <strong>第 {move.moveNumber} 手:</strong>{' '}
              {move.color === 'black' ? '黑棋' : '白棋'}{' '}
              ({move.position.x}, {move.position.y})
              {move.capturedCount > 0 && ` - 提子 ${move.capturedCount}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
