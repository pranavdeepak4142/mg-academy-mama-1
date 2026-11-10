const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Frontend static assets path (MG-academy-main root or ../frontend)
let frontendPath = __dirname;
if (fs.existsSync(path.join(__dirname, '../frontend/index.html'))) {
  frontendPath = path.join(__dirname, '../frontend');
}

app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.'
  });
});

app.listen(PORT, () => {
  console.log(`MG ACADEMY server running on http://localhost:${PORT}`);
  console.log(`- Website: http://localhost:${PORT}/`);
  console.log(`- Admin:   http://localhost:${PORT}/admin`);
});
