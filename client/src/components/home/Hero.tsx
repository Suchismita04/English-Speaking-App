import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const backgrounds = [
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e',
  'https://images.unsplash.com/photo-1586232880819-5d06b672c942?q=80&w=1567&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1688989667207-4dce9c98ed2f?q=80&w=1532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

const Hero = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <section
      className="w-full min-h-screen pt-20 relative bg-cover bg-center transition-all duration-1000"
      style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
    >
   
      <div className="absolute inset-0 bg-black/60 z-0"></div>

    
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-2 gap-12 text-white items-center">

          {/* Left Content */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Speak English <span className="text-indigo-400">Fluently</span> and <span className="text-rose-400">Confidently</span>
            </h1>
            <p className="mt-6 text-lg text-gray-200">
              Learn by speaking in real-time. Boost your confidence with guided practice and AI feedback.
            </p>

            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <Link
                to="/#features"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition"
              >
                Explore Features
              </Link>
              <Link
                to="/#how-it-works"
                className="border border-white hover:bg-white hover:text-black px-6 py-3 rounded-full font-medium transition"
              >
                How It Works
              </Link>
            </div>
          </div>

{/* Right Side - Login / Sign Up */}
<div className="relative z-10 w-full max-w-md mx-auto bg-white/10 border border-white/30 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-6 sm:p-10 text-white">
  <div className="flex mb-8 overflow-hidden border border-white/20 rounded-full">
    <button
      onClick={() => setShowLogin(true)}
      className={`w-1/2 py-2 text-sm sm:text-base font-bold transition-all duration-300 ${
        showLogin ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'text-slate-100 hover:bg-white/10'
      }`}
    >
      Login
    </button>
    <button
      onClick={() => setShowLogin(false)}
      className={`w-1/2 py-2 text-sm sm:text-base font-bold transition-all duration-300 ${
        !showLogin ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' : 'text-slate-100 hover:bg-white/10'
      }`}
    >
      Sign Up
    </button>
  </div>

  {showLogin ? (
    <form className="space-y-6">
      <div className="relative">
        <input
          type="email"
          placeholder=" "
          className="peer w-full bg-white/80 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-transparent"
        />
        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500">
          Email
        </label>
      </div>
      <div className="relative">
        <input
          type="password"
          placeholder=" "
          className="peer w-full bg-white/80 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-transparent"
        />
        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500">
          Password
        </label>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 hover:from-indigo-700 hover:to-fuchsia-600 text-white font-semibold py-3 rounded-lg shadow-lg transition"
      >
        Login
      </button>

      {/* === Social Login Buttons (Login) === */}
      <div className="mt-6">
        <p className="text-sm text-center text-white/70 mb-4">Or continue with</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 transition text-gray-800 text-sm shadow-md"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b5998] hover:bg-[#2d4373] transition text-white text-sm shadow-md"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24h-1.918c-1.504 0-1.794.715-1.794 1.762v2.312h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.676V1.324C24 .593 23.407 0 22.676 0z" />
            </svg>
            Facebook
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 hover:opacity-90 transition text-white text-sm shadow-md"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.735 0 8.332.012 7.052.07 5.765.127 4.548.403 3.56 1.39c-.987.987-1.263 2.204-1.32 3.491C2.012 6.668 2 7.07 2 12c0 4.93.012 5.332.07 6.612.057 1.287.333 2.504 1.32 3.491.988.987 2.205 1.263 3.492 1.32 1.28.058 1.683.07 6.612.07s5.332-.012 6.612-.07c1.287-.057 2.504-.333 3.491-1.32.987-.987 1.263-2.204 1.32-3.491.058-1.28.07-1.683.07-6.612s-.012-5.332-.07-6.612c-.057-1.287-.333-2.504-1.32-3.491-.987-.987-2.204-1.263-3.491-1.32C17.332.012 16.93 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
            </svg>
            Instagram
          </button>
        </div>
      </div>
    </form>
  ) : (
    <form className="space-y-6">
      <div className="relative">
        <input type="text" placeholder=" " className="peer w-full bg-white/80 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-transparent" />
        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500">
          Full Name
        </label>
      </div>
      <div className="relative">
        <input type="email" placeholder=" " className="peer w-full bg-white/80 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-transparent" />
        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500">
          Email
        </label>
      </div>
      <div className="relative">
        <input type="password" placeholder=" " className="peer w-full bg-white/80 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-transparent" />
        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500">
          Password
        </label>
      </div>
      <div className="relative">
        <input type="password" placeholder=" " className="peer w-full bg-white/80 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-transparent" />
        <label className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-gray-500">
          Confirm Password
        </label>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 hover:from-indigo-700 hover:to-fuchsia-600 text-white font-semibold py-3 rounded-lg shadow-lg transition"
      >
        Sign Up
      </button>

      {/* === Social Buttons also shown in Signup === */}
      <div className="mt-6">
        <p className="text-sm text-center text-white/70 mb-4">Or continue with</p>
        <div className="flex justify-center gap-4 flex-wrap">
                  <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 transition text-gray-800 text-sm shadow-md"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b5998] hover:bg-[#2d4373] transition text-white text-sm shadow-md"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24h-1.918c-1.504 0-1.794.715-1.794 1.762v2.312h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.676V1.324C24 .593 23.407 0 22.676 0z" />
            </svg>
            Facebook
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 hover:opacity-90 transition text-white text-sm shadow-md"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.31-3.608.975-.975 2.242-1.248 3.608-1.31C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.735 0 8.332.012 7.052.07 5.765.127 4.548.403 3.56 1.39c-.987.987-1.263 2.204-1.32 3.491C2.012 6.668 2 7.07 2 12c0 4.93.012 5.332.07 6.612.057 1.287.333 2.504 1.32 3.491.988.987 2.205 1.263 3.492 1.32 1.28.058 1.683.07 6.612.07s5.332-.012 6.612-.07c1.287-.057 2.504-.333 3.491-1.32.987-.987 1.263-2.204 1.32-3.491.058-1.28.07-1.683.07-6.612s-.012-5.332-.07-6.612c-.057-1.287-.333-2.504-1.32-3.491-.987-.987-2.204-1.263-3.491-1.32C17.332.012 16.93 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
            </svg>
            Instagram
          </button>
        </div>
      </div>
    </form>
  )}
</div>
        </div>
      </div>
    </section>
</>
  );
};

export default Hero;
