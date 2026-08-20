import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Overview' },
  { to: '/books', label: 'Books' },
  { to: '/borrow', label: 'Borrowing' }
];

export default function Navigation() {
  return (
    <nav className="tabs" aria-label="Main navigation">
      {links.map(({ to, label }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
