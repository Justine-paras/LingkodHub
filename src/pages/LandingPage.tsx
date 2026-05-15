import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle2, Headphones, Star } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-brand-surface font-sans flex flex-col selection:bg-brand-primary selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex items-center px-8 py-20 md:py-32 min-h-[85vh]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{ 
            backgroundImage: 'url("/assets/hero.png")',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-primary/20 backdrop-blur-md border border-brand-primary/30 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
              <span className="text-white text-xs font-bold tracking-widest uppercase">Trusted ng Kapitbahay</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-6">
              Serbisyong Pinoy, <br />
              <span className="text-brand-accent">Gawang Kapitbahay.</span>
            </h1>
            <p className="text-lg text-gray-200 mb-10 max-w-md font-medium lg:text-xl leading-relaxed">
              From aircon cleaning to home repairs, we connect you with the best local talents in your area. Safe, mabilis, at abot-kaya.
            </p>

            {/* Search Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                navigate(`/services?q=${encodeURIComponent(query)}`);
              }}
              className="flex items-center bg-white/95 backdrop-blur-sm rounded-2xl p-2 w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] group focus-within:ring-4 focus-within:ring-brand-primary/20 transition-all border border-white/20"
            >
              <input 
                name="search"
                type="text" 
                placeholder="Anong service ang kailangan mo?" 
                className="flex-[2] bg-transparent border-none outline-none px-6 py-4 text-sm text-gray-900 placeholder:text-gray-500 w-full font-medium"
              />
              <div className="w-px h-6 bg-gray-200 shrink-0"></div>
              <input 
                type="text" 
                placeholder="Saan ka banda?" 
                className="flex-[1] bg-transparent border-none outline-none px-6 py-4 text-sm text-gray-900 placeholder:text-gray-500 w-full hidden sm:block font-medium"
              />
              <button 
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-10 py-4 rounded-xl font-bold transition-all shrink-0 ml-2 whitespace-nowrap active:scale-95 shadow-lg shadow-brand-primary/20"
              >
                Hanap Na
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-24 px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-brand-primary font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Top Picks</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Mga Suki na Serbisyo</h2>
          </div>
          <p className="text-gray-500 max-w-sm font-medium">
            Ang pinaka-book na services sa iyong barangay ngayong linggo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { title: 'Gawaing Bahay & Repairs', id: 'home-maintenance', img: '/assets/maintenance.png' },
            { title: 'Linis & Laba', id: 'cleaning', img: '/assets/cleaning.png' },
            { title: 'Ganda & Health', id: 'personal-care', img: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600' },
            { title: 'Gadget & Tech', id: 'tech', img: '/assets/tech.png' },
            { title: 'Aral & Tutorials', id: 'education', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600' },
            { title: 'Abot & Delivery', id: 'delivery', img: '/assets/delivery.png' },
          ].map((service) => (
            <div 
              key={service.id} 
              onClick={() => navigate(`/services?category=${service.id}`)}
              className="bg-white rounded-3xl overflow-hidden cursor-pointer group border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
            >
               <div className="h-56 overflow-hidden relative">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-4 left-4 text-white font-bold transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    Tingnan ang mga Suki →
                  </div>
               </div>
               <div className="p-6 flex-1 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{service.title}</h3>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suki Section */}
      <section className="py-24 px-8 bg-brand-primary-container/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-accent/20 rounded-full blur-3xl animate-pulse"></div>
            <img 
              src="/assets/suki.png" 
              alt="Suki System" 
              className="rounded-[3rem] shadow-2xl relative z-10 border-8 border-white"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4 border border-brand-primary/10">
              <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white">
                <Star fill="currentColor" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suki Rating</p>
                <p className="text-2xl font-black text-gray-900">Top Trusted</p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-brand-primary font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Ang "Suki" System</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight leading-[1.1]">
              Hindi lang basta service, <br />
              <span className="text-brand-primary">ka-Suki na yan.</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-10 font-medium">
              Sa Lingkod Hub, we value long-term trust. Our "Suki" system helps you find providers who are already trusted by your neighbors. Repeat bookings mean higher trust scores!
            </p>
            
            <div className="space-y-6">
              {[
                { title: 'Subok na ng Marami', desc: 'See providers with high repeat booking rates in your barangay.' },
                { title: 'Suki Discounts', desc: 'Get special rates and priority booking from your favorite partners.' },
                { title: 'Trusted Kapitbahay', desc: 'Read reviews from real neighbors you can actually trust.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-5">
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section/Guarantee */}
      <section className="py-24 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-brand-primary font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Siguradong Safe Ka</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
              Kampante ka sa <br className="hidden sm:block" />
              <span className="text-gray-400">bawat booking.</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              Built on trust, localized for you. Every interaction is secured para iwas-stress at siguradong quality ang gawa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Protektado Ka',
                desc: 'If something isn\'t right, handa ang aming team na ayusin ang dispute para sa\'yo.',
                tag: '100% Secure',
                detail: 'Service Protection'
              },
              {
                icon: CheckCircle2,
                title: 'Verified Partners',
                desc: 'Lahat ng providers ay dumaan sa background check at Barangay verification.',
                tag: 'Subok na',
                detail: 'ID & Background Checked'
              },
              {
                icon: Headphones,
                title: 'Kausap na Tao',
                desc: 'Walang bots dito. Local support team ang sasagot sa kahit anong concern mo.',
                tag: '24/7 Gising',
                detail: 'Chat, Email & Phone'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative bg-brand-surface-container/50 p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl hover:shadow-brand-primary/5 hover:-translate-y-1 transition-all duration-500 flex flex-col"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                    <feature.icon size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-full border border-brand-primary/10">
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
                      <div key={n} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shrink-0 shadow-sm">
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
            <span className="text-brand-primary font-bold tracking-[0.2em] uppercase text-xs mb-6 block">Paano Gumagana?</span>
            <h2 className="text-4xl font-black mb-6 tracking-tight text-gray-900">Madali lang: 3 steps at <br className="sm:hidden" /> tapos ang trabaho.</h2>
            <p className="text-gray-500 font-medium">Mabilis, safe, at seamless ang bawat transaction para direcho trabaho agad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                title: 'Mag-search ng Service',
                desc: 'I-browse ang mga categories o i-search ang specific na tulong na kailangan mo.'
              },
              {
                title: 'Pumili ng Suki',
                desc: 'I-compare ang mga profiles, basahin ang reviews ng mga kapitbahay, at piliin ang swak sa budget.'
              },
              {
                title: 'Book & Relax',
                desc: 'Mag-set ng schedule, magbayad nang safe, at i-enjoy ang trabahong pulido.'
              }
            ].map((item, i) => (
              <div key={i} className="relative bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-brand-text-main text-white rounded-xl flex items-center justify-center font-bold mb-8 relative z-10 shadow-lg shadow-black/10">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 relative z-10">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10 font-medium">{item.desc}</p>
                <div className="absolute top-8 right-8 text-brand-primary/5 font-black text-8xl pointer-events-none select-none">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 px-8 bg-brand-primary text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border-8 border-white rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">Ready nang simulan ang project?</h2>
          <p className="text-green-50 text-lg mb-10 max-w-2xl mx-auto font-medium">
            Maka-connect sa mga subok na service providers sa iyong barangay in minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup?type=client" className="bg-white text-brand-primary px-12 py-5 rounded-2xl font-bold shadow-2xl hover:bg-green-50 transition-all text-xl inline-flex items-center justify-center scale-100 hover:scale-105 active:scale-95 group">
              Simulan na!
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-surface-container border-t border-gray-100 py-24 px-8 text-gray-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group inline-flex">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-transform">
                <span className="text-white font-black text-xl leading-none">L</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900">Lingkod Hub</span>
            </Link>
            <p className="text-lg text-gray-400 max-w-sm leading-relaxed mb-8 font-medium">
              The Philippines' most trusted marketplace for reliable local services and skilled professionals.
            </p>
            <div className="flex gap-4">
              {['FB', 'TW', 'IG', 'LI'].map(social => (
                <div key={social} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-xs font-bold hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all cursor-pointer shadow-sm">
                  {social}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-black uppercase tracking-widest text-[10px] mb-8">Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/services" className="hover:text-brand-primary transition-colors">Find Services</Link></li>
              <li><Link to="/about" className="hover:text-brand-primary transition-colors">How it works</Link></li>
              <li><Link to="/signup" className="hover:text-brand-primary transition-colors text-brand-accent">Maging Lingkod Partner</Link></li>
              <li><Link to="/login" className="hover:text-brand-primary transition-colors">Provider Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-black uppercase tracking-widest text-[10px] mb-8">Support</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Safety Center</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          <p>© 2026 Lingkod Hub Philippines. Ang inyong ka-Suki sa serbisyo.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-gray-900 transition-colors">English / Tagalog</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

