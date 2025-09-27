import React, { useState } from 'react';
import airplaneImage from "../assets/plane.png";

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    // Используем useReducer для более надежного управления состоянием
    const [recentFlights, setRecentFlights] = useState([
        {
            id: 1,
            flightNumber: 'SU1160',
            departure: { city: 'Москва', code: 'SVO' },
            arrival: { city: 'Стамбул', code: 'IST' },
            isSubscribed: true
        },
        {
            id: 2,
            flightNumber: 'SU1334',
            departure: { city: 'Москва', code: 'SVO' },
            arrival: { city: 'Архангельск', code: 'ARH' },
            isSubscribed: false
        },
        {
            id: 3,
            flightNumber: 'SU7331',
            departure: { city: 'Минск', code: 'MSQ' },
            arrival: { city: 'Москва', code: 'SVO' },
            isSubscribed: true
        },
        {
            id: 4,
            flightNumber: 'SU1548',
            departure: { city: 'Москва', code: 'SVO' },
            arrival: { city: 'Новосибирск', code: 'OVB' },
            isSubscribed: false
        }
    ]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
        }
    };

    // Исправленная функция переключения подписки
    const toggleSubscription = (flightId) => {
        setRecentFlights(prevFlights =>
            prevFlights.map(flight =>
                flight.id === flightId
                    ? { ...flight, isSubscribed: !flight.isSubscribed }
                    : flight
            )
        );
    };

    return (
        <div style={containerStyle}>
            {/* Картинка самолета вверху */}
            <div style={airplaneSectionStyle}>
                <div style={airplaneContainerStyle}>
                    <img
                        src={airplaneImage}
                        alt="Airplane"
                        style={airplaneImageStyle}
                    />
                </div>
            </div>

            {/* Строка поиска */}
            <div style={searchSectionStyle}>
                <form onSubmit={handleSearch} style={searchFormStyle}>
                    <div style={searchContainerStyle}>
                        <input
                            type="text"
                            placeholder="Поиск рейсов..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={searchInputStyle}
                        />
                        <button type="submit" style={searchButtonStyle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* Список недавних рейсов */}
            <div style={recentFlightsSectionStyle}>
                <h2 style={sectionTitleStyle}>Недавние рейсы</h2>
                <div style={flightsListStyle}>
                    {recentFlights.map(flight => (
                        <div key={flight.id} style={flightItemStyle}>
                            <div style={flightInfoStyle}>
                                <span style={flightNumberStyle}>{flight.flightNumber}</span>
                                <span style={flightRouteStyle}>
                                    {flight.departure.city} ({flight.departure.code}) - {flight.arrival.city} ({flight.arrival.code})
                                </span>
                            </div>
                            <button
                                onClick={() => toggleSubscription(flight.id)}
                                style={heartButtonStyle}
                                aria-label={flight.isSubscribed ? 'Отписаться от рейса' : 'Подписаться на рейс'}
                            >
                                {flight.isSubscribed ? (
                                    // Заполненное сердечко
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                ) : (
                                    // Контур сердечка
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

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
    fontSize: '4rem',
    opacity: '0.8'
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

const sectionTitleStyle = {
    color: 'black',
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    textAlign: 'left'
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
    transition: 'transform 0.2s ease'
};

const flightInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem'
};

const flightNumberStyle = {
    color: 'black',
    fontSize: '1.1rem',
    fontWeight: '600'
};

const flightRouteStyle = {
    color: 'black',
    fontSize: '0.9rem',
    opacity: '0.9'
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

// Добавляем hover эффекты
const styleSheet = document.styleSheets[0];

// Эффект при наведении на карточку рейса
styleSheet.insertRule(`
  [style*="${flightItemStyle.backgroundColor}"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`, styleSheet.cssRules.length);

// Эффект при наведении на кнопку поиска
styleSheet.insertRule(`
  [style*="${searchButtonStyle.backgroundColor}"]:hover {
    background-color: #6ca8e6;
  }
`, styleSheet.cssRules.length);

// Эффект при наведении на сердечко
styleSheet.insertRule(`
  [style*="${heartButtonStyle.background}"]:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
`, styleSheet.cssRules.length);

export default Home;