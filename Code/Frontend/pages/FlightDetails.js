import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import terminalImage from "../assets/terminal.png";

const FlightDetails = () => {
    const { flightId } = useParams();
    const [flight, setFlight] = useState(null);
    const [expanded, setExpanded] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchFlight();
    }, [flightId]);

    const fetchFlight = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/flights/${flightId}`);
            setFlight(res.data);
        } catch (e) {
            console.error(e);
            setError("Ошибка загрузки данных рейса");
        } finally {
            setLoading(false);
        }
    };

    const getBoardingTimeInfo = () => {
        if (!flight?.scheduledDeparture) return null;

        const boardingEnd = new Date(flight.scheduledDeparture);
        const now = new Date();
        const diffMinutes = Math.floor((boardingEnd - now) / 60000);

        if (diffMinutes <= 0) return { text: "Посадка закрыта", color: "red" };
        if (diffMinutes < 20) return { text: `Посадка заканчивается через ${diffMinutes} мин`, color: "red" };
        if (diffMinutes < 60) return { text: `Посадка заканчивается через ${diffMinutes} мин`, color: "orange" };
        return { text: `Посадка заканчивается через ${Math.floor(diffMinutes / 60)} ч ${diffMinutes % 60} мин`, color: "black" };
    };

    const addDelayToTime = (date, delayMinutes) => {
        if (!date || !delayMinutes) return date;
        return new Date(new Date(date).getTime() + delayMinutes * 60000);
    };

    if (loading) return <div style={styles.loading}>Загрузка...</div>;
    if (error) return <div style={styles.error}>{error}</div>;
    if (!flight) return <div style={styles.error}>Рейс не найден</div>;

    const cancelled = flight.status?.toLowerCase() === "cancelled";
    const arrived = flight.status?.toLowerCase() === "arrived";
    const delayed = flight.delayMinutes && flight.delayMinutes > 0;
    const boardingInfo = !cancelled && !arrived ? getBoardingTimeInfo() : null;

    const adjustedDeparture = arrived && delayed
        ? addDelayToTime(flight.scheduledDeparture, flight.delayMinutes)
        : flight.actualDeparture;

    const adjustedArrival = arrived && delayed
        ? addDelayToTime(flight.scheduledArrival, flight.delayMinutes)
        : flight.actualArrival;

    return (
        <div style={styles.container}>
            {/* 🛫 Верхний блок с аэропортом */}
            <div style={styles.header}>
                <h2 style={styles.airportName}>{flight.departureAirport?.name}</h2>
                <p style={styles.iata}>{flight.departureAirport?.iataCode} Elev. {flight.departureAirport?.altitude}ft</p>
            </div>

            {/* 🗺️ Схема терминала */}
            <div style={styles.imageWrapper}>
                <img src={terminalImage} alt="Terminal map" style={styles.terminalImage} />
            </div>

            {/* ✈️ Город прибытия и номер рейса */}
            <div style={styles.routeBlock}>
                <h3>{flight.arrivalAirport?.city} ({flight.flightNumber})</h3>
                <button style={styles.toggleButton} onClick={() => setExpanded(!expanded)}>
                    {expanded ? "▲" : "▼"}
                </button>
            </div>

            {/* 📊 Таблица */}
            {expanded && (
                <div style={styles.table}>
                    {!cancelled ? (
                        <>
                            <div style={styles.row}>
                                <div style={{ ...styles.cell, ...styles.withRightBorder }}>
                                    <strong>По расписанию вылет:</strong>
                                    <div>{formatDate(flight.scheduledDeparture)}</div>
                                </div>
                                <div style={styles.cell}>
                                    <strong>Фактический вылет:</strong>
                                    <div>
                                        {arrived
                                            ? delayed
                                                ? formatDate(adjustedDeparture)
                                                : "—"
                                            : adjustedDeparture
                                                ? formatDate(adjustedDeparture)
                                                : "—"}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={{ ...styles.cell, ...styles.withRightBorder }}>
                                    <strong>По расписанию прибытие:</strong>
                                    <div>{formatDate(flight.scheduledArrival)}</div>
                                </div>
                                <div style={styles.cell}>
                                    <strong>Фактическое прибытие:</strong>
                                    <div>
                                        {arrived
                                            ? delayed
                                                ? formatDate(adjustedArrival)
                                                : "—"
                                            : adjustedArrival
                                                ? formatDate(adjustedArrival)
                                                : "—"}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={{ ...styles.cell, flex: 1 }}>
                                    <strong>Статус рейса:</strong>
                                    <div>{flight.status || "—"}</div>
                                    {delayed && (
                                        <div style={{ color: "orange", marginTop: "0.3rem" }}>
                                            Задержка: {flight.delayMinutes} мин
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={{ ...styles.cell, ...styles.withRightBorder }}>
                                    <strong>Авиакомпания:</strong>
                                    <div>{flight.airline}</div>
                                </div>
                                <div style={styles.cell}>
                                    <strong>Рейс №:</strong>
                                    <div>{flight.flightNumber}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={styles.cancelledBlock}>
                            🛑 Рейс отменён. Данные недоступны.
                        </div>
                    )}
                </div>
            )}

            {/* 🛫 Гейт */}
            {!cancelled && !arrived && (
                <div style={styles.gateBlock}>
                    Посадка на рейс из гейта {flight.gate || "—"}
                </div>
            )}

            {/* ⏱️ Оставшееся время */}
            {!cancelled && !arrived && boardingInfo && (
                <div style={{ ...styles.boardingTime, color: boardingInfo.color }}>
                    {boardingInfo.text}
                </div>
            )}

            {/* 🛬 Если рейс прибыл */}
            {arrived && (
                <div style={styles.completedFooter}>
                    ✈️ Посадка завершена — рейс прибыл.
                </div>
            )}

            {cancelled && (
                <div style={styles.cancelledFooter}>
                    ✈️ Рейс отменён — посадка не производится.
                </div>
            )}

            <button onClick={() => navigate(-1)} style={styles.backButton}>← Назад</button>
        </div>
    );
};

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const styles = {
    container: { maxWidth: "600px", margin: "0 auto", padding: "1rem" },
    header: { backgroundColor: "#7EBFFF", padding: "1rem", borderRadius: "8px" },
    airportName: { margin: 0, fontSize: "1.5rem" },
    iata: { margin: 0, color: "#555" },
    imageWrapper: { textAlign: "center", margin: "1rem 0" },
    terminalImage: { width: "100%", maxWidth: "500px", borderRadius: "8px" },
    routeBlock: { backgroundColor: "#7EBFFF", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
    toggleButton: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" },

    table: {
        marginTop: "1rem",
        fontSize: "0.95rem",
        lineHeight: "1.8",
        border: "1px solid #d0d7de",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#fdfdfd",
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        padding: "0.8rem 1rem",
        borderBottom: "1px solid #e0e0e0",
    },
    cell: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        paddingRight: "1rem",
    },
    withRightBorder: {
        borderRight: "1px solid #d0d7de",
        paddingRight: "1.5rem",
        marginRight: "1.5rem",
    },

    cancelledBlock: { textAlign: "center", padding: "2rem 1rem", backgroundColor: "#ffe6e6", color: "red", fontWeight: "bold", borderRadius: "8px" },
    gateBlock: { backgroundColor: "#7EBFFF", padding: "1rem", textAlign: "center", borderRadius: "8px", marginTop: "1rem", fontWeight: "bold" },
    boardingTime: { marginTop: "0.8rem", textAlign: "center", fontSize: "1.1rem" },
    completedFooter: { marginTop: "1rem", textAlign: "center", color: "green", fontWeight: "bold" },
    cancelledFooter: { marginTop: "1rem", textAlign: "center", color: "red", fontWeight: "bold" },
    loading: { textAlign: "center", marginTop: "2rem" },
    error: { textAlign: "center", color: "red", marginTop: "2rem" },
    backButton: { marginTop: "2rem", backgroundColor: "#7EBFFF", border: "none", padding: "0.7rem 1.2rem", borderRadius: "8px", cursor: "pointer" }
};

export default FlightDetails;
