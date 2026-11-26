require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// เข้าสู่ระบบ
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE user_name = ? AND password = ?';
  pool.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดที่ฐานข้อมูล' });
    }
    if (results.length > 0) {
      res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ!',
        user: results[0],
      });
    } else {
      res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
  });
});

// ดึงข้อมูลข่าวทั้งหมด
app.get('/api/news', (req, res) => {
  const sql = 'SELECT * FROM news ORDER BY id DESC';
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว' });
    }
    res.json({
      success: true,
      data: results,
    });
  });
});

// ดึงข้อมูลข่าวรายตัวตาม id
app.get('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM news WHERE id = ?';
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข่าว' });
    }
    if (results.length > 0) {
      res.json({
        success: true,
        data: results[0],
      });
    } else {
      res.status(404).json({ success: false, message: 'ไม่พบข้อมูลข่าวที่ต้องการ' });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
