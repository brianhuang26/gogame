import React from 'react';
import { GameState } from '../../../../../shared/contracts/types';

interface GameInfoProps {
  gameState: GameState;
  blackPlayerName: string;
  whitePlayerName: string;
}

/**
 * GameInfo Component - Display current game information
 * 對局資訊元件
 */
export const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  blackPlayerName,
  whitePlayerName
}) => {
  const { currentTurn, moveNumber, capturedStones } = gameState;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      minWidth: '250px'
    }}>
      <h3 style={{ marginTop: 0 }}>對局資訊</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>當前回合:</strong>{' '}
        <span style={{ color: currentTurn === 'black' ? '#000' : '#666' }}>
          {currentTurn === 'black' ? '黑棋' : '白棋'}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>手數:</strong> {moveNumber}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>黑棋:</strong> {blackPlayerName}
        <br />
        <span style={{ fontSize: '0.9em', color: '#666' }}>
          提子: {capturedStones.black}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>白棋:</strong> {whitePlayerName}
        <br />
        <span style={{ fontSize: '0.9em', color: '#666' }}>
          提子: {capturedStones.white}
        </span>
      </div>
    </div>
  );
};
