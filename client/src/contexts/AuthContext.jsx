import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check locally first
        const userInfoString = localStorage.getItem('userInfo');
        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                setUser(userInfo);
            } catch (err) { }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await authAPI.login({ email, password });
            setUser(res.data);
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            return res;
        } catch (err) {
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const res = await authAPI.register(userData);
            setUser(res.data);
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            return res;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
