import { useEffect, useState } from 'react';
import BookCard from '../components/BookCard';

export default function BooksPage() {
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

  return <section className="books-page"><div className="section-heading"><div><p className="eyebrow">COLLECTION / BOOKS</p><h2>The collection</h2></div><span className="count">{data.length} titles · {data.filter((item) => !item.available).length} unavailable</span></div><div className="book-grid">{loading && <p className="loading-message">Loading books...</p>}{error && <p className="error-message">{error}</p>}{!loading && !error && data.map((item) => <div className="book-card-wrap" key={item.id}><BookCard title={item.title} author={item.author} category={item.category} available={item.available} description={item.description} /></div>)}{!loading && !error && !data.length && <p className="muted">No books found.</p>}</div></section>;
}
