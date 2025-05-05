const bcrypt = require('bcrypt');
const pool = require('../db');



// Đăng ký người dùng mới
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tên người dùng, Email và mật khẩu là bắt buộc' });
    }
  
    try {
      // Kiểm tra email đã tồn tại chưa
      const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (checkUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email đã được sử dụng' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Lưu vào database
      const newUser = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      );
  
      res.status(201).json({ message: 'Đăng ký thành công', user: newUser.rows[0] });
    }  catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ error: 'Lỗi server', details: error.message });
      }
      
};




const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email và mật khẩu không được để trống.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email không tồn tại.' });
    }

    const user = result.rows[0];

    // Nếu dùng bcrypt để hash password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không đúng.' });
    }

    // Thành công
    return res.status(200).json({ success: true, message: 'Đăng nhập thành công.' });

  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

module.exports = {
  registerUser,
  loginUser 
};
