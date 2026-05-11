import { Link, useLocation } from "react-router-dom";

/**
 * Navbar — Editorial monochrome navigation.
 * Thick 4px bottom border. Brand mark prefix. Mono-type links.
 */
function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Brand — editorial style with thick left mark (via ::before) */}
        <Link to="/" className="navbar__brand" aria-label="ProductHub home">
          ProductHub
        </Link>

        <nav className="navbar__links" aria-label="Primary navigation">
          <Link
            to="/"
            id="nav-home"
            className={`navbar__link ${pathname === "/" ? "navbar__link--active" : ""}`}
          >
            Catalogue
          </Link>
          <Link
            to="/add"
            id="nav-add"
            className={`navbar__link navbar__link--cta ${pathname === "/add" ? "navbar__link--active" : ""}`}
          >
            + New Product
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
