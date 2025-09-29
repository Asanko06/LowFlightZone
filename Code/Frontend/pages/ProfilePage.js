import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: ""
    });
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (currentUser) {
            loadUserData();
        }
    }, [currentUser]);

    const loadUserData = async () => {
        try {
            const res = await api.get(`/api/users/${currentUser.id}`);
            const data = res.data;
            // показываем заглушку для пароля
            setFormData({ ...data, password: "••••••••" });
            setOriginalData({ ...data, password: "••••••••" });
        } catch (error) {
            console.error("Ошибка загрузки данных пользователя:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "password") {
            setPasswordChanged(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };

        // ❗ если пользователь не менял пароль — не отправляем его на сервер
        if (!passwordChanged) {
            delete payload.password;
        }

        try {
            await api.put(`/api/users/${currentUser.id}`, payload);
            setMessage("Данные успешно обновлены!");
            setOriginalData({ ...payload, password: "••••••••" });
            if (!passwordChanged) {
                setFormData({ ...payload, password: "••••••••" });
            }
            setPasswordChanged(false);
        } catch (error) {
            console.error("Ошибка обновления данных:", error);
            setMessage("Не удалось обновить данные");
        }
    };

    const hasChanges =
        originalData && JSON.stringify(formData) !== JSON.stringify(originalData);

    if (loading) return <div style={styles.loading}>Загрузка профиля...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Мой профиль</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Имя</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Фамилия</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        style={styles.input}
                        disabled
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Телефон</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}>Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password || ""}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    style={hasChanges ? styles.activeButton : styles.inactiveButton}
                    disabled={!hasChanges}
                >
                    Сохранить изменения
                </button>

                {message && <div style={styles.message}>{message}</div>}
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "500px",
        margin: "2rem auto",
        padding: "2rem",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    title: {
        fontSize: "1.8rem",
        marginBottom: "1.5rem",
        textAlign: "center",
        color: "#333"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
    },
    field: {
        display: "flex",
        flexDirection: "column"
    },
    label: {
        marginBottom: "0.5rem",
        fontWeight: "bold",
        color: "#444"
    },
    input: {
        padding: "0.8rem",
        fontSize: "1rem",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    activeButton: {
        padding: "0.8rem",
        fontSize: "1rem",
        backgroundColor: "#7EBFFF",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.3s ease"
    },
    inactiveButton: {
        padding: "0.8rem",
        fontSize: "1rem",
        backgroundColor: "white",
        color: "gray",
        border: "2px solid gray",
        borderRadius: "8px",
        cursor: "not-allowed",
        transition: "all 0.3s ease"
    },
    message: {
        marginTop: "1rem",
        textAlign: "center",
        fontWeight: "bold"
    },
    loading: {
        textAlign: "center",
        marginTop: "3rem",
        fontSize: "1.2rem"
    }
};

export default ProfilePage;
