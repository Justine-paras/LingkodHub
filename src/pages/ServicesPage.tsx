import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Wrench, 
  Sparkles, 
  Zap, 
  GraduationCap, 
  Scissors, 
  Truck, 
  Smartphone,
  ChevronRight,
  Search,
  CheckCircle2,
  Star,
  ShieldCheck,
  Clock,
  Filter,
  ArrowRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  {
    id: 'all',
    title: 'All Services',
    icon: Zap,
    color: 'bg-gray-100 text-gray-600',
    services: []
  },
  {
    id: 'home-maintenance',
    title: 'Home Maintenance',
    icon: Wrench,
    color: 'bg-blue-50 text-blue-600',
    services: ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Roofing', 'AC Repair']
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    icon: Sparkles,
    color: 'bg-green-50 text-green-600',
    services: ['Deep Cleaning', 'Standard Cleaning', 'Laundry', 'Car Wash', 'Disinfection']
  },
  {
    id: 'education',
    title: 'Tutoring & Education',
    icon: GraduationCap,
    color: 'bg-purple-50 text-purple-600',
    services: ['Math Tutor', 'English Lessons', 'Musical Instruments', 'Coding', 'Art Classes']
  },
  {
    id: 'personal-care',
    title: 'Personal Care',
    icon: Scissors,
    color: 'bg-rose-50 text-rose-600',
    services: ['Hair Styling', 'Manicure/Pedicure', 'Massage Therapy', 'Personal Training']
  },
  {
    id: 'tech',
    title: 'Tech & Digital',
    icon: Smartphone,
    color: 'bg-indigo-50 text-indigo-600',
    services: ['Phone Repair', 'Laptop Setup', 'Web Design', 'Social Media Help']
  },
  {
    id: 'delivery',
    title: 'Delivery & Logistics',
    icon: Truck,
    color: 'bg-amber-50 text-amber-600',
    services: ['Grocery Errands', 'Furniture Moving', 'Pabili Service', 'Document Delivery']
  }
];

