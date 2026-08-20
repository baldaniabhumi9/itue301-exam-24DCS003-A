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
const apiBooks = [
  { id: 'book-1', title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', isbn: '9780465050659', available: true },
  { id: 'book-2', title: 'A Room of One\'s Own', author: 'Virginia Woolf', category: 'Literature', isbn: '9780156787338', available: true },
  { id: 'book-3', title: 'The Little Prince', author: 'Antoine de Saint-Exupery', category: 'Fiction', isbn: '9780156012195', available: true },
  { id: 'book-4', title: 'Atomic Habits', author: 'James Clear', category: 'Self Development', isbn: '9780735211292', available: true },
  { id: 'book-5', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', available: true },
  { id: 'book-6', title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Technology', isbn: '9780135957059', available: true },
  { id: 'book-7', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Classic', isbn: '9780141439518', available: false, description: 'A sharp, funny romance about first impressions, family, and finding an equal.' },
  { id: 'book-8', title: 'Educated', author: 'Tara Westover', category: 'Memoir', isbn: '9780399590504', available: true, description: 'A powerful memoir about education, identity, and building a life beyond expectations.' },
  { id: 'book-9', title: '1984', author: 'George Orwell', category: 'Dystopian', isbn: '9780451524935', available: false, description: 'A haunting vision of surveillance, truth, and one person resisting total control.' },
  { id: 'book-10', title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', isbn: '9780062315007', available: true, description: 'An uplifting fable about following a dream and noticing the wisdom along the way.' }
];
const apiBorrowings = [];

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} [${new Date().toISOString()}]`);
  next();
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const models = { books: Book, members: Member };

app.get('/api/health', (req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 }));

app.get('/api/mongo/summary', asyncRoute(async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ success: false, error: { status: 503, message: 'MongoDB is not connected' } });
  const [books, members, borrowings] = await Promise.all([
    Book.countDocuments(),
    Member.countDocuments(),
    Borrowing.countDocuments()
  ]);
  res.status(200).json({ success: true, collections: { books, members, borrowings } });
}));

app.get('/api/v1/borrowings', (req, res) => {
  res.status(200).json(apiBorrowings);
});

app.post('/api/v1/borrowings', (req, res, next) => {
  try {
    const { memberId, memberName, bookId, borrowDate, returnDate, status = 'borrowed' } = req.body;
    const book = apiBooks.find((item) => item.id === bookId);
    if (!memberId || !bookId || !borrowDate || !['borrowed', 'returned', 'overdue'].includes(status)) {
      const error = new Error('member name, book, borrow date, and a valid status are required');
      error.status = 400;
      throw error;
    }
    if (!book) {
      const error = new Error('Book not found');
      error.status = 404;
      throw error;
    }
    if (!book.available) {
      const error = new Error('Book is currently unavailable');
      error.status = 409;
      throw error;
    }

    const borrowing = { id: `borrowing-${apiBorrowings.length + 1}`, memberId, memberName: memberName || memberId, bookId, bookTitle: book.title, borrowDate, returnDate: returnDate || null, status };
    apiBorrowings.push(borrowing);
    book.available = false;
    res.status(201).json(borrowing);
  } catch (error) {
    next(error);
  }
});

app.put('/api/v1/borrowings/:id', (req, res, next) => {
  try {
    const borrowing = apiBorrowings.find((item) => item.id === req.params.id);
    if (!borrowing) {
      const error = new Error('Borrowing not found');
      error.status = 404;
      throw error;
    }
    borrowing.status = req.body.status || 'returned';
    borrowing.returnDate = req.body.returnDate || new Date().toISOString();
    const book = apiBooks.find((item) => item.id === borrowing.bookId);
    if (book) book.available = true;
    res.status(200).json(borrowing);
  } catch (error) {
    next(error);
  }
});

app.get('/api/v1/books', (req, res) => {
  res.status(200).json(apiBooks);
});

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
  const statusCode = error.status || (error.code === 11000 ? 409 : error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  const message = statusCode === 500 ? 'Internal server error' : error.message;
  console.error(error);
  res.status(statusCode).json({ success: false, error: { status: statusCode, message } });
});

app.listen(port, () => console.log(`Library API listening on port ${port}`));

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection failed:', error.message));
} else {
  console.warn('MONGODB_URI is not set; API started without a database connection.');
}
