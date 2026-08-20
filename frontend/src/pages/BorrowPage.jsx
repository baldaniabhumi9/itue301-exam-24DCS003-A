import { useState } from 'react';

const initialForm = { memberId: '', bookId: '', borrowDate: '', returnDate: '' };

export default function BorrowPage({ books, members, borrowings, onSubmit, onReturn }) {
  const [form, setForm] = useState(initialForm);
  const selectedBook = books.find((book) => book._id === form.bookId);
  const selectedMember = members.find((member) => member._id === form.memberId);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    const payload = {
      bookId: form.bookId,
      memberId: form.memberId,
      borrowDate: form.borrowDate ? new Date(`${form.borrowDate}T00:00:00`).toISOString() : undefined,
      returnDate: form.returnDate ? new Date(`${form.returnDate}T00:00:00`).toISOString() : undefined
    };
    onSubmit(event, payload, () => setForm(initialForm));
  };

  return <section className="panel workspace"><div className="section-heading"><div><p className="eyebrow">CIRCULATION DESK</p><h2>Record a borrowing</h2></div></div><form className="borrow-form" onSubmit={handleSubmit}><label><span>Book title</span><select name="bookId" value={form.bookId} onChange={updateField} required><option value="">Select a book</option>{books.filter((item) => item.available).map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></label><label><span>Member name</span><select name="memberId" value={form.memberId} onChange={updateField} required><option value="">Select a member</option>{members.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><label><span>Borrow date</span><input name="borrowDate" type="date" value={form.borrowDate} onChange={updateField} required /></label><label><span>Return date</span><input name="returnDate" type="date" value={form.returnDate} onChange={updateField} /></label><button className="submit">Check out</button></form>{(selectedBook || selectedMember || form.borrowDate) && <p className="borrow-preview">{selectedMember?.name || 'A member'} is borrowing {selectedBook?.title || 'a book'}{form.borrowDate ? ` on ${form.borrowDate}` : ''}.</p>}<div className="table-wrap"><table><thead><tr><th>Book</th><th>Member</th><th>Borrowed</th><th>Status</th><th /></tr></thead><tbody>{borrowings.map((item) => <tr key={item._id}><td>{item.bookId?.title}</td><td>{item.memberId?.name}</td><td>{new Date(item.borrowDate).toLocaleDateString()}</td><td><span className={`status ${item.status}`}>{item.status}</span></td><td>{item.status !== 'returned' && <button className="text-action" onClick={() => onReturn(item._id)}>Return</button>}</td></tr>)}</tbody></table></div></section>;
}
