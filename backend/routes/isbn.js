const express = require('express');
const router = express.Router();
const { lookupISBN } = require('../controllers/isbnController');

router.get('/lookup/:isbn', lookupISBN);

module.exports = router;
