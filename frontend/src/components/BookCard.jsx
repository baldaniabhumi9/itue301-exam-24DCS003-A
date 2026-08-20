export default function BookCard({ title, author, category, available, description }) {
  return (
    <article className="book-card" tabIndex="0" aria-label={`${title} by ${author}`}>
      <div className="book-card__inner">
        <div className="book-card__face book-card__front">
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
        </div>
        <div className="book-card__face book-card__back">
          <div className="book-card__category">ABOUT THIS BOOK</div>
          <h3>{title}</h3>
          <p>{description || `A memorable ${category.toLowerCase()} read by ${author}.`}</p>
          <div className={`availability ${available ? 'is-available' : 'is-unavailable'}`}>
            <span className="availability__dot" />
            {available ? 'Available to borrow' : 'Currently unavailable'}
          </div>
        </div>
      </div>
    </article>
  );
}
