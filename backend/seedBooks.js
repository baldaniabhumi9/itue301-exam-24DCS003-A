const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const books = [
  { title: 'The Design of Everyday Things', author: 'Don Norman', category: 'Design', isbn: '9780465050659', available: true },
  { title: "A Room of One's Own", author: 'Virginia Woolf', category: 'Literature', isbn: '9780156787338', available: true },
  { title: 'The Little Prince', author: 'Antoine de Saint-Exupery', category: 'Fiction', isbn: '9780156012195', available: true },
  { title: 'Atomic Habits', author: 'James Clear', category: 'Self Development', isbn: '9780735211292', available: true },
  { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', isbn: '9780062316097', available: true },
  { title: 'The Pragmatic Programmer', author: 'David Thomas', category: 'Technology', isbn: '9780135957059', available: true },
  { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Classic', isbn: '9780141439518', available: false },
  { title: 'Educated', author: 'Tara Westover', category: 'Memoir', isbn: '9780399590504', available: true },
  { title: '1984', author: 'George Orwell', category: 'Dystopian', isbn: '9780451524935', available: false },
  { title: 'The Alchemist', author: 'Paulo Coelho', category: 'Fiction', isbn: '9780062315007', available: true }
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);
  await Book.deleteMany({});
  await Book.insertMany(books);
  console.log(`Seeded ${books.length} books into library_management.books`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
