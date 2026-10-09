import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isLoggedIn, logoutUser } = useAuth();

  // Controls whether the mobile menu is open.
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logoutUser();
    window.location.href = "/login";
  }

  // Shared styles for navigation links.
  const linkClass = ({ isActive }) =>
    `block whitespace-nowrap transition hover:text-orange-500 ${
      isActive ? "font-semibold text-orange-500" : "text-white"
    }`;

  // Close the mobile menu after selecting a link.
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="bg-zinc-900 px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="shrink-0 text-xl font-bold sm:text-2xl"
        >
          Campus<span className="text-orange-500">Connect</span>
        </Link>

        {/* Desktop navigation: visible on medium and larger screens */}
        <div className="hidden items-center gap-5 lg:flex xl:gap-6">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/saved-items" className={linkClass}>
                Saved Items
              </NavLink>

              <NavLink to="/sell" className={linkClass}>
                Sell Item
              </NavLink>

              <NavLink to="/my-listings" className={linkClass}>
                My Listings
              </NavLink>

              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                className="whitespace-nowrap transition hover:text-orange-500"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          )}
        </div>

        {/* Hamburger button: visible on mobile and tablet */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 transition hover:border-orange-500 hover:text-orange-500 lg:hidden"
        >
          {menuOpen ? (
            // Close icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mx-auto mt-4 max-w-6xl space-y-1 border-t border-zinc-800 pt-3 lg:hidden">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="block rounded-lg px-3 py-3 transition hover:bg-zinc-800 hover:text-orange-500"
          >
            Home
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink
                to="/saved-items"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 transition hover:bg-zinc-800 hover:text-orange-500"
              >
                Saved Items
              </NavLink>

              <NavLink
                to="/sell"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 transition hover:bg-zinc-800 hover:text-orange-500"
              >
                Sell Item
              </NavLink>

              <NavLink
                to="/my-listings"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 transition hover:bg-zinc-800 hover:text-orange-500"
              >
                My Listings
              </NavLink>

              <NavLink
                to="/profile"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 transition hover:bg-zinc-800 hover:text-orange-500"
              >
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                className="block w-full rounded-lg px-3 py-3 text-left transition hover:bg-zinc-800 hover:text-orange-500"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={closeMenu}
              className="block rounded-lg px-3 py-3 transition hover:bg-zinc-800 hover:text-orange-500"
            >
              Login
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
 