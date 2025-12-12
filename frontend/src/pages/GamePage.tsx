import React from 'react';
import { Board } from '../components/Board/Board';
import { GameInfo } from '../components/GameInfo/GameInfo';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { useGame } from '../hooks/useGame';
import './GamePage.css';

/**
 * GamePage - Main game interface
 * 對局頁面
 */
export const GamePage: React.FC<{ gameId: string }> = ({ gameId }) => {
  const {
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
  } = useGame(gameId);

  if (notFound) {
    return (
      <div className="game-container" style={{ justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2>找不到此對局</h2>
          <p>對局 ID: {gameId} 不存在。</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            回首頁
          </button>
        </div>
      </div>
    );
  }

  if (!gameState || !players) {
    return <div className="game-page">載入中...</div>;
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <h1 className="game-title">圍棋對局</h1>
      </div>

      <ErrorDisplay message={error} onClose={clearError} />

      {gameResult && (
        <div className="game-result-modal">
          <div className="result-content">
            <h2>對局結束</h2>
            <p>
              勝者: {gameResult.winner === 'black' ? '黑棋' : (gameResult.winner === 'white' ? '白棋' : '和局')}
            </p>
            <p>結束方式: {gameResult.method === 'score' ? '數子' : '投降'}</p>
            {gameResult.score && (
              <div className="score-details">
                <p>黑棋: {gameResult.score.black} 目</p>
                <p>白棋: {gameResult.score.white} 目</p>
              </div>
            )}
            <button onClick={() => window.location.href = '/'}>返回首頁</button>
          </div>
        </div>
      )}

      <div className="game-content">
        <Board
          board={gameState.currentBoard}
          boardSize={gameState.currentBoard.length}
          lastMove={gameState.lastMove}
          onStonePlace={handleStonePlace}
          disabled={!isConnected || !!gameResult}
        />

        <div className="game-sidebar">
          <GameInfo
            gameState={gameState}
            blackPlayerName={players.black.name}
            whitePlayerName={players.white.name}
          />

          <div className="action-buttons">
            <button
              onClick={handlePass}
              className="pass-button"
              disabled={!!gameResult}
            >
              虛手 (Pass)
            </button>
            <button
              onClick={handleResign}
              className="resign-button"
              disabled={!!gameResult}
            >
              投降
            </button>
          </div>

          <div className={`connection-status ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
            <span className="status-dot" />
            {isConnected ? '已連線' : '未連線'}
          </div>
        </div>
      </div>

      <div className="move-history">
        <h3 className="history-title">著手記錄</h3>
        <div className="history-list">
          {moves.map((move, index) => (
            <div key={index} className="history-item">
              <div>
                <span className="history-move-number">第 {move.moveNumber} 手</span>
                <span className={`history-player ${move.color === 'black' ? 'player-black' : 'player-white'}`}>
                  {move.color === 'black' ? '黑棋' : '白棋'}
                </span>
                <span className="history-coords">
                  {move.isPass ? '虛手' : `(${move.position.x}, ${move.position.y})`}
                </span>
              </div>
              {move.capturedCount > 0 && (
                <span className="history-capture">
                  提子 {move.capturedCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
