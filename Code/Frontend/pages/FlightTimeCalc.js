// src/pages/FlightTimeCalc.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../services/api";

/* =============================================================================
   Фолбэки координат по IATA
   ========================================================================== */
//const IATA_FALLBACKS = {
//    SVO: [55.972642, 37.414589],
//    DME: [55.408611, 37.906111],
//    VKO: [55.591531, 37.261486],
//    LED: [59.800292, 30.262503],
//    IST: [41.2753, 28.7519],
//    JFK: [40.6413, -73.7781],
//    LHR: [51.47, -0.4543],
//    CDG: [49.0097, 2.5479],
//    DXB: [25.2532, 55.3657],
//    HND: [35.5494, 139.7798],
//    SIN: [1.3644, 103.9915],
//    LAX: [33.9416, -118.4085],
//};

/* =============================================================================
   Аккуратные пины
   ========================================================================== */
const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const airportIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [26, 42],
    iconAnchor: [13, 42],
    popupAnchor: [1, -36],
    shadowSize: [41, 41],
});

/* =============================================================================
   Утилиты
   ========================================================================== */
const minutes = (n) => n * 60 * 1000;

const formatTime = (dateLike) => {
    if (!dateLike) return "—";
    return new Date(dateLike).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const haversineKm = (a, b) => {
    if (!a || !b) return 0;
    const [lat1, lon1] = a;
    const [lat2, lon2] = b;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const s1 =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
    return R * c;
};

/* =============================================================================
   Автоподгон карты
   ========================================================================== */
const FitBounds = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        const pts = points.filter(Boolean);
        if (pts.length === 0) return;
        if (pts.length === 1) {
            map.setView(pts[0], 12);
        } else {
            map.fitBounds(pts, { padding: [40, 40] });
        }
    }, [points, map]);
    return null;
};

/* =============================================================================
   Основной компонент FlightTimeCalc
   ========================================================================== */
