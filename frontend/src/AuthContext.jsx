import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(() => Number(localStorage.getItem('balance')) || 8050);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        console.log("Что пришло при логине:", userData);
        const normalizedUser = {
            ...userData,
            full_name: userData.name || userData.full_name || "Гость"
        };
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('balance');
    };

    const updateUser = (newData) => {
        const updatedUser = {
            ...user,
            ...newData,
            full_name: newData.name || newData.full_name || user.full_name
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser, balance, setBalance }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);