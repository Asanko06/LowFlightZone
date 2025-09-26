import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Произошла ошибка');
        }
        setLoading(false);
    };

    return (
        <div style={containerStyle}>
            <div style={formContainerStyle}>
                <h2>{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>

                {error && <div style={errorStyle}>{error}</div>}

                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                    </button>
                </form>

                <button
                    onClick={() => setIsLogin(!isLogin)}
                    style={toggleButtonStyle}
                >
                    {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
            </div>
        </div>
    );
};

const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem'
};

const formContainerStyle = {
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
};

const inputStyle = {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
};

const buttonStyle = {
    padding: '0.75rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
};

const toggleButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    marginTop: '1rem',
    textDecoration: 'underline'
};

const errorStyle = {
    color: '#e74c3c',
    backgroundColor: '#fadbd8',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem'
};

export default LoginPage;