export default function HomePage({ books, members, borrowings, onNavigate, onReturn }) {
  const activeLoans = borrowings.filter((item) => item.status !== 'returned');
  return (
    <>
      <section className="intro"><div><p className="eyebrow">LIBRARY OPERATIONS / 2026</p><h1>Everything in its<br /><em>right place.</em></h1><p className="lede">A calm, clear command center for the collection and the people who keep it moving.</p></div><div className="stats"><div><b>{books.length}</b><span>Titles</span></div><div><b>{members.length}</b><span>Members</span></div><div><b>{activeLoans.length}</b><span>Out now</span></div></div></section>
      <section className="dashboard"><div className="panel feature"><div><p className="eyebrow">CURRENT CIRCULATION</p><h2>Books on the move</h2></div>{activeLoans.slice(0, 4).map((item) => <div className="loan" key={item._id}><span className="book-spine">{item.bookId?.title?.slice(0, 1) || '?'}</span><div><strong>{item.bookId?.title || 'Unknown book'}</strong><small>{item.memberId?.name || 'Unknown member'} · {item.status}</small></div>{item.status === 'borrowed' && <button className="small-action" onClick={() => onReturn(item._id)}>Return</button>}</div>)}{!activeLoans.length && <p className="muted">No borrowing records yet.</p>}</div><div className="panel quick"><p className="eyebrow">QUICK ADD</p><h2>New record</h2><button onClick={() => onNavigate('/books')}>＋ Book</button><button onClick={() => onNavigate('/borrow')}>＋ Borrowing</button></div></section>
    </>
  );
}
