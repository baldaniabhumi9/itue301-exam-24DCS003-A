import { useEffect, useState } from 'react';
import BookCard from '../components/BookCard';
import Field from '../components/Field';

export default function BooksPage({ book, setBook, onSubmit }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadBooks = async () => {
      try {
        const response = await fetch('/api/v1/books');
        if (!response.ok) throw new Error('Unable to load books');
        const books = await response.json();
        if (isMounted) setData(books);
      } catch (requestError) {
        if (isMounted) setError(requestError.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBooks();
    return () => { isMounted = false; };
  }, []);

  return <section className="books-page"><div className="section-heading"><div><p className="eyebrow">COLLECTION / BOOKS</p><h2>The collection</h2></div><span className="count">{data.length} titles</span></div><div className="books-layout"><div className="book-grid">{loading && <p className="loading-message">Loading books...</p>}{error && <p className="error-message">{error}</p>}{!loading && !error && data.map((item) => <div className="book-card-wrap" key={item.id}><BookCard title={item.title} author={item.author} category={item.category} available={item.available} /></div>)}{!loading && !error && !data.length && <p className="muted">No books found.</p>}</div><div className="form-card"><p className="eyebrow">ADD TO COLLECTION</p><form onSubmit={onSubmit}><Field label="Title" name="title" value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} /><Field label="Author" name="author" value={book.author} onChange={(e) => setBook({ ...book, author: e.target.value })} /><Field label="Category" name="category" value={book.category} onChange={(e) => setBook({ ...book, category: e.target.value })} /><Field label="ISBN" name="isbn" value={book.isbn} onChange={(e) => setBook({ ...book, isbn: e.target.value })} /><button className="submit">Add book</button></form></div></div></section>;
}
