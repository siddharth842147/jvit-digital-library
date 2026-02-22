const express = require('express');
const {
    getResources,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    incrementDownload,
    updateResourceStatus
} = require('../controllers/resourceController');

const router = express.Router();

const { protect, authorize, optionalProtect } = require('../middleware/auth');
const path = require('path');
const multer = require('multer');

// Configure multer for resource uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/resources/');
    },
    filename: function (req, file, cb) {
        cb(null, `resource_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

router.route('/')
    .get(optionalProtect, getResources)
    .post(protect, authorize('admin', 'librarian', 'student'), upload.single('file'), createResource);

router.route('/:id')
    .get(getResource)
    .put(protect, authorize('admin', 'librarian'), updateResource)
    .delete(protect, authorize('admin'), deleteResource);

router.put('/:id/status', protect, authorize('admin', 'librarian'), updateResourceStatus);

router.put('/:id/download', incrementDownload);

module.exports = router;
