import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50 transition-all">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-3xl font-extrabold text-indigo-700 tracking-wide"
          >
            Daily<span className="text-rose-500">Talk</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              About
            </Link>
                <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Features
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              How it Works
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Courses
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Contact Us
            </Link>
          </nav>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="text-gray-700 hover:text-indigo-600 transition"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden bg-white shadow-inner px-6 pt-4 pb-6 space-y-4 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        } overflow-hidden`}
      >
        <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium transition">
          Home
        </Link>
        <Link to="/about" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium transition">
          About
        </Link>
        <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium transition">
          Contact
        </Link>
        <Link to="/courses" onClick={() => setIsOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium transition">
          Courses
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
