const Holiday = require('../models/Holiday');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Public
exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json({
            success: true,
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a holiday
// @route   POST /api/holidays
// @access  Private (Admin)
exports.addHoliday = async (req, res) => {
    try {
        const { date, description, type } = req.body;
        const holiday = await Holiday.create({ date, description, type });
        res.status(201).json({
            success: true,
            data: holiday
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Admin)
exports.deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            return res.status(404).json({ success: false, message: 'Holiday not found' });
        }
        await holiday.deleteOne();
        res.status(200).json({ success: true, message: 'Holiday deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