const SERVICE_OFFERS = [
  {
    id: 'ac-cleaning',
    name: 'Split-type AC Cleaning',
    category: 'home-maintenance',
    tags: ['aircon', 'cleaning', 'repair', 'maintenance', 'cooling'],
    price: '₱1,500',
    unit: 'unit',
    rating: 4.9,
    reviews: 1240,
    provider: 'Cool Breeze Tech',
    isVerified: true,
    location: 'Quezon City',
    responseTime: '< 30 mins',
    img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'
  },
  {
    id: 'deep-clean',
    name: 'Full Home Deep Cleaning',
    category: 'cleaning',
    tags: ['home', 'clean', 'deep', 'disinfection', 'scrub', 'sanitation'],
    price: '₱2,500',
    unit: 'session',
    rating: 4.8,
    reviews: 850,
    provider: 'Sparkle Squad',
    isVerified: true,
    location: 'Makati',
    responseTime: '< 1 hour',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600'
  },
  {
    id: 'math-tutor',
    name: 'Senior High Math Tutor',
    category: 'education',
    tags: ['math', 'tutor', 'study', 'education', 'exam', 'algebra', 'calculus'],
    price: '₱500',
    unit: 'hour',
    rating: 5.0,
    reviews: 320,
    provider: 'EduConnect Labs',
    isVerified: true,
    location: 'Manila',
    responseTime: '< 2 hours',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600'
  },
  {
    id: 'electrician',
    name: 'Emergency Electrical Repair',
    category: 'home-maintenance',
    tags: ['electric', 'wiring', 'brownout', 'repair', 'emergency', 'maintenance', 'electrical', 'plumbing'],
    price: '₱800',
    unit: 'visit',
    rating: 4.7,
    reviews: 560,
    provider: 'VoltGuard Pro',
    isVerified: true,
    location: 'Taguig',
    responseTime: '< 15 mins',
    img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600'
  },
  {
    id: 'plumbing-fix',
    name: 'Emergency Plumbing & Leak Fix',
    category: 'home-maintenance',
    tags: ['plumbing', 'leak', 'water', 'repair', 'faucet', 'bathroom', 'clogged', 'toilet'],
    price: '₱850',
    unit: 'fix',
    rating: 4.9,
    reviews: 125,
    provider: 'AquaFlow Experts',
    isVerified: true,
    location: 'Pasig',
    responseTime: '< 25 mins',
    img: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600'
  },
  {
    id: 'massage',
    name: 'Swedish Massage (Home Service)',
    category: 'personal-care',
    tags: ['spa', 'massage', 'relax', 'health', 'wellness', 'therapy'],
    price: '₱750',
    unit: 'hour',
    rating: 4.9,
    reviews: 2100,
    provider: 'Zen Mobile Spa',
    isVerified: true,
    location: 'Parañaque',
    responseTime: '< 45 mins',
    img: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600'
  },
  {
    id: 'errands',
    name: 'Grocery & Market Runner',
    category: 'delivery',
    tags: ['delivery', 'grocery', 'errands', 'shopping', 'food', 'runner'],
    price: '₱250',
    unit: 'service',
    rating: 4.6,
    reviews: 1800,
    provider: 'QuickRun PH',
    isVerified: true,
    location: 'Manila',
    responseTime: '< 10 mins',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'
  },
  {
    id: 'laptop-fix',
    name: 'Laptop Software Troubleshooting',
    category: 'tech',
    tags: ['computer', 'laptop', 'software', 'it', 'tech', 'repair', 'windows', 'mac'],
    price: '₱1,200',
    unit: 'fix',
    rating: 4.8,
    reviews: 430,
    provider: 'ByteFix Solutions',
    isVerified: true,
    location: 'Quezon City',
    responseTime: '< 1 hour',
    img: 'https://images.unsplash.com/photo-1588702547919-26089e690961?w=600'
  },
  {
    id: 'full-renovation',
    name: 'Condo Full Renovation',
    category: 'home-maintenance',
    tags: ['renovation', 'interior', 'construction', 'luxury', 'design'],
    price: '₱45,000',
    unit: 'project',
    rating: 4.4,
    reviews: 12,
    provider: 'Elite Build PH',
    isVerified: true,
    location: 'Makati',
    responseTime: '< 24 hours',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600'
  },
  {
    id: 'web-dev-p',
    name: 'E-commerce Website Setup',
    category: 'tech',
    tags: ['web', 'design', 'development', 'coding', 'store', 'shopify'],
    price: '₱15,000',
    unit: 'setup',
    rating: 4.9,
    reviews: 88,
    provider: 'Digital Dreams',
    isVerified: true,
    location: 'Taguig',
    responseTime: '< 4 hours',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600'
  }
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<{
    category: string | null;
    rating: string | null;
    budget: string | null;
    location: string | null;
  }>({
    category: null,
    rating: null,
    budget: null,
    location: null,
  });

  useEffect(() => {
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const loc = searchParams.get('location');
    const bud = searchParams.get('budget');
    const rat = searchParams.get('rating');
    
    if (category) setActiveCategory(category);
    if (q) setSearchQuery(q);
    
    setFilters({
      category: category || 'all',
      location: loc,
      budget: bud,
      rating: rat
    });
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const filteredOffers = useMemo(() => {
    return SERVICE_OFFERS.filter(offer => {
      const matchesCategory = activeCategory === 'all' || offer.category === activeCategory;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesName = offer.name.toLowerCase().includes(lowerQuery);
      const matchesProvider = offer.provider.toLowerCase().includes(lowerQuery);
      const matchesTags = (offer as any).tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery));
      const matchesLocation = !filters.location || (offer as any).location === filters.location;
      
      // Rating filter
      let matchesRating = true;
      if (filters.rating && filters.rating !== 'All') {
        const minRating = parseFloat(filters.rating);
        matchesRating = offer.rating >= minRating;
      }

      // Budget filter
      let matchesBudget = true;
      if (filters.budget) {
        const price = parseInt(offer.price.replace(/[^\d]/g, ''), 10);
        if (filters.budget === 'b1') matchesBudget = price <= 1000;
        else if (filters.budget === 'b2') matchesBudget = price > 1000 && price <= 3000;
        else if (filters.budget === 'b3') matchesBudget = price > 3000;
      }
      
      return matchesCategory && (matchesName || matchesProvider || matchesTags) && matchesLocation && matchesRating && matchesBudget;
    });
  }, [activeCategory, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      {/* Hero & Search */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight"
          >
            What service do you <br className="hidden md:block" />
            <span className="text-[#22C55E]">need help</span> with today?
          </motion.h1>
          
          <div className="relative max-w-2xl mx-auto mt-10">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={22} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFilters('q', e.target.value);
              }}
              placeholder="Search services (e.g. 'Aircon cleaning', 'Plumbing')"
              className="w-full bg-white border-2 border-gray-100 rounded-[2rem] py-5 pl-16 pr-32 outline-none focus:border-[#22C55E] focus:ring-8 focus:ring-[#22C55E]/5 transition-all shadow-xl shadow-gray-200/40 text-lg placeholder:text-gray-400"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#22C55E] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#15803D] transition-all transform active:scale-95 shadow-lg shadow-[#22C55E]/20">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Category Bar */}
      <div className="sticky top-[73px] z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center flex-wrap gap-2 md:gap-4">
          {CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                updateFilters('category', cat.id);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border-2 ${
                activeCategory === cat.id 
                ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <cat.icon size={14} />
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar / Filters */}
          <aside className="hidden lg:block w-72 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-10">
              <div>
                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                  <Filter size={14} className="text-[#22C55E]" />
                  Refine Search
                </h4>
                
                <div className="space-y-10">
                  {/* Rating Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Minimum Rating</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['4.5+', '4.0+', '3.5+', 'All'].map((r) => (
                        <button 
                          key={r} 
                          onClick={() => updateFilters('rating', r)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            (filters.rating === r || (r === 'All' && !filters.rating))
                            ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]' 
                            : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Budget Range</label>
                    <div className="space-y-3">
                      {[
                        { label: '₱0 - ₱1,000', id: 'b1' },
                        { label: '₱1,000 - ₱3,000', id: 'b2' },
                        { label: '₱3,000+', id: 'b3' }
                      ].map((range) => (
                        <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                          <div className="w-5 h-5 rounded-md border-2 border-gray-100 flex items-center justify-center group-hover:border-[#22C55E] transition-all">
                            <div className={`w-2 h-2 bg-[#22C55E] rounded-sm transition-opacity ${filters.budget === range.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'}`}></div>
                          </div>
                          <span className={`text-xs font-semibold uppercase tracking-wide transition-colors ${filters.budget === range.id ? 'text-[#22C55E]' : 'text-gray-500 group-hover:text-gray-900'}`}>{range.label}</span>
                          <input type="radio" className="hidden" name="budget" onChange={() => updateFilters('budget', range.id)} />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Service Area</label>
                    <div className="space-y-2">
                      <select 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#22C55E]/20 transition-all appearance-none cursor-pointer"
                        value={filters.location || ''}
                        onChange={(e) => updateFilters('location', e.target.value || null)}
                      >
                        <option value="">All Metro Manila</option>
                        <option value="Quezon City">Quezon City</option>
                        <option value="Makati">Makati</option>
                        <option value="Manila">Manila</option>
                        <option value="Taguig">Taguig</option>
                        <option value="Pasig">Pasig</option>
                        <option value="Parañaque">Parañaque</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate('/signup')}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E] opacity-20 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h4 className="font-bold text-xl mb-3 relative z-10">Want to earn?</h4>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed relative z-10">Join 5,000+ local experts providing services in your area.</p>
              <button className="bg-[#22C55E] text-white w-full py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#22C55E]/10 flex items-center justify-center gap-2 group-hover:bg-[#15803D] transition-all">
                List your Service
                <ArrowRight size={16} />
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeCategory === 'all' ? 'All Popular Services' : CATEGORIES.find(c => c.id === activeCategory)?.title}
                <span className="ml-3 text-sm font-medium text-gray-400 uppercase tracking-widest">{filteredOffers.length} Results</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredOffers.map((offer) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={offer.id}
                    onClick={() => navigate('/signup')}
                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img src={offer.img} alt={offer.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className="bg-white/95 backdrop-blur shadow-sm px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ring-1 ring-black/5">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          {offer.rating}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ring-1 ring-white/20">
                          {CATEGORIES.find(c => c.id === offer.category)?.title}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#22C55E] transition-colors leading-snug flex-1 pr-4">
                          {offer.name}
                        </h3>
                        {offer.isVerified && <ShieldCheck size={20} className="text-blue-500 fill-blue-50 flex-shrink-0" title="Verified Provider" />}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(offer as any).tags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{offer.provider}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {(offer as any).location}
                        </span>
                      </div>

                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Starting at</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900">{offer.price}</span>
                            <span className="text-xs text-gray-400 font-medium lowercase">/ {offer.unit}</span>
                          </div>
                        </div>
                        <button className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:bg-[#22C55E] transition-all shadow-lg shadow-gray-200">
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredOffers.length === 0 && (
              <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We couldn't find any services matching "{searchQuery}" in this category.
                </p>
                <button 
                  onClick={() => { navigate('/services'); }}
                  className="mt-8 text-[#22C55E] font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Support & Safety Section */}
      <section className="bg-white border-t border-gray-100 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why book via Lingkod Hub?</h2>
            <p className="text-gray-600">The safest way to hire local professionals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: 'Identity Verified', desc: 'Every provider undergoes a strict background and identity check.', color: 'text-blue-500' },
              { icon: Clock, title: 'Fast Response', desc: 'Get quotes and confirmations within minutes, not days.', color: 'text-[#22C55E]' },
              { icon: CheckCircle2, title: 'Quality Guarantee', desc: 'Secure payments and customer support to ensure job satisfaction.', color: 'text-purple-500' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <feature.icon size={32} className={feature.color} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E] opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>
          
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Can't find a <br className="hidden lg:block" /> specific service?</h2>
            <p className="text-gray-400 text-lg mb-10">
              Post a custom request and let verified professionals bid for your project. You set the price, they bring the tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/signup?type=client')}
                className="bg-[#22C55E] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#15803D] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-[#22C55E]/20"
              >
                Post a Job Request
              </button>
            </div>
          </div>

          <div className="relative z-10 lg:pr-12 hidden lg:block">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 max-w-xs rotate-3 animate-float">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                 <div className="flex-1 space-y-2">
                   <div className="h-3 w-20 bg-white/20 rounded"></div>
                   <div className="h-2 w-12 bg-white/10 rounded"></div>
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="h-2 w-full bg-white/10 rounded"></div>
                 <div className="h-2 w-full bg-white/10 rounded"></div>
                 <div className="h-2 w-4/5 bg-white/10 rounded"></div>
               </div>
               <div className="mt-8 pt-6 border-t border-white/10 flex justify-between">
                 <div className="h-4 w-12 bg-[#22C55E]/40 rounded"></div>
                 <div className="h-4 w-16 bg-white/20 rounded"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Lingkod Hub</span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Empowering local service professionals and connecting them with customers through a secure, reliable marketplace.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h5 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Marketplace</h5>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><button onClick={() => {setActiveCategory('all'); window.scrollTo(0,0);}} className="hover:text-[#22C55E] transition-colors">Browse All</button></li>
                <li><button onClick={() => {setActiveCategory('home-maintenance'); window.scrollTo(0,0);}} className="hover:text-[#22C55E] transition-colors">Home Services</button></li>
                <li><button onClick={() => {setActiveCategory('cleaning'); window.scrollTo(0,0);}} className="hover:text-[#22C55E] transition-colors">Cleaning</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Community</h5>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/signup" className="hover:text-[#22C55E] transition-colors">Trust & Safety</Link></li>
                <li><Link to="/signup" className="hover:text-[#22C55E] transition-colors">Become a Pro</Link></li>
                <li><Link to="/signup" className="hover:text-[#22C55E] transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2026 Lingkod Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
