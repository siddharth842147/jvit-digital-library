const express = require('express');
const {
    getDashboardStats,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getReports,
    createUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin/librarian role
router.use(protect);
router.use(authorize('admin', 'librarian'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.post('/users', authorize('admin', 'librarian'), createUser);
router.put('/users/:id', authorize('admin', 'librarian'), updateUser);
router.delete('/users/:id', authorize('admin', 'librarian'), deleteUser);
router.get('/reports', getReports);

module.exports = router;
