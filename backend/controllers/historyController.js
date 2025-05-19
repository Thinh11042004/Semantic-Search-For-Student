const pool = require('../db');
const fs = require('fs');
const path = require('path');

// ✅ Ghi log upload hoặc delete
const logUploadOrDelete = async (req, res) => {
  const { filename, status, user_id, formId } = req.body;
  if (!filename || !status || !user_id || !formId) return res.status(400).json({ message: 'Thiếu thông tin' });
  try {
    const result = await pool.query(
      `INSERT INTO upload_logs (filename, status, user_id, form_id) VALUES ($1, $2, $3, $4)`,
      [filename, status, user_id, formId] 
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
      SELECT 
        u.id,      
        u.form_id,
        u.filename,
        u.upload_date,
        u.user_name,
        d.delete_date,
        d.deleted_by,
        CASE 
          WHEN d.delete_date IS NOT NULL THEN 'deleted'
          ELSE 'upload'
        END AS status
      FROM (
        SELECT 
          ul.id,  
          ul.form_id,
          ul.filename,
          ul.created_at AS upload_date,
          us.name AS user_name
        FROM upload_logs ul
        JOIN users us ON ul.user_id = us.id
        WHERE ul.status = 'upload'
      ) u
      LEFT JOIN (
        SELECT 
          ul.form_id,
          ul.created_at AS delete_date,
          us.name AS deleted_by
        FROM upload_logs ul
        JOIN users us ON ul.user_id = us.id
        WHERE ul.status = 'delete'
      ) d ON u.form_id = d.form_id
      ORDER BY u.upload_date DESC;
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
    return res.status(400).json({ error: 'Thiếu danh sách ID hoặc user_id' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, file_path, title FROM forms WHERE id = ANY($1::int[])`,
      [ids]
    );

    if (rows.length === 0) {
      console.warn('❗ Không tìm thấy file phù hợp với ID:', ids);
      return res.status(404).json({ error: 'Không tìm thấy file để xóa' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const file of rows) {
        console.log('\n🗂️ File cần xóa:');
        console.log('→ file.file_path =', file.file_path);

        const fileNameOnly = path.basename(file.file_path); // loại bỏ mọi folder
        const fullPath = path.resolve(__dirname, '..', 'uploads', fileNameOnly);

        console.log('→ FullPath =', fullPath);
        const exists = fs.existsSync(fullPath);
        console.log('→ Tồn tại?', exists);

        try {
          if (exists) {
            await fs.promises.unlink(fullPath);
            console.log('✅ Đã xoá file vật lý:', fullPath);
          } else {
            console.warn('⚠️ File không tồn tại để xoá:', fullPath);
          }
        } catch (fsErr) {
          console.error('❌ Lỗi khi xoá file:', fsErr.message);
          throw fsErr;
        }

        await client.query('DELETE FROM forms WHERE id = $1', [file.id]);

        await client.query(
          'INSERT INTO upload_logs (filename, status, user_id, form_id) VALUES ($1, $2, $3, $4)',
          [file.title, 'delete', user_id, file.id]
        );
        
      }

      await client.query('COMMIT');
      return res.json({ message: `✅ Đã xoá ${rows.length} file và ghi log` });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('❌ Lỗi trong transaction:', e.message);
      return res.status(500).json({ error: 'Lỗi khi xóa file' });
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('❌ Lỗi khi xử lý xóa:', err.message);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};


module.exports = {
  logUploadOrDelete,
  getAdminHistoryLogs,
  deleteFiles,
};