const FlightTimeCalc = () => {
    const { flightId } = useParams();
    const navigate = useNavigate();

    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userPos, setUserPos] = useState(null);
    const [geoError, setGeoError] = useState("");

    const [airportParams] = useState({
        trafficMultiplier: 1.2,
        avgSpeedKmh: 32,
        checkinMin: 10,
        securityMin: 15,
        passportMin: 10,
        bufferMin: 20,
    });

    /* -------------------- Загрузка данных рейса -------------------- */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/flights/${flightId}`);
                setFlight(res.data);
            } catch (e) {
                console.error(e);
                setError("Не удалось загрузить данные рейса");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [flightId]);

    /* -------------------- Геолокация пользователя -------------------- */
    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setGeoError("Геолокация недоступна в этом браузере.");
            setUserPos([55.751244, 37.618423]);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
            () => {
                setGeoError("Не удалось определить местоположение. Используем Москву как точку старта.");
                setUserPos([55.751244, 37.618423]);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 20000 }
        );
    }, []);

    /* -------------------- Координаты аэропорта -------------------- */
    const departureIATA = flight?.departureAirport?.iataCode;
    const airportCoords =
        (flight?.departureAirport?.latitude &&
            flight?.departureAirport?.longitude &&
            [flight.departureAirport.latitude, flight.departureAirport.longitude]) ||
        (departureIATA) ||
        null;

    /* -------------------- Статусы -------------------- */
    const statusRaw = flight?.status || "";
    const statusLower = statusRaw.toLowerCase();

    const isCancelled = statusLower === "cancelled";
    const isDeparted =
        statusLower === "departed" || statusLower === "arrived" || statusLower === "landed";
    const isDelayed = statusLower === "delayed";
    const isCritical = ["cancelled", "delayed", "diverted", "incident", "emergency"].includes(
        statusLower
    );

    const actualStr =
        isDelayed && flight?.estimatedDeparture
            ? `${formatTime(flight.estimatedDeparture)} ${
                flight?.delayMinutes ? `(+${flight.delayMinutes} мин)` : ""
            }`
            : flight?.actualDeparture
                ? formatTime(flight.actualDeparture)
                : "—";

    /* -------------------- Расчёт рекомендаций -------------------- */
    const now = new Date();

    const { leaveBy, beAtGateBy, driveMinutes, procMinutesTotal } = useMemo(() => {
        if (isDeparted || isCancelled) {
            return { leaveBy: null, beAtGateBy: null, driveMinutes: null, procMinutesTotal: null };
        }
        if (!airportCoords || !userPos || !flight?.scheduledDeparture) {
            return { leaveBy: null, beAtGateBy: null, driveMinutes: null, procMinutesTotal: null };
        }

        const distKm = haversineKm(userPos, airportCoords);
        const baseDriveMin = (distKm / Math.max(airportParams.avgSpeedKmh, 5)) * 60;
        const driveMin = Math.ceil(baseDriveMin * airportParams.trafficMultiplier);

        const procMin =
            airportParams.checkinMin +
            airportParams.securityMin +
            airportParams.passportMin +
            airportParams.bufferMin;

        const gateTime = new Date(
            new Date(flight.scheduledDeparture).getTime() - minutes(30)
        );

        const leave = new Date(gateTime.getTime() - minutes(driveMin + procMin));

        return { leaveBy: leave, beAtGateBy: gateTime, driveMinutes: driveMin, procMinutesTotal: procMin };
    }, [airportCoords, userPos, flight?.scheduledDeparture, airportParams, isDeparted, isCancelled]);

    /* -------------------- Состояния загрузки -------------------- */
    if (loading) return <div style={s.loading}>Загрузка…</div>;
    if (error) return <div style={s.error}>{error}</div>;
    if (!flight) return <div style={s.error}>Рейс не найден</div>;

    const titleLine = `${flight?.departureAirport?.city || ""} (${flight?.departureAirport?.iataCode || ""}) → ${flight?.arrivalAirport?.city || ""} (${flight?.arrivalAirport?.iataCode || ""}) — ${flight?.flightNumber || ""}`;

    /* -------------------- Рендер -------------------- */
    return (
        <div style={s.wrapper}>
            <div style={s.titleBar}>{titleLine}</div>

            {/* Карточка статуса */}
            <div style={s.card}>
                <Row label="STATUS">
                    <div style={s.statusWrap}>
                        {isCritical && <span style={{ ...s.dot, background: "#b91c1c" }} />}
                        <span style={s.statusText}>{statusRaw || "—"}</span>
                    </div>
                </Row>

                <Divider />

                <Row label="SCHEDULED">
                    <span>{formatTime(flight?.scheduledDeparture)}</span>
                </Row>

                <Divider />

                <Row label="ACTUAL">
                    <span>{actualStr}</span>
                </Row>

                <Divider />

                <Row label="GATE">
                    <span>{isCancelled ? "— (рейс отменён)" : flight?.gate || "—"}</span>
                </Row>
            </div>

            {/* Карточка рекомендаций */}
            <div style={s.card}>
                <Row label="NOW">
                    <span>{formatTime(now)}</span>
                </Row>

                <Divider />

                {isCancelled || isDeparted ? (
                    <div style={{ padding: "0.75rem 0" }}>
                        <div>Ориентировочно выезжайте к <strong>—</strong></div>
                        <div style={{ color: "#6b7280" }}>
                            (чтобы быть у гейта к <strong>—</strong>)
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: "0.75rem 0" }}>
                        <div>
                            Ориентировочно выезжайте к <strong>{leaveBy ? formatTime(leaveBy) : "—"}</strong>
                        </div>
                        <div style={{ color: "#6b7280" }}>
                            (чтобы быть у гейта к <strong>{beAtGateBy ? formatTime(beAtGateBy) : "—"}</strong>)
                        </div>
                        {driveMinutes !== null && procMinutesTotal !== null && (
                            <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
                                Дорога: ~{driveMinutes} мин • Процедуры в аэропорту: ~{procMinutesTotal} мин
                            </div>
                        )}
                        {geoError && (
                            <div style={{ marginTop: 6, fontSize: 12, color: "#b91c1c" }}>{geoError}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Карта */}
            <div style={s.mapCard}>
                <div style={s.mapTitle}>Местоположение и аэропорт</div>
                <div style={s.mapBox}>
                    <MapContainer
                        center={airportCoords || userPos || [55.751244, 37.618423]}
                        zoom={11}
                        style={{ height: "340px", width: "100%" }}
                        scrollWheelZoom
                    >
                        <TileLayer
                            attribution="&copy; OpenStreetMap"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {userPos && <Marker position={userPos} icon={userIcon} />}
                        {airportCoords && <Marker position={airportCoords} icon={userIcon} />}
                        <FitBounds points={[userPos, airportCoords].filter(Boolean)} />
                    </MapContainer>
                </div>
            </div>

            <button onClick={() => navigate(-1)} style={s.backBtn}>
                ← Назад
            </button>
        </div>
    );
};

/* =============================================================================
   UI Примитивы
   ========================================================================== */
const Row = ({ label, children }) => (
    <div style={s.row}>
        <div style={s.rowLabel}>{label}</div>
        <div style={s.rowValue}>{children}</div>
    </div>
);

const Divider = () => <div style={s.divider} />;

/* =============================================================================
   Стили
   ========================================================================== */
const s = {
    wrapper: { maxWidth: 620, margin: "0 auto", padding: "1rem" },
    titleBar: {
        background: "#7EBFFF",
        color: "#0b2239",
        fontWeight: 600,
        borderRadius: 8,
        padding: "0.65rem 0.9rem",
        marginBottom: "0.9rem",
    },
    card: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "0.75rem 0.9rem",
        marginBottom: "0.9rem",
        background: "#fff",
    },
    row: {
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.35rem 0",
    },
    rowLabel: { fontWeight: 700, color: "#374151" },
    rowValue: { color: "#111827" },
    divider: { height: 1, background: "#e5e7eb", margin: "0.3rem 0" },
    statusWrap: { display: "flex", alignItems: "center", gap: 10 },
    dot: { width: 12, height: 12, borderRadius: "50%", display: "inline-block" },
    statusText: { fontWeight: 700, letterSpacing: 0.5 },
    mapCard: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "0.75rem 0.9rem",
        background: "#fff",
    },
    mapTitle: { fontWeight: 700, marginBottom: 8, color: "#374151" },
    mapBox: { borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" },
    backBtn: {
        marginTop: "1rem",
        backgroundColor: "#7EBFFF",
        border: "none",
        padding: "0.7rem 1.2rem",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
    },
    loading: { textAlign: "center", marginTop: "2rem" },
    error: { textAlign: "center", marginTop: "2rem", color: "red" },
};

export default FlightTimeCalc;
