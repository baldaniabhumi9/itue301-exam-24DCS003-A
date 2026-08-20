import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { request } from './api';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BorrowPage from './pages/BorrowPage';

function App() {
  return <BrowserRouter><LibraryApp /></BrowserRouter>;
}

function LibraryApp() {
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    const [nextBooks, nextBorrowings] = await Promise.all([
      request('/api/v1/books'), request('/api/v1/borrowings')
    ]);
    setBooks(nextBooks); setBorrowings(nextBorrowings);
  };

  useEffect(() => { load().catch((error) => setNotice(error.message)); }, []);

  const returnBook = async (id) => {
    try { await request(`/api/v1/borrowings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'returned', returnDate: new Date().toISOString() }) }); await load(); setNotice('Book returned'); }
    catch (error) { setNotice(error.message); }
  };

  const submitBorrowing = async (event, value, reset) => {
    event.preventDefault();
    try { await request('/api/v1/borrowings', { method: 'POST', body: JSON.stringify(value) }); reset(); setNotice('Borrowing recorded'); await load(); }
    catch (error) { setNotice(error.message); }
  };

  const members = [...new Set(borrowings.map((item) => item.memberName))].filter(Boolean).map((name) => ({ name }));

  return <main>
    <header className="topbar"><div className="brand"><span className="brand-mark">A</span><div><strong>ARCHIVE</strong><small>COLLEGE LIBRARY</small></div></div><div className="date">BOOKS · MEMBERS · LOANS</div></header>
    <Navigation />
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
    <Routes>
      <Route path="/" element={<HomePage books={books} members={members} borrowings={borrowings} onNavigate={navigate} onReturn={returnBook} />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/borrow" element={<BorrowPage books={books} borrowings={borrowings} onSubmit={submitBorrowing} onReturn={returnBook} />} />
    </Routes>
  </main>;
}

export default App;
