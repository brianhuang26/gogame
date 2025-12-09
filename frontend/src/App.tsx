import React, { useState } from 'react';
import { GamePage } from './pages/GamePage';

/**
 * Main Application Component
 * 主應用程式元件
 */
function App() {
  const [gameId, setGameId] = useState<string>('');
  const [isInGame, setIsInGame] = useState(false);

  // For MVP, we'll use a simple game ID input
  const handleStartGame = () => {
    if (gameId.trim()) {
      setIsInGame(true);
      // Update URL without reloading
      window.history.pushState({}, '', `/${gameId}`);
    }
  };

  React.useEffect(() => {
    const path = window.location.pathname.slice(1);
    if (path && path.length > 5) {
      setGameId(path);
      setIsInGame(true);
    }
  }, []);

  if (isInGame && gameId) {
    return <GamePage gameId={gameId} />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1>圍棋線上對戰系統</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          輸入對局 ID 開始遊戲
        </p>

        <input
          type="text"
          placeholder="對局 ID"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '300px',
            marginBottom: '20px'
          }}
        />

        <br />

        <button
          onClick={handleStartGame}
          disabled={!gameId.trim()}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: gameId.trim() ? 'pointer' : 'not-allowed',
            opacity: gameId.trim() ? 1 : 0.6
          }}
        >
          進入對局
        </button>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          textAlign: 'left'
        }}>
          <h3 style={{ marginTop: 0 }}>MVP 功能:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>基本對局流程（落子、提子）</li>
            <li>打劫規則（超級打劫檢查）</li>
            <li>即時同步（WebSocket）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
