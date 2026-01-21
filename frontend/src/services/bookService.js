import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get all books
export const getBooks = async (params = {}) => {
    const response = await axios.get(`${API_URL}/books`, { params });
    return response.data;
};

// Get single book
export const getBook = async (id) => {
    const response = await axios.get(`${API_URL}/books/${id}`);
    return response.data;
};

// Add book (Admin/Librarian)
export const addBook = async (bookData) => {
    const response = await axios.post(`${API_URL}/books`, bookData);
    return response.data;
};

// Update book (Admin/Librarian)
export const updateBook = async (id, bookData) => {
    const response = await axios.put(`${API_URL}/books/${id}`, bookData);
    return response.data;
};

// Delete book (Admin)
export const deleteBook = async (id) => {
    const response = await axios.delete(`${API_URL}/books/${id}`);
    return response.data;
};

// Get categories
export const getCategories = async () => {
    const response = await axios.get(`${API_URL}/books/categories/list`);
    return response.data;
};

// Get book statistics
export const getBookStats = async () => {
    const response = await axios.get(`${API_URL}/books/stats/overview`);
    return response.data;
};
