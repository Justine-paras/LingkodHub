import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Explore Services', path: '/services' },
    { label: 'About Us', path: '/about' },
    { label: 'How it works', path: '/#how-it-works' },
  ];

  const isActive = (path: string) => {
    if (path === '/#how-it-works') return location.pathname === '/' && location.hash === '#how-it-works';
    return location.pathname === path;
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm py-3' 
          : 'bg-white border-b border-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group relative z-50">
          <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center shadow-lg shadow-[#22C55E]/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <span className="text-white font-black text-xl leading-none">L</span>
          </div>
          <span className="hidden sm:block text-2xl font-black tracking-tighter text-gray-900 group-hover:text-[#22C55E] transition-colors">
            Lingkod Hub
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isActive(link.path)
                  ? 'bg-white text-[#22C55E] shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            to="/login" 
            className="text-sm font-bold text-gray-500 px-6 py-3 hover:text-gray-900 transition-all"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            className="text-sm font-bold text-white px-8 py-3.5 bg-gray-900 rounded-2xl shadow-xl shadow-black/10 hover:bg-[#22C55E] hover:-translate-y-1 transition-all active:translate-y-0 min-w-[140px] text-center"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden relative z-50 p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white z-40 transition-all duration-500 transform ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } lg:hidden pt-28 px-8 overflow-y-auto`}
      >
        <div className="space-y-6 pb-12">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-5 rounded-[2rem] text-lg font-bold group transition-all ${
                  isActive(link.path) 
                    ? 'bg-[#22C55E] text-white shadow-xl shadow-[#22C55E]/20' 
                    : 'bg-gray-50 text-gray-900 active:scale-95'
                }`}
              >
                {link.label}
                <ChevronRight size={20} className={`${isActive(link.path) ? 'text-white' : 'text-gray-300'} group-hover:translate-x-1 transition-all`} />
              </Link>
            ))}
          </div>
          
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <Link 
              to="/signup" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-5 bg-[#22C55E] text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-[#22C55E]/20"
            >
              Sign up for free
            </Link>
            <Link 
              to="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-[1.5rem] font-bold text-lg"
            >
              Log into account
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
