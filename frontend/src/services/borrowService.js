import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Borrow a book
export const borrowBook = async (bookId, dueDate) => {
    const response = await axios.post(`${API_URL}/borrow`, { bookId, dueDate });
    return response.data;
};

// Return a book
export const returnBook = async (borrowId) => {
    const response = await axios.post(`${API_URL}/borrow/return/${borrowId}`);
    return response.data;
};

// Get my borrowed books
export const getMyBorrowedBooks = async () => {
    const response = await axios.get(`${API_URL}/borrow/my-books`);
    return response.data;
};

// Get borrow history
export const getBorrowHistory = async (params = {}) => {
    const response = await axios.get(`${API_URL}/borrow/history`, { params });
    return response.data;
};

// Get active borrows (Admin/Librarian)
export const getActiveBorrows = async () => {
    const response = await axios.get(`${API_URL}/borrow/active`);
    return response.data;
};

// Get overdue books (Admin/Librarian)
export const getOverdueBooks = async () => {
    const response = await axios.get(`${API_URL}/borrow/overdue`);
    return response.data;
};
// Approve borrow request (Admin/Librarian)
export const approveBorrow = async (id) => {
    const response = await axios.put(`${API_URL}/borrow/approve/${id}`);
    return response.data;
};

// Verify return receipt (Admin/Librarian)
export const verifyReturn = async (id) => {
    const response = await axios.put(`${API_URL}/borrow/verify-return/${id}`);
    return response.data;
};
