const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// Đảm bảo thư mục uploads tồn tại
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Lỗi khi tạo thư mục uploads:', err);
  }
}
ensureUploadDir();

// Upload endpoint
app.post('/upload', async (req, res) => {
  try {
    const { image, condition } = req.body;
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
    const filename = `image_${Date.now()}.jpg`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filePath, base64Data, 'base64');

    // Lưu metadata (tình trạng) vào file JSON
    const metadataPath = path.join(UPLOAD_DIR, 'metadata.json');
    let metadata = [];
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(data);
    } catch (err) {
      // File chưa tồn tại
    }
    metadata.push({ filename, condition });
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({ message: 'Tải ảnh lên thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Tải ảnh lên thất bại: ' + err.message });
  }
});

// Get images endpoint
app.get('/images', async (req, res) => {
  try {
    const metadataPath = path.join(UPLOAD_DIR, 'metadata.json');
    let metadata = [];
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(data);
    } catch (err) {
      // File chưa tồn tại
    }
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ message: 'Lấy danh sách ảnh thất bại: ' + err.message });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});