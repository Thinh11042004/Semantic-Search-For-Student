const pool = require('../db');
const fs = require('fs');
const path = require('path');

// ✅ Ghi log upload hoặc delete
const logUploadOrDelete = async (req, res) => {
  const { filename, status, user_id } = req.body;
  if (!filename || !status || !user_id) return res.status(400).json({ message: 'Thiếu thông tin' });
  try {
    const result = await pool.query(
      'INSERT INTO upload_logs (filename, status, user_id) VALUES ($1, $2, $3) RETURNING *',
      [filename, status, user_id]
    );
    res.status(201).json({ message: 'Đã ghi log', log: result.rows[0] });
  } catch (err) {
    console.error('❌ Ghi log thất bại:', err);
    res.status(500).json({ message: 'Ghi log thất bại' });
  }
};

// ✅ Lấy lịch sử upload/delete cho admin
const getAdminHistoryLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH uploads AS (
        SELECT ul.id, ul.filename, ul.created_at AS upload_date, u.name AS user_name,
               (SELECT MAX(created_at) FROM upload_logs d WHERE d.filename = ul.filename AND d.status = 'delete') AS delete_date,
               (SELECT name FROM users du WHERE du.id = (SELECT user_id FROM upload_logs d WHERE d.filename = ul.filename AND d.status = 'delete' LIMIT 1)) AS deleted_by,
               CASE
                 WHEN EXISTS (
                   SELECT 1 FROM upload_logs d WHERE d.filename = ul.filename AND d.status = 'delete'
                 ) THEN 'deleted'
                 ELSE 'upload'
               END AS status
        FROM upload_logs ul
        JOIN users u ON ul.user_id = u.id
        WHERE ul.status = 'upload'
      )
      SELECT * FROM uploads
      ORDER BY upload_date DESC;
    `);
    res.json({ uploads: result.rows });
  } catch (err) {
    console.error('❌ Lỗi khi lấy log admin:', err);
    res.status(500).json({ message: 'Lỗi khi lấy log admin' });
  }
};

// ✅ Xoá file + ghi log
const deleteFiles = async (req, res) => {
  const { ids, user_id } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !user_id) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT id, file_path, title FROM forms WHERE id = ANY($1)',
      [ids]
    );
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const file of rows) {
        const fullPath = path.join(__dirname, '..', 'uploads', file.file_path);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        await client.query('DELETE FROM forms WHERE id = $1', [file.id]);
        await client.query(
          'INSERT INTO upload_logs (filename, status, user_id) VALUES ($1, $2, $3)',
          [file.title, 'delete', user_id]
        );
      }
      await client.query('COMMIT');
      res.json({ message: 'Đã xoá và ghi log' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Rollback do lỗi:', err);
      res.status(500).json({ error: 'Xoá thất bại' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Lỗi xoá file:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Ghi log khi người dùng tải file
const logDownload = async (req, res) => {
  const { filename, user_id } = req.body;

  if (!filename || !user_id) {
    return res.status(400).json({ error: 'Thiếu filename hoặc user_id' });
  }

  try {
    await pool.query(
      'INSERT INTO download_logs (filename, user_id) VALUES ($1, $2)',
      [filename, user_id]
    );
    res.status(201).json({ message: 'Đã ghi log tải xuống' });
  } catch (err) {
    console.error('Lỗi ghi log tải xuống:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi ghi log download' });
  }
};

// ✅ Lấy danh sách file người dùng đã tải
const getDownloadHistory = async (req, res) => {
  const { user_id } = req.body;

  console.log('✅ Nhận user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ message: 'Thiếu user_id' });
  }

  try {
    const result = await pool.query(
      `SELECT id, filename, downloaded_at AS date
       FROM download_logs
       WHERE user_id = $1
       ORDER BY downloaded_at DESC`,
      [user_id]
    );

    res.json({ downloads: result.rows });
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử tải:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


module.exports = {
  logUploadOrDelete,
  getAdminHistoryLogs,
  deleteFiles,
  logDownload,
  getDownloadHistory
};
