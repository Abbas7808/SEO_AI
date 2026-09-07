const db = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await db.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ name, email, hashedPassword }) {
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return {
      id: result.insertId,
      name,
      email
    };
  }
};

module.exports = userModel;
