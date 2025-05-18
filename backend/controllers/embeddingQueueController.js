const pool = require('./db');
const axios = require('axios');

const runEmbeddingQueue = async () => {
  const { rows } = await pool.query(`SELECT id, content FROM forms WHERE embedding IS NULL LIMIT 5`);

  for (const form of rows) {
    try {
      const response = await axios.post(
        process.env.EMBEDDING_API,
        form.content.slice(0, 20000),
        { headers: { 'Content-Type': 'application/json' } }
      );

      const vector = JSON.stringify(response.data.embedding);
      await pool.query(`UPDATE forms SET embedding = $1::vector WHERE id = $2`, [vector, form.id]);

      console.log(`✅ Updated embedding for ID ${form.id}`);
    } catch (err) {
      console.error(`❌ Lỗi xử lý embedding ID ${form.id}:`, err.message);
    }
  }
};

setInterval(runEmbeddingQueue, 5000); // chạy mỗi 5 giây
