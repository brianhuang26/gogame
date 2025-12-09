import React from 'react';
import { GameState } from '../../../../../shared/contracts/types';
import { CapturedStones } from './CapturedStones';
import './GameInfo.css';

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
    <div className="game-info">
      <h3 className="info-header">對局資訊</h3>

      <div className="turn-indicator">
        <span className="turn-label">當前回合</span>
        <div className="current-player">
          <div className={`player-dot ${currentTurn === 'black' ? 'dot-black' : 'dot-white'}`} />
          <span>{currentTurn === 'black' ? '黑棋' : '白棋'}</span>
        </div>
      </div>

      <div className="move-counter">
        手數: {moveNumber}
      </div>

      <div className="players-container">
        <div className={`player-card ${currentTurn === 'black' ? 'active' : ''}`}>
          <div className="player-name">
            <div className="player-dot dot-black" />
            {blackPlayerName}
          </div>
          <div className="captured-area">
            <CapturedStones count={capturedStones.black} color="white" />
          </div>
        </div>

        <div className={`player-card ${currentTurn === 'white' ? 'active' : ''}`}>
          <div className="player-name">
            <div className="player-dot dot-white" />
            {whitePlayerName}
          </div>
          <div className="captured-area">
            <CapturedStones count={capturedStones.white} color="black" />
          </div>
        </div>
      </div>
    </div>
  );
};
