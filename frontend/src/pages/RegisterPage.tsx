import React, { useState } from 'react';
import { api } from '../services/api';
import './Auth.css';

export const RegisterPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.register({ username, email, password });
            if (response.success) {
                // 註冊成功後導向登入頁面
                onNavigate('/login');
            } else {
                setError(response.error?.message || '註冊失敗');
            }
        } catch (err: any) {
            // Handle both Error objects and API response objects
            const message = err.error?.message || err.message || '發生錯誤';
            setError(message);
        }
    };

    return (
        <div className="auth-container">
            <h2>註冊</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>使用者名稱</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>密碼 (至少 6 碼)</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>
                <button type="submit">註冊</button>
            </form>
            <p>
                已有帳號？ <span
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => onNavigate('/login')}
                >
                    登入
                </span>
            </p>
        </div>
    );
};
