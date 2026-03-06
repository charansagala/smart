import { createContext, useContext, useState } from 'react';
import { authAPI } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
            try {
                return JSON.parse(userInfoString);
            } catch { /* invalid JSON, ignore */ }
        }
        return null;
    });
    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        setUser(res.data);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        return res;
    };

    const register = async (userData) => {
        const res = await authAPI.register(userData);
        setUser(res.data);
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        return res;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
