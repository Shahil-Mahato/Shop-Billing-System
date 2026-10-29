const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const same = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const userOk = same(username, process.env.ADMIN_USER);
  const passOk = same(password, process.env.ADMIN_PASSWORD);
  if (!(userOk && passOk)) {
    return res.status(401).json({ error: 'Wrong username or password.' });
  }
  const token = jwt.sign({ user: process.env.ADMIN_USER }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

module.exports = router;