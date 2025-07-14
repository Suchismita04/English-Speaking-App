import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* Logo & Description */}
          <div>
            <Link to="/" className="text-2xl font-extrabold text-indigo-700 tracking-wide">
              Daily<span className="text-rose-500">Talk</span>
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              Improve your English communication every day with real-time speaking practice, courses, and expert guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-600 transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-indigo-600 transition">About</Link></li>
              <li><Link to="/courses" className="hover:text-indigo-600 transition">Courses</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-600 transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-600 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
            <p className="text-sm mb-2">Email: support@dailytalk.app</p>
            <div className="flex space-x-4 mt-3">
              {/* Placeholder icons or social links */}
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
                <i className="fab fa-twitter" />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition">
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
          © {new Date().getFullYear()} DailyTalk. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
