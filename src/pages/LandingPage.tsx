import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, Headphones } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-brand-surface font-sans flex flex-col selection:bg-brand-primary selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex items-center px-8 py-20 md:py-32 min-h-[75vh]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1920&auto=format&fit=crop")',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Find trusted services <br />
              <span className="text-[#22C55E]">near you.</span>
            </h1>
            <p className="text-lg text-gray-200 mb-10 max-w-md form-medium lg:text-xl">
              Connect with skilled professionals in your area in minutes.
            </p>

            {/* Search Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                navigate(`/services?q=${encodeURIComponent(query)}`);
              }}
              className="flex items-center bg-white/95 backdrop-blur-sm rounded-full p-2 w-full max-w-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group focus-within:ring-4 focus-within:ring-[#22C55E]/20 transition-all"
            >
              <input 
                name="search"
                type="text" 
                placeholder="What service do you need?" 
                className="flex-[2] bg-transparent border-none outline-none px-6 py-4 text-sm text-gray-900 placeholder:text-gray-500 w-full"
              />
              <div className="w-px h-6 bg-gray-200 shrink-0"></div>
              <input 
                type="text" 
                placeholder="Location" 
                className="flex-[1] bg-transparent border-none outline-none px-6 py-4 text-sm text-gray-900 placeholder:text-gray-500 w-full hidden sm:block"
              />
              <button 
                type="submit"
                className="bg-[#22C55E] hover:bg-[#15803D] text-white px-8 py-4 rounded-full font-semibold transition-all shrink-0 ml-2 whitespace-nowrap active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-24 px-8 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 tracking-tight">Popular Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { title: 'Home Maintenance', id: 'home-maintenance', img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600' },
            { title: 'Cleaning & Laundry', id: 'cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600' },
            { title: 'Personal Care', id: 'personal-care', img: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600' },
            { title: 'Tech & Digital', id: 'tech', img: 'https://images.unsplash.com/photo-1588702547919-26089e690961?w=600' },
            { title: 'Tutoring', id: 'education', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600' },
            { title: 'Delivery', id: 'delivery', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600' },
          ].map((service) => (
            <div 
              key={service.id} 
              onClick={() => navigate(`/services?category=${service.id}`)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer group border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col"
            >
               <div className="h-48 overflow-hidden relative">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
               </div>
               <div className="p-5 flex-1 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#22C55E] transition-colors">{service.title}</h3>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-[#22C55E] group-hover:translate-x-1 transition-all" />
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section/Guarantee */}
      <section className="py-24 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#22C55E] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Satisfaction Guaranteed</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
              Your peace of mind is <br className="hidden sm:block" />
              <span className="text-gray-400">our top priority.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              We've built trust into every interaction, ensuring you get the quality service you deserve, every single time you book through Lingkod Hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Quality Pledge',
                desc: 'If a service doesn\'t meet expectations, our dispute resolution team will work to make it right for you.',
                tag: '100% Protection',
                detail: 'Service Protection Policy'
              },
              {
                icon: CheckCircle2,
                title: 'Verified Providers',
                desc: 'Providers undergo a rigorous verification process, including background checks and portfolio reviews.',
                tag: '8,000+ Licensed',
                detail: 'Verified ID & Background'
              },
              {
                icon: Headphones,
                title: 'Human Support',
                desc: 'No bots here. Our local support team is available 7 days a week to assist with any booking concerns.',
                tag: 'Always Available',
                detail: 'Chat, Email & Phone'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl hover:shadow-[#22C55E]/5 hover:-translate-y-1 transition-all duration-500 flex flex-col"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-[#22C55E]/10 text-[#22C55E] rounded-2xl flex items-center justify-center group-hover:bg-[#22C55E] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                    <feature.icon size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#22C55E] bg-[#22C55E]/5 px-3 py-1.5 rounded-full">
                    {feature.tag}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium mb-8">
                  {feature.desc}
                </p>

                <div className="mt-auto flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shrink-0">
                        <img src={`https://i.pravatar.cc/100?u=trusted${i}${n}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    {feature.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[#22C55E] font-bold tracking-[0.2em] uppercase text-xs mb-6 block">The Process</span>
            <h2 className="text-4xl font-black mb-6 tracking-tight text-gray-900">Get things done in <br className="sm:hidden" /> 3 simple steps.</h2>
            <p className="text-gray-500">Our platform is designed to be as fast and seamless as possible, so you can focus on what matters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                title: 'Search Services',
                desc: 'Browse through dozens of categories or search for specific tasks you need help with.'
              },
              {
                title: 'Choose a Provider',
                desc: 'Compare provider profiles, read verified reviews, and pick the expert that fits your budget.'
              },
              {
                title: 'Book & Relax',
                desc: 'Schedule a time that works for you. Pay securely and enjoy a job well done.'
              }
            ].map((item, i) => (
              <div key={i} className="relative bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold mb-8 relative z-10">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 relative z-10">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 px-8 bg-[#22C55E] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-white tracking-tight">Ready to get things done?</h2>
          <p className="text-green-50 text-lg mb-10 max-w-2xl mx-auto">
            Find trusted service providers near you and book in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup?type=client" className="bg-white text-[#22C55E] px-10 py-4 rounded-full font-bold shadow-xl hover:bg-green-50 transition-all text-xl inline-flex items-center justify-center scale-100 hover:scale-105 active:scale-95">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-24 px-8 text-gray-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group inline-flex">
              <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center shadow-lg shadow-[#22C55E]/20 group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-xl leading-none">L</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">Lingkod Hub</span>
            </Link>
            <p className="text-lg text-gray-400 max-w-sm leading-relaxed mb-8">
              The Philippines' most trusted marketplace for reliable local services and skilled professionals.
            </p>
            <div className="flex gap-4">
              {['FB', 'TW', 'IG', 'LI'].map(social => (
                <div key={social} className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xs font-bold hover:bg-[#22C55E] hover:text-white transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-black uppercase tracking-widest text-[10px] mb-8">Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/services" className="hover:text-[#22C55E] transition-colors">Find Services</Link></li>
              <li><Link to="/about" className="hover:text-[#22C55E] transition-colors">How it works</Link></li>
              <li><Link to="/signup" className="hover:text-[#22C55E] transition-colors">Become a Provider</Link></li>
              <li><Link to="/login" className="hover:text-[#22C55E] transition-colors">Provider Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-black uppercase tracking-widest text-[10px] mb-8">Support</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#" className="hover:text-[#22C55E] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[#22C55E] transition-colors">Safety Center</a></li>
              <li><a href="#" className="hover:text-[#22C55E] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#22C55E] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <p>© 2026 Lingkod Hub Philippines. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-gray-900 transition-colors">English</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

