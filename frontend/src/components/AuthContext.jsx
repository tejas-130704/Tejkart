import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        const accessToken = localStorage.getItem('access');
        

        if (accessToken) {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/user/', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                setUser(response.data);
            } catch (error) {
                console.error("Session expired, refreshing token...");
                refreshAccessToken();
            }
        }
    };

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
                    refresh: refreshToken,
                });

                localStorage.setItem('access', response.data.access);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                checkUserAuth(); // Re-attempt fetching user info
            } catch (error) {
                console.error("Session expired. Please log in again.");
                logout();
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
