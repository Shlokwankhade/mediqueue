const bcrypt = require('bcryptjs');
const pool = require('./models/db');

async function fix() {
  try {
    const hash = await bcrypt.hash('password', 10);
    console.log('Hash generated:', hash);
    
    await pool.query('UPDATE users SET password_hash = $1', [hash]);
    console.log('✅ All passwords updated to: password');
    
    const r = await pool.query('SELECT email, role FROM users');
    console.log('Users in DB:');
    r.rows.forEach(u => console.log(' -', u.email, '|', u.role));
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

fix();