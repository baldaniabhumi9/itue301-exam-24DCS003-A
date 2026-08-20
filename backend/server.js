const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Member = require('./models/Member');
const Borrowing = require('./models/Borrowing');

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const models = { books: Book, members: Member };

app.get('/api/health', (req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 }));

for (const [resource, Model] of Object.entries(models)) {
  app.get(`/api/${resource}`, asyncRoute(async (req, res) => {
    res.json(await Model.find().sort({ createdAt: -1 }));
  }));

  app.post(`/api/${resource}`, asyncRoute(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(item);
  }));

  app.put(`/api/${resource}/:id`, asyncRoute(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: `${resource.slice(0, -1)} not found` });
    res.json(item);
  }));

  app.delete(`/api/${resource}/:id`, asyncRoute(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: `${resource.slice(0, -1)} not found` });
    res.status(204).end();
  }));
}

app.get('/api/borrowings', asyncRoute(async (req, res) => {
  res.json(await Borrowing.find().populate('bookId').populate('memberId').sort({ createdAt: -1 }));
}));

app.post('/api/borrowings', asyncRoute(async (req, res) => {
  const { bookId, memberId } = req.body;
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!book.available) return res.status(409).json({ message: 'Book is currently unavailable' });
  if (!(await Member.exists({ _id: memberId }))) return res.status(404).json({ message: 'Member not found' });

  const borrowing = await Borrowing.create(req.body);
  await Book.findByIdAndUpdate(bookId, { available: false });
  res.status(201).json(await borrowing.populate(['bookId', 'memberId']));
}));

app.put('/api/borrowings/:id', asyncRoute(async (req, res) => {
  const existing = await Borrowing.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Borrowing not found' });
  const borrowing = await Borrowing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (req.body.status === 'returned') await Book.findByIdAndUpdate(existing.bookId, { available: true });
  res.json(await borrowing.populate(['bookId', 'memberId']));
}));

app.delete('/api/borrowings/:id', asyncRoute(async (req, res) => {
  const borrowing = await Borrowing.findByIdAndDelete(req.params.id);
  if (!borrowing) return res.status(404).json({ message: 'Borrowing not found' });
  if (borrowing.status === 'borrowed') await Book.findByIdAndUpdate(borrowing.bookId, { available: true });
  res.status(204).end();
}));

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

app.use((error, req, res, next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'A record with that unique value already exists' });
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => console.log(`Library API listening on port ${port}`));

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection failed:', error.message));
} else {
  console.warn('MONGODB_URI is not set; API started without a database connection.');
}
