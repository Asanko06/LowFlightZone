import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import airplaneImage from "../assets/plane.png";

const MyFlights = () => {
    const { currentUser } = useAuth();
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            loadSubscribedFlights();
        }
    }, [currentUser]);

    // 📌 Загружаем полную информацию о подписанных рейсах
    const loadSubscribedFlights = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/subscriptions/user/${currentUser.email}`);
            const subscriptions = res.data || [];

            // загружаем полные данные по каждому рейсу
            const flightsFull = await Promise.all(
                subscriptions.map(async (sub) => {
                    try {
                        const flightRes = await api.get(`/flights/${sub.flight.id}`);
                        return { ...flightRes.data, subscribed: true };
                    } catch (e) {
                        console.warn("Ошибка загрузки данных рейса:", e);
                        return null;
                    }
                })
            );

            setFlights(flightsFull.filter(Boolean)); // отфильтровываем неудачные
        } catch (err) {
            console.error("Ошибка загрузки подписок:", err);
            setError("Не удалось загрузить подписки");
        } finally {
            setLoading(false);
        }
    };

    // 📌 Отписка/подписка с автообновлением списка
    const toggleSubscription = async (flightId, currentStatus, flightNumber) => {
        try {
            if (currentStatus) {
                await api.post(`/api/subscriptions/unsubscribe?flightNumber=${flightNumber}`);
            } else {
                await api.post(`/api/subscriptions/subscribe?flightId=${flightId}`);
            }
            await loadSubscribedFlights(); // 🔁 обновляем список
        } catch (error) {
            console.error("Ошибка изменения подписки:", error);
            setError("Не удалось изменить подписку");
        }
    };

    if (loading) return <div style={styles.loading}>Загрузка...</div>;

    return (
        <div style={styles.container}>
            {/* ✈️ Самолёт сверху */}
            <div style={styles.airplaneSection}>
                <div style={styles.airplaneContainer}>
                    <img src={airplaneImage} alt="Airplane" style={styles.airplaneImage} />
                </div>
            </div>

            <h2 style={styles.title}>Мои рейсы</h2>

            {error && <div style={styles.error}>{error}</div>}

            {flights.length === 0 ? (
                <div style={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#7EBFFF">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <h3>У вас нет подписанных рейсов</h3>
                    <p>Подпишитесь на интересующие вас рейсы, чтобы они появились здесь</p>
                </div>
            ) : (
                <div style={styles.flightsList}>
                    {flights.map((flight) => (
                        <div
                            key={flight.id}
                            style={styles.flightItem}
                            onClick={() => navigate(`/flights/${flight.id}`)}
                        >
                            <div style={styles.flightInfo}>
                                <div style={styles.flightHeader}>
                                    <span style={styles.flightNumber}>{flight.flightNumber || "—"}</span>
                                </div>
                                <span style={styles.flightRoute}>
                                    {flight?.departureAirport?.city} ({flight?.departureAirport?.iataCode}) →{" "}
                                    {flight?.arrivalAirport?.city} ({flight?.arrivalAirport?.iataCode})
                                </span>
                            </div>

                            <div style={styles.rightSide}>
                                {/* ❤️ кнопка подписки как на главной */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubscription(flight.id, flight.subscribed, flight.flightNumber);
                                    }}
                                    style={styles.heartButton}
                                    aria-label={flight.subscribed ? "Отписаться от рейса" : "Подписаться на рейс"}
                                >
                                    {flight.subscribed ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="black" strokeWidth="1">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    )}
                                </button>

                                {/* 📊 кнопка рассчёта времени */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/flights/${flight.id}/calculate`);
                                    }}
                                    style={styles.calcButton}
                                >
                                    Рассчитать время
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { minHeight: "100vh", backgroundColor: "white", padding: "0 1rem" },
    airplaneSection: { textAlign: "center", padding: "2rem 0 1rem 0" },
    airplaneContainer: { marginTop: "2rem", position: "relative", bottom: "10px", left: "50%", transform: "translateX(-50%)" },
    airplaneImage: { width: "200px", height: "auto", maxWidth: "100%" },
    title: { fontSize: "2rem", fontWeight: "600", textAlign: "center", marginBottom: "2rem", color: "#333" },
    flightsList: { display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "600px", margin: "0 auto" },
    flightItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#7EBFFF",
        padding: "1.2rem 1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease",
        cursor: "pointer",
    },
    flightInfo: { display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 },
    flightHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    flightNumber: { color: "black", fontSize: "1.1rem", fontWeight: "600" },
    flightRoute: { color: "black", fontSize: "0.9rem", opacity: "0.9" },
    rightSide: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" },
    heartButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.5rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        minWidth: "44px",
        minHeight: "44px",
    },
    calcButton: {
        background: "white",
        color: "#7EBFFF",
        border: "2px solid #7EBFFF",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
    },
    loading: { textAlign: "center", marginTop: "3rem", fontSize: "1.2rem" },
    error: { textAlign: "center", color: "red", marginBottom: "1rem" },
    emptyState: { textAlign: "center", padding: "3rem 1rem", color: "#666" },
};

export default MyFlights;
