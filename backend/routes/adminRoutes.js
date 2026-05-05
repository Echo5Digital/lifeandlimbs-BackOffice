const express = require('express');
const router  = express.Router();
const { adminLogin, adminLogout } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.post('/login',  adminLogin);
router.post('/logout', protect, adminLogout);

module.exports = router;
