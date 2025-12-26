import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Auth.css';

export const LoginPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.login({ email, password });
            if (response.success) {
                login(response.data.token, response.data.player);
                onNavigate('/');
            } else {
                setError(response.error?.message || '登入失敗');
            }
        } catch (err: any) {
            // Handle both Error objects and API response objects
            const message = err.error?.message || err.message || '發生錯誤';
            setError(message);
        }
    };

    return (
        <div className="auth-container">
            <h2>登入</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
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
                    <label>密碼</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">登入</button>
            </form>
            <p>
                還沒有帳號？ <span
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => onNavigate('/register')}
                >
                    註冊
                </span>
            </p>
        </div>
    );
};
