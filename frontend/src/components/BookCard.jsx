export default function BookCard({ title, author, category, available }) {
  return (
    <article className="book-card">
      <div className="book-card__cover"><span>{title.slice(0, 1).toUpperCase()}</span></div>
      <div className="book-card__body">
        <div className="book-card__category">{category}</div>
        <h3>{title}</h3>
        <p>{author}</p>
        <div className={`availability ${available ? 'is-available' : 'is-unavailable'}`}>
          <span className="availability__dot" />
          {available ? 'Available' : 'Not Available'}
        </div>
      </div>
    </article>
  );
}
