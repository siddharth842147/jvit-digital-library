const express = require('express');
const { getInventoryReport, getFineReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/inventory', getInventoryReport);
router.get('/fines', getFineReport);

module.exports = router;
