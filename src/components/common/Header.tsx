import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className="masthead">
      <div className="container masthead__row">
        <p className="masthead__title">
          Docket <span>— verify before you trust</span>
        </p>
        <nav className="masthead__nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Check
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
            History
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
