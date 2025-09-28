import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import airplaneImage from "../assets/plane.png";
import {useNavigate} from "react-router-dom";

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentFlights, setRecentFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadRecentViews();
    }, []);

    // 📌 Загрузка истории просмотров
// 📌 Загрузка истории просмотров
    const loadRecentViews = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);

            // берем чуть больше просмотров, чтобы после фильтрации точно было 4
            const response = await api.get('/api/flight-views/my/recent?limit=20');
            let views = Array.isArray(response.data) ? response.data : [];

            // ✅ Удаляем дубликаты по flight.id, оставляем самый последний просмотр
            const uniqueMap = new Map();
            for (const view of views) {
                const flightId = view.flight?.id;
                if (!flightId) continue;
                const existing = uniqueMap.get(flightId);
                if (!existing || new Date(view.viewedAt) > new Date(existing.viewedAt)) {
                    uniqueMap.set(flightId, view);
                }
            }

            // ✅ Сортируем по времени просмотра и берём только 4 последних
            const uniqueSorted = Array.from(uniqueMap.values())
                .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
                .slice(0, 4);

            setRecentFlights(uniqueSorted);
        } catch (error) {
            console.error('Error loading recent views:', error);
            setError('Не удалось загрузить историю просмотров');
            setRecentFlights(getFallbackFlights());
        } finally {
            setLoading(false);
        }
    };


