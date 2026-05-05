const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

// POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Compare against env credentials
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ success: true, message: 'Logged in successfully.' });
  } catch (err) {
    console.error('adminLogin error:', err);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

// POST /api/admin/logout
const adminLogout = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out.' });
};

module.exports = { adminLogin, adminLogout };
