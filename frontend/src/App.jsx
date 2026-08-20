import { useEffect, useState } from 'react';
import { request } from './api';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BorrowPage from './pages/BorrowPage';

const emptyBook = { title: '', author: '', category: '', isbn: '', available: true };

function App() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [page, setPage] = useState('home');
  const [book, setBook] = useState(emptyBook);
  const [borrow, setBorrow] = useState({ bookId: '', memberId: '' });
  const [notice, setNotice] = useState('');

  const load = async () => {
    const [nextBooks, nextMembers, nextBorrowings] = await Promise.all([
      request('/api/books'), request('/api/members'), request('/api/borrowings')
    ]);
    setBooks(nextBooks); setMembers(nextMembers); setBorrowings(nextBorrowings);
    setBorrow((current) => ({ bookId: current.bookId || nextBooks.find((item) => item.available)?._id || '', memberId: current.memberId || nextMembers[0]?._id || '' }));
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

  return <main>
    <header className="topbar"><div className="brand"><span className="brand-mark">A</span><div><strong>ARCHIVE</strong><small>COLLEGE LIBRARY</small></div></div><div className="date">BOOKS · MEMBERS · LOANS</div></header>
    <nav className="tabs">{[['home', 'Overview'], ['books', 'Books'], ['borrow', 'Borrowing']].map(([key, label]) => <button className={page === key ? 'active' : ''} onClick={() => setPage(key)} key={key}>{label}</button>)}</nav>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
    {page === 'home' && <HomePage books={books} members={members} borrowings={borrowings} onNavigate={setPage} onReturn={returnBook} />}
    {page === 'books' && <BooksPage books={books} book={book} setBook={setBook} onSubmit={(event) => submit(event, 'books', book, () => setBook(emptyBook))} onRemove={(id) => remove('books', id)} />}
    {page === 'borrow' && <BorrowPage books={books} members={members} borrow={borrow} setBorrow={setBorrow} borrowings={borrowings} onSubmit={(event) => submit(event, 'borrowings', borrow, () => setBorrow({ bookId: '', memberId: '' }))} onReturn={returnBook} />}
  </main>;
}

export default App;
