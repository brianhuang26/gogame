import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GamePage } from './pages/GamePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { api } from './services/api';

function AppContent() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  // Simple router
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Route matching
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/register') {
    return <RegisterPage />;
  }

  // Game route: /game/:id or just /:id
  const gameMatch = currentPath.match(/^\/([a-zA-Z0-9-]+)$/);
  if (gameMatch && gameMatch[1] !== 'login' && gameMatch[1] !== 'register') {
    return <GamePage gameId={gameMatch[1]} />;
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

        {isAuthenticated ? (
          <div style={{ marginBottom: '20px' }}>
            <p>歡迎, {user?.username}!</p>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              登出
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}
            >
              登入
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '10px 20px', cursor: 'pointer' }}
            >
              註冊
            </button>
          </div>
        )}

        <GameInput onJoin={(id) => navigate(`/${id}`)} />

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

function GameInput({ onJoin }: { onJoin: (id: string) => void }) {
  const [gameId, setGameId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      // Default 19x19 board, opponentId will be set when someone joins
      const response = await api.createGame(19, 'waiting-for-opponent');
      if (response.success) {
        onJoin(response.data.gameId);
      } else {
        alert('建立對局失敗: ' + (response.error?.message || '未知錯誤'));
      }
    } catch (error: any) {
      alert('建立對局失敗: ' + (error.message || '未知錯誤'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        輸入對局 ID 加入遊戲，或建立新對局
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          onClick={() => onJoin(gameId)}
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
        <button
          onClick={handleCreateGame}
          disabled={isCreating}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating ? 'wait' : 'pointer'
          }}
        >
          {isCreating ? '建立中...' : '建立新對局'}
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
