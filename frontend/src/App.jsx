import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { request } from './api';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BorrowPage from './pages/BorrowPage';

const emptyBook = { title: '', author: '', category: '', isbn: '', available: true };

function App() {
  return <BrowserRouter><LibraryApp /></BrowserRouter>;
}

function LibraryApp() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [book, setBook] = useState(emptyBook);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    const [nextBooks, nextMembers, nextBorrowings] = await Promise.all([
      request('/api/books'), request('/api/members'), request('/api/borrowings')
    ]);
    setBooks(nextBooks); setMembers(nextMembers); setBorrowings(nextBorrowings);
  };

  useEffect(() => { load().catch((error) => setNotice(error.message)); }, []);

  const submit = async (event, resource, value, reset) => {
    event.preventDefault();
    try { await request(`/api/${resource}`, { method: 'POST', body: JSON.stringify(value) }); reset(); setNotice('Saved successfully'); await load(); }
    catch (error) { setNotice(error.message); }
  };

  const remove = async (resource, id) => {
    try { await request(`/api/${resource}/${id}`, { method: 'DELETE' }); await load(); setNotice('Removed'); }
    catch (error) { setNotice(error.message); }
  };

  const returnBook = async (id) => {
    try { await request(`/api/borrowings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'returned', returnDate: new Date().toISOString() }) }); await load(); setNotice('Book returned'); }
    catch (error) { setNotice(error.message); }
  };

  const submitBorrowing = async (event, value, reset) => {
    event.preventDefault();
    try { await request('/api/borrowings', { method: 'POST', body: JSON.stringify(value) }); reset(); setNotice('Borrowing recorded'); await load(); }
    catch (error) { setNotice(error.message); }
  };

  return <main>
    <header className="topbar"><div className="brand"><span className="brand-mark">A</span><div><strong>ARCHIVE</strong><small>COLLEGE LIBRARY</small></div></div><div className="date">BOOKS · MEMBERS · LOANS</div></header>
    <Navigation />
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
    <Routes>
      <Route path="/" element={<HomePage books={books} members={members} borrowings={borrowings} onNavigate={navigate} onReturn={returnBook} />} />
      <Route path="/books" element={<BooksPage books={books} book={book} setBook={setBook} onSubmit={(event) => submit(event, 'books', book, () => setBook(emptyBook))} onRemove={(id) => remove('books', id)} />} />
      <Route path="/borrow" element={<BorrowPage books={books} members={members} borrowings={borrowings} onSubmit={submitBorrowing} onReturn={returnBook} />} />
    </Routes>
  </main>;
}

export default App;
