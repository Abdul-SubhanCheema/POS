import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on app start (from localStorage)
    useEffect(() => {
        const savedUser = localStorage.getItem('posUser');
        if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('posUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('posUser');
    };

    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    const isUser = () => {
        return user && user.role === 'user';
    };

    const isCashier = () => {
        return user && user.role === 'cashier';
    };

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        isAdmin,
        isUser,
        isCashier
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;