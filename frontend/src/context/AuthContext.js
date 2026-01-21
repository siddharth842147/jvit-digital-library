import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Load user data
    const loadUser = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`);
            setUser(res.data.data);
        } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    }, []);

    // Set axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token, loadUser]);

    // Login
    const login = async (email, password) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                email,
                password
            });

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            toast.success('Login successful!');
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Register
    const register = async (userData) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, userData);

            const { token, user } = res.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            toast.success('Registration successful!');
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        toast.info('Logged out successfully');
    };

    // Update user profile
    const updateProfile = async (userData) => {
        try {
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/auth/update-details`, userData);
            setUser(res.data.data);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Update password
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/auth/update-password`, {
                currentPassword,
                newPassword
            });
            toast.success('Password updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Password update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { email });
            toast.success('Password reset email sent!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Request failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        isLibrarian: user?.role === 'librarian' || user?.role === 'admin',
        isStudent: user?.role === 'student'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
