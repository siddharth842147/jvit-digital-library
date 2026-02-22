import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get dashboard statistics
export const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard`);
    return response.data;
};

// Get all users
export const getAllUsers = async (params = {}) => {
    const response = await axios.get(`${API_URL}/admin/users`, { params });
    return response.data;
};

// Get single user
export const getUser = async (id) => {
    const response = await axios.get(`${API_URL}/admin/users/${id}`);
    return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
    const response = await axios.put(`${API_URL}/admin/users/${id}`, userData);
    return response.data;
};

// Delete user
export const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`);
    return response.data;
};

// Get reports
export const getReports = async (params = {}) => {
    const response = await axios.get(`${API_URL}/admin/reports`, { params });
    return response.data;
};
// Create user
export const createUser = async (userData) => {
    const response = await axios.post(`${API_URL}/admin/users`, userData);
    return response.data;
};
