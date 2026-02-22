import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create payment order
export const createPaymentOrder = async (paymentData) => {
    const response = await axios.post(`${API_URL}/payment/create-order`, paymentData);
    return response.data;
};

// Verify payment
export const verifyPayment = async (verificationData) => {
    const response = await axios.post(`${API_URL}/payment/verify`, verificationData);
    return response.data;
};

// Get payment history
export const getPaymentHistory = async (params = {}) => {
    const response = await axios.get(`${API_URL}/payment/history`, { params });
    return response.data;
};

// Get single payment
export const getPayment = async (id) => {
    const response = await axios.get(`${API_URL}/payment/${id}`);
    return response.data;
};

// Download receipt
export const downloadReceipt = async (id) => {
    const response = await axios.get(`${API_URL}/payment/receipt/${id}`);
    return response.data;
};

// Get payment statistics (Admin)
export const getPaymentStats = async () => {
    const response = await axios.get(`${API_URL}/payment/stats`);
    return response.data;
};

// Load Razorpay script
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
// Send receipt via email (Admin/Librarian)
export const sendReceiptEmail = async (id) => {
    const response = await axios.post(`${API_URL}/payment/send-email/${id}`);
    return response.data;
};
// Get admin payment details for manual transfer
export const getAdminPaymentDetails = async () => {
    const response = await axios.get(`${API_URL}/payment/admin-details`);
    return response.data;
};

// Submit manual payment for verification
export const submitManualPayment = async (paymentData) => {
    const response = await axios.post(`${API_URL}/payment/submit-manual`, paymentData);
    return response.data;
};

// Verify manual payment (Admin)
export const verifyManualPayment = async (id, verificationData) => {
    const response = await axios.put(`${API_URL}/payment/verify-manual/${id}`, verificationData);
    return response.data;
};
