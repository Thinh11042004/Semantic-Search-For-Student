const pool = require('../db');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');

const MAX_TEXT_LENGTH = 5000;
const EMBEDDING_API = 'http://localhost:8000/get-embedding';

// Hàm trích xuất nội dung từ file
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.promises.readFile(filePath);

  try {
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (ext === '.pdf') {
      const result = await pdf(buffer);
      return result.text;
    } else if (ext === '.xlsx') {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return xlsx.utils.sheet_to_csv(sheet);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (err) {
    throw new Error(`Error extracting file content: ${err.message}`);
  }
};

// Upload form
const uploadForm = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const title = req.file.originalname;

    const content = await extractTextFromFile(filePath);
    const truncated = content.slice(0, MAX_TEXT_LENGTH);

    let embed;
    try {
      embed = await axios.post(EMBEDDING_API, { text: truncated });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to connect to embedding API', details: e.message });
    }

    if (!embed.data || !Array.isArray(embed.data.embedding)) {
      return res.status(500).json({ error: 'Invalid embedding response' });
    }

    const vector = JSON.stringify(embed.data.embedding);

    const result = await pool.query(
      'INSERT INTO forms (title, file_path, embedding) VALUES ($1, $2, $3::vector) RETURNING *',
      [title, filePath, vector]
    );

    // Xóa file sau khi upload thành công
    fs.unlink(filePath, (err) => {
      if (err) console.warn('Could not delete uploaded file:', err.message);
    });

    res.status(201).json({ message: 'Uploaded', form: result.rows[0] });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};

// Get all forms
const getForms = async (req, res) => {
  try {
    console.log("GET /api/forms hit"); 
    const result = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('getForms error:', err);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
};

// Get embedding
const getEmbedding = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const result = await axios.post(EMBEDDING_API, { text });
    if (!result.data || !Array.isArray(result.data.embedding)) {
      return res.status(500).json({ error: 'Invalid embedding response' });
    }

    res.json({ embedding: result.data.embedding });
  } catch (err) {
    console.error('Embedding error:', err);
    res.status(500).json({ error: 'Failed to get embedding', details: err.message });
  }
};

// Semantic search
const searchForms = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const result = await axios.post(EMBEDDING_API, { text: query });
    if (!result.data || !Array.isArray(result.data.embedding)) {
      return res.status(500).json({ error: 'Invalid embedding response' });
    }

    const embedding = JSON.stringify(result.data.embedding);

    const dbRes = await pool.query(
      'SELECT title, file_path FROM forms ORDER BY embedding <=> $1::vector LIMIT 5',
      [embedding]
    );

    res.json({ query, results: dbRes.rows });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

module.exports = {
  uploadForm,
  getForms,
  getEmbedding,
  searchForms
};
