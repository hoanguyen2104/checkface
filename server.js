const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Endpoint upload ảnh
app.post('/upload', (req, res) => {
  const { image, condition } = req.body;
  
  // Lưu ảnh vào thư mục public/uploads
  const imageName = `image_${Date.now()}.jpg`;
  const imagePath = path.join(uploadDir, imageName);
  const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
  
  fs.writeFile(imagePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error('Lỗi lưu ảnh:', err);
      return res.status(500).json({ error: 'Lỗi lưu ảnh' });
    }
    
    res.json({ message: 'Ảnh đã được nhận', condition, imageUrl: `/uploads/${imageName}` });
  });
});

// Endpoint lấy danh sách hình ảnh
app.get('/images', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Lỗi đọc thư mục uploads:', err);
      return res.status(500).json({ error: 'Lỗi đọc danh sách hình ảnh' });
    }
    
    // Lọc các file ảnh (jpg, png, v.v.)
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/.test(file));
    const imageList = imageFiles.map(file => ({
      url: `/uploads/${file}`,
      name: file
    }));
    
    res.json({ images: imageList });
  });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});