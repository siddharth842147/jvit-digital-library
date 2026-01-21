const express = require('express');
const {
    createOrder,
    verifyPayment,
    getPaymentHistory,
    getPayment,
    getPaymentStats,
    downloadReceipt,
    sendReceiptEmail,
    getAdminPaymentDetails,
    submitManualPayment,
    verifyManualPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All protected routes
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/receipt/:id', protect, downloadReceipt);
router.get('/admin-details', protect, getAdminPaymentDetails);
router.post('/submit-manual', protect, submitManualPayment);
router.put('/verify-manual/:id', protect, authorize('admin', 'librarian'), verifyManualPayment);
router.get('/stats', protect, authorize('admin'), getPaymentStats);
router.post('/send-email/:id', protect, authorize('admin', 'librarian'), sendReceiptEmail);
router.get('/:id', protect, getPayment);

module.exports = router;
