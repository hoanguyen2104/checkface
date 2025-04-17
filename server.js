const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Endpoint upload ảnh
app.post('/upload', (req, res) => {
  const { image, condition } = req.body;
  res.json({ message: 'Ảnh đã được nhận', condition });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});