const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Endpoint nhận ảnh và trả về cảm xúc
app.post('/detect-emotion', (req, res) => {
  const { image } = req.body;

  // Lưu ảnh tạm thời
  const imagePath = path.join(__dirname, 'temp_image.jpg');
  const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
  fs.writeFileSync(imagePath, base64Data, 'base64');

  // Gọi script Python chạy DeepFace
  const pythonProcess = spawn('python3', ['detect_emotion.py', imagePath]);

  let emotionData = '';
  pythonProcess.stdout.on('data', (data) => {
    emotionData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Lỗi DeepFace:', data.toString());
  });

  pythonProcess.on('close', (code) => {
    fs.unlinkSync(imagePath); // Xóa ảnh tạm
    if (code === 0) {
      try {
        const result = JSON.parse(emotionData);
        res.json({ emotion: result.emotion });
      } catch (err) {
        res.status(500).json({ error: 'Lỗi phân tích cảm xúc' });
      }
    } else {
      res.status(500).json({ error: 'Lỗi xử lý DeepFace' });
    }
  });
});

// Endpoint upload ảnh (giữ nguyên)
app.post('/upload', (req, res) => {
  const { image, condition } = req.body;
  res.json({ message: 'Ảnh đã được nhận', condition });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});