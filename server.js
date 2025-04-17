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

// Tạo file images.json nếu chưa tồn tại
const imagesJsonPath = path.join(__dirname, 'public', 'images.json');
if (!fs.existsSync(imagesJsonPath)) {
  fs.writeFileSync(imagesJsonPath, JSON.stringify({ images: [] }));
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

    // Lưu thông tin ảnh và tình trạng vào images.json
    const imageUrl = `/uploads/${imageName}`;
    const imageData = { url: imageUrl, name: imageName, condition };

    // Đọc file images.json hiện tại
    fs.readFile(imagesJsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Lỗi đọc images.json:', err);
        return res.status(500).json({ error: 'Lỗi lưu thông tin ảnh' });
      }

      const jsonData = JSON.parse(data);
      jsonData.images.push(imageData);

      // Ghi lại file images.json
      fs.writeFile(imagesJsonPath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error('Lỗi ghi images.json:', err);
          return res.status(500).json({ error: 'Lỗi lưu thông tin ảnh' });
        }

        res.json({ message: 'Ảnh đã được nhận', condition, imageUrl });
      });
    });
  });
});

// Endpoint lấy danh sách hình ảnh
app.get('/images', (req, res) => {
  fs.readFile(imagesJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Lỗi đọc images.json:', err);
      return res.status(500).json({ error: 'Lỗi đọc danh sách hình ảnh' });
    }

    const jsonData = JSON.parse(data);
    res.json(jsonData);
  });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});