// 📌 Поиск рейсов
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadRecentViews();
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/flights/search?query=${encodeURIComponent(searchQuery)}&userEmail=${encodeURIComponent(currentUser.email)}`);

            const flights = Array.isArray(response.data) ? response.data : [];

            // ✅ Сохраняем флаг подписки, если он приходит с сервера
            const wrapped = flights.map(f => ({
                id: f.id,
                flight: {
                    ...f,
                    subscribed: f.subscribed ?? false // если нет — ставим false по умолчанию
                },
                viewCount: 0,
                viewedAt: null
            }));

            setRecentFlights(wrapped);
        } catch (error) {
            console.error('Search error:', error);
            setError('Ошибка при поиске рейсов');
        } finally {
            setLoading(false);
        }
    };


    // 📌 Подписка/отписка
    const toggleSubscription = async (flightId, currentStatus, flightNumber) => {
        try {
            if (currentStatus) {
                await api.post(`/api/subscriptions/unsubscribe?flightNumber=${flightNumber}`);
            } else {
                await api.post(`/api/subscriptions/subscribe?flightId=${flightId}`);
            }

            setRecentFlights(prevFlights =>
                prevFlights.map(view =>
                    view?.flight?.id === flightId
                        ? { ...view, flight: { ...view.flight, subscribed: !currentStatus } }
                        : view
                )
            );
        } catch (error) {
            console.error('Subscription error:', error);
            setError('Ошибка при изменении подписки');
        }
    };

    const recordFlightView = async (flightId) => {
        try {
            await api.post(`/api/flight-views/record/${flightId}`);
        } catch (error) {
            console.error('Error recording view:', error);
        }
    };

    const getFallbackFlights = () => [
        {
            id: 1,
            flight: {
                id: 1,
                flightNumber: 'SU1160',
                departureAirport: { city: 'Москва', iataCode: 'SVO' },
                arrivalAirport: { city: 'Стамбул', iataCode: 'IST' },
                subscribed: true
            },
            viewedAt: new Date().toISOString(),
            viewCount: 1
        }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Неизвестно';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={airplaneSectionStyle}>
                    <img src={airplaneImage} alt="Airplane" style={airplaneImageStyle} />
                </div>
                <div style={loadingStyle}>Загрузка истории просмотров...</div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={airplaneSectionStyle}>
                <div style={airplaneContainerStyle}>
                    <img src={airplaneImage} alt="Airplane" style={airplaneImageStyle} />
                </div>
            </div>

            <div style={searchSectionStyle}>
                <form onSubmit={handleSearch} style={searchFormStyle}>
                    <div style={searchContainerStyle}>
                        <input
                            type="text"
                            placeholder="Поиск рейсов по номеру, городу или аэропорту..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={searchInputStyle}
                        />
                        <button type="submit" style={searchButtonStyle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div style={errorStyle}>
                    {error}
                    <button onClick={() => setError('')} style={errorCloseStyle}>×</button>
                </div>
            )}

            <div style={recentFlightsSectionStyle}>
                <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>
                        {searchQuery ? 'Результаты поиска' : 'Недавно просмотренные рейсы'}
                    </h2>
                    <button onClick={loadRecentViews} style={refreshButtonStyle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#7EBFFF">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                        </svg>
                    </button>
                </div>

                {recentFlights.length === 0 ? (
                    <div style={emptyStateStyle}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="#7EBFFF">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <h3>{searchQuery ? 'Рейсы не найдены' : 'История просмотров пуста'}</h3>
                        <p>{searchQuery ? 'Попробуйте другой запрос' : 'Начните поиск рейсов, чтобы они появились здесь'}</p>
                    </div>
                ) : (
                    <div style={flightsListStyle}>
                        {recentFlights.map((viewHistory) => {
                            const flight = viewHistory?.flight;
                            if (!flight) return null;

                            return (
                                <div
                                    key={viewHistory.id}
                                    style={flightItemStyle}
                                    onClick={() => {
                                        navigate(`/flights/${flight.id}`);
                                    }}
                                >
                                    <div style={flightInfoStyle}>
                                        <div style={flightHeaderStyle}>
                                            <span style={flightNumberStyle}>{flight?.flightNumber || '—'}</span>
                                        </div>
                                        <span style={flightRouteStyle}>
                                            {flight?.departureAirport?.city} ({flight?.departureAirport?.iataCode}) →{' '}
                                            {flight?.arrivalAirport?.city} ({flight?.arrivalAirport?.iataCode})
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSubscription(flight.id, flight?.subscribed, flight?.flightNumber);
                                        }}
                                        style={heartButtonStyle}
                                        aria-label={flight?.subscribed ? 'Отписаться от рейса' : 'Подписаться на рейс'}
                                    >
                                        {flight?.subscribed ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// 📌 стили остаются без изменений …
const containerStyle = {
    minHeight: '100vh',
    backgroundColor: 'white',
    padding: '0 1rem'
};

const airplaneSectionStyle = {
    textAlign: 'center',
    padding: '2rem 0 1rem 0'
};

const airplaneContainerStyle = {
    marginTop: '2rem',
    position: 'relative',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    overflow: 'hidden',
    zIndex: 10,
};

const airplaneImageStyle = {
    width: '200px',
    height: 'auto',
    maxWidth: '100%',
};

const searchSectionStyle = {
    padding: '1rem 0 2rem 0'
};

const searchFormStyle = {
    maxWidth: '600px',
    margin: '0 auto'
};

const searchContainerStyle = {
    display: 'flex',
    borderRadius: '25px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const searchInputStyle = {
    flex: 1,
    padding: '1rem 1.5rem',
    border: 'none',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#f8f9fa'
};

const searchButtonStyle = {
    padding: '1rem 1.5rem',
    backgroundColor: '#7EBFFF',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.3s ease'
};

const recentFlightsSectionStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem 0'
};

const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
};

const sectionTitleStyle = {
    color: 'black',
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: 0
};

const refreshButtonStyle = {
    backgroundColor: 'transparent', // ✅ заменяем shorthand на backgroundColor
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
};

const flightsListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
};

const flightItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7EBFFF',
    padding: '1.2rem 1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
};

const flightInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1
};

const flightHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const flightNumberStyle = {
    color: 'black',
    fontSize: '1.1rem',
    fontWeight: '600'
};

const viewCountStyle = {
    color: 'black',
    fontSize: '0.8rem',
    opacity: '0.7'
};

const flightRouteStyle = {
    color: 'black',
    fontSize: '0.9rem',
    opacity: '0.9'
};

const viewDateStyle = {
    color: 'black',
    fontSize: '0.8rem',
    opacity: '0.6'
};

const heartButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    minWidth: '44px',
    minHeight: '44px'
};

const loadingStyle = {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '1.1rem'
};

const errorStyle = {
    backgroundColor: '#ffe6e6',
    color: '#d63031',
    padding: '1rem',
    borderRadius: '8px',
    margin: '1rem auto',
    maxWidth: '600px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const errorCloseStyle = {
    background: 'none',
    border: 'none',
    color: '#d63031',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0'
};

const emptyStateStyle = {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: '#666'
};

// ✨ Hover эффекты оставлены как в оригинале
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  [style*="${flightItemStyle.backgroundColor}"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`, styleSheet.cssRules.length);

try {
    const styleSheet = document.styleSheets[0];
    if (styleSheet) {
        styleSheet.insertRule(`
  [style*="${flightItemStyle.backgroundColor}"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`, styleSheet.cssRules.length);
    }
} catch (e) {
    console.warn("CSS hover rules not applied:", e);
}

styleSheet.insertRule(`
  [style*="${searchButtonStyle.backgroundColor}"]:hover {
    background-color: #6ca8e6;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  [style*="${heartButtonStyle.background}"]:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  [style*="${refreshButtonStyle.background}"]:hover {
    background-color: rgba(126, 191, 255, 0.1);
  }
`, styleSheet.cssRules.length);

export default Home;
