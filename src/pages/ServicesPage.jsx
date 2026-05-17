import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Wrench,
  Sparkles,
  Zap,
  GraduationCap,
  Scissors,
  Truck,
  Smartphone,
  Search,
  CheckCircle2,
  Star,
  ShieldCheck,
  Clock,
  Filter,
  ArrowRight,
  MapPin,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../components/LanguageContext";

const CATEGORIES = [
  {
    id: "all",
    title: "Lahat ng Serbisyo",
    icon: Zap,
    color: "bg-gray-100 text-gray-600",
    services: [],
  },
  {
    id: "home-maintenance",
    title: "Gawaing Bahay & Repairs",
    icon: Wrench,
    color: "bg-blue-50 text-blue-600",
    services: [
      "Plumbing",
      "Electrical",
      "Carpentry",
      "Painting",
      "Roofing",
      "AC Repair",
    ],
  },
  {
    id: "cleaning",
    title: "Linis & Laba",
    icon: Sparkles,
    color: "bg-green-50 text-green-600",
    services: [
      "Deep Cleaning",
      "Standard Cleaning",
      "Laundry",
      "Car Wash",
      "Disinfection",
    ],
  },
  {
    id: "education",
    title: "Aral & Tutorials",
    icon: GraduationCap,
    color: "bg-purple-50 text-purple-600",
    services: [
      "Math Tutor",
      "English Lessons",
      "Musical Instruments",
      "Coding",
      "Art Classes",
    ],
  },
  {
    id: "personal-care",
    title: "Ganda & Wellness",
    icon: Scissors,
    color: "bg-rose-50 text-rose-600",
    services: [
      "Hair Styling",
      "Manicure/Pedicure",
      "Massage Therapy",
      "Personal Training",
    ],
  },
  {
    id: "tech",
    title: "Gadget & Tech",
    icon: Smartphone,
    color: "bg-indigo-50 text-indigo-600",
    services: [
      "Phone Repair",
      "Laptop Setup",
      "Web Design",
      "Social Media Help",
    ],
  },
  {
    id: "delivery",
    title: "Abot & Delivery",
    icon: Truck,
    color: "bg-amber-50 text-amber-600",
    services: [
      "Grocery Errands",
      "Furniture Moving",
      "Pabili Service",
      "Document Delivery",
    ],
  },
];

const SERVICE_OFFERS = [
  {
    id: "ac-cleaning",
    name: "Split-type AC Cleaning",
    category: "home-maintenance",
    tags: ["aircon", "cleaning", "repair", "maintenance", "cooling"],
    price: "₱1,500",
    unit: "unit",
    rating: 4.9,
    reviews: 1240,
    sukiCount: 450,
    provider: "Cool Breeze Tech",
    isVerified: true,
    location: "Quezon City",
    responseTime: "< 30 mins",
    img: "/assets/maintenance.png",
  },
  {
    id: "deep-clean",
    name: "Full Home Deep Cleaning",
    category: "cleaning",
    tags: ["home", "clean", "deep", "disinfection", "scrub", "sanitation"],
    price: "₱2,500",
    unit: "session",
    rating: 4.8,
    reviews: 850,
    sukiCount: 120,
    provider: "Sparkle Squad",
    isVerified: true,
    location: "Makati",
    responseTime: "< 1 hour",
    img: "/assets/cleaning.png",
  },
  {
    id: "math-tutor",
    name: "Senior High Math Tutor",
    category: "education",
    tags: [
      "math",
      "tutor",
      "study",
      "education",
      "exam",
      "algebra",
      "calculus",
    ],
    price: "₱500",
    unit: "hour",
    rating: 5.0,
    reviews: 320,
    sukiCount: 85,
    provider: "EduConnect Labs",
    isVerified: true,
    location: "Manila",
    responseTime: "< 2 hours",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600",
  },
  {
    id: "electrician",
    name: "Emergency Electrical Repair",
    category: "home-maintenance",
    tags: [
      "electric",
      "wiring",
      "brownout",
      "repair",
      "emergency",
      "maintenance",
      "electrical",
      "plumbing",
    ],
    price: "₱800",
    unit: "visit",
    rating: 4.7,
    reviews: 560,
    sukiCount: 200,
    provider: "VoltGuard Pro",
    isVerified: true,
    location: "Taguig",
    responseTime: "< 15 mins",
    img: "/assets/maintenance.png",
  },
  {
    id: "plumbing-fix",
    name: "Emergency Plumbing & Leak Fix",
    category: "home-maintenance",
    tags: [
      "plumbing",
      "leak",
      "water",
      "repair",
      "faucet",
      "bathroom",
      "clogged",
      "toilet",
    ],
    price: "₱850",
    unit: "fix",
    rating: 4.9,
    reviews: 125,
    sukiCount: 40,
    provider: "AquaFlow Experts",
    isVerified: true,
    location: " Pasig",
    responseTime: "< 25 mins",
    img: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600",
  },
  {
    id: "massage",
    name: "Swedish Massage (Home Service)",
    category: "personal-care",
    tags: ["spa", "massage", "relax", "health", "wellness", "therapy"],
    price: "₱750",
    unit: "hour",
    rating: 4.9,
    reviews: 2100,
    sukiCount: 1200,
    provider: "Zen Mobile Spa",
    isVerified: true,
    location: "Parañaque",
    responseTime: "< 45 mins",
    img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600",
  },
  {
    id: "errands",
    name: "Grocery & Market Runner",
    category: "delivery",
    tags: ["delivery", "grocery", "errands", "shopping", "food", "runner"],
    price: "₱250",
    unit: "service",
    rating: 4.6,
    reviews: 1800,
    sukiCount: 650,
    provider: "QuickRun PH",
    isVerified: true,
    location: "Manila",
    responseTime: "< 10 mins",
    img: "/assets/delivery.png",
  },
  {
    id: "laptop-fix",
    name: "Laptop Software Troubleshooting",
    category: "tech",
    tags: [
      "computer",
      "laptop",
      "software",
      "it",
      "tech",
      "repair",
      "windows",
      "mac",
    ],
    price: "₱1,200",
    unit: "fix",
    rating: 4.8,
    reviews: 430,
    sukiCount: 95,
    provider: "ByteFix Solutions",
    isVerified: true,
    location: "Quezon City",
    responseTime: "< 1 hour",
    img: "/assets/tech.png",
  },
  {
    id: "full-renovation",
    name: "Condo Full Renovation",
    category: "home-maintenance",
    tags: ["renovation", "interior", "construction", "luxury", "design"],
    price: "₱45,000",
    unit: "project",
    rating: 4.4,
    reviews: 12,
    sukiCount: 2,
    provider: "Elite Build PH",
    isVerified: true,
    location: "Makati",
    responseTime: "< 24 hours",
    img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600",
  },
  {
    id: "web-dev-p",
    name: "E-commerce Website Setup",
    category: "tech",
    tags: ["web", "design", "development", "coding", "store", "shopify"],
    price: "₱15,000",
    unit: "setup",
    rating: 4.9,
    reviews: 88,
    sukiCount: 15,
    provider: "Digital Dreams",
    isVerified: true,
    location: "Taguig",
    responseTime: "< 4 hours",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    category: null,
    rating: null,
    budget: null,
    location: null,
  });

  useEffect(() => {
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const loc = searchParams.get("location");
    const bud = searchParams.get("budget");
    const rat = searchParams.get("rating");
    if (category) setActiveCategory(category);
    if (q) setSearchQuery(q);
    setFilters({
      category: category || "all",
      location: loc,
      budget: bud,
      rating: rat,
    });
  }, [searchParams]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const getCategoryTitle = (id, defaultTitle) => {
    if (id === "all") return t("services", "popularLabel");
    if (id === "home-maintenance") return t("popular", "cardGawa");
    if (id === "cleaning") return t("popular", "cardLinis");
    if (id === "education") return t("popular", "cardAral");
    if (id === "personal-care") return t("popular", "cardGanda");
    if (id === "tech") return t("popular", "cardGadget");
    if (id === "delivery") return t("popular", "cardAbot");
    return defaultTitle;
  };

  const filteredOffers = useMemo(() => {
    return SERVICE_OFFERS.filter((offer) => {
      const matchesCategory =
        activeCategory === "all" || offer.category === activeCategory;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesName = offer.name.toLowerCase().includes(lowerQuery);
      const matchesProvider = offer.provider.toLowerCase().includes(lowerQuery);
      const matchesTags = offer.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerQuery),
      );
      const matchesLocation =
        !filters.location || offer.location === filters.location;
      // Rating filter
      let matchesRating = true;
      if (filters.rating && filters.rating !== "All") {
        const minRating = parseFloat(filters.rating);
        matchesRating = offer.rating >= minRating;
      }

      // Budget filter
      let matchesBudget = true;
      if (filters.budget) {
        const price = parseInt(offer.price.replace(/[^\d]/g, ""), 10);
        if (filters.budget === "b1") matchesBudget = price <= 1000;
        else if (filters.budget === "b2")
          matchesBudget = price > 1000 && price <= 3000;
        else if (filters.budget === "b3") matchesBudget = price > 3000;
      }
      return (
        matchesCategory &&
        (matchesName || matchesProvider || matchesTags) &&
        matchesLocation &&
        matchesRating &&
        matchesBudget
      );
    });
  }, [activeCategory, searchQuery, filters]);

  return (
    <div className="min-h-screen bg-brand-surface-container font-sans flex flex-col">
      <Navbar />

      {/* Hero & Search */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight"
          >
            {t("services", "headerTitle")}
          </motion.h1>

          <div className="relative max-w-3xl mx-auto mt-12 group">
            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors duration-300">
              <Search size={24} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                updateFilters("q", e.target.value);
              }}
              placeholder={t("services", "searchPlaceholder")}
              className="w-full bg-white border-2 border-gray-100 rounded-[2.5rem] py-6 pl-16 pr-48 outline-none focus:border-brand-primary/50 focus:ring-[12px] focus:ring-brand-primary/5 transition-all shadow-2xl shadow-gray-200/50 text-xl font-medium placeholder:text-gray-300"
            />

            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-primary text-white px-10 py-4 rounded-[2rem] font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-brand-primary/30">
              {t("services", "searchBtn")}
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Category Bar */}
      <div className="sticky top-[73px] z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-center flex-wrap gap-2 md:gap-4">
          {CATEGORIES.slice(0, 7).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                updateFilters("category", cat.id);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border-2 ${
                activeCategory === cat.id
                  ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                  : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <cat.icon size={14} />
              {getCategoryTitle(cat.id, cat.title)}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar / Filters */}
          <aside className="hidden lg:block w-72 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-10">
              <div>
                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                  <Filter size={14} className="text-brand-primary" />
                  {t("services", "filterTitle")}
                </h4>

                <div className="space-y-10">
                  {/* Rating Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      {t("services", "ratingLabel")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["4.5+", "4.0+", "3.5+", "All"].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateFilters("rating", r)}
                          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            filters.rating === r ||
                            (r === "All" && !filters.rating)
                              ? "bg-brand-primary/10 border-brand-primary text-brand-primary"
                              : "border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      {t("services", "priceLabel")}
                    </label>
                    <div className="space-y-3">
                      {[
                        { label: "₱0 - ₱1,000", id: "b1" },
                        { label: "₱1,000 - ₱3,000", id: "b2" },
                        { label: "₱3,000+", id: "b3" },
                      ].map((range) => (
                        <label
                          key={range.id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-5 h-5 rounded-md border-2 border-gray-100 flex items-center justify-center group-hover:border-brand-primary transition-all">
                            <div
                              className={`w-2 h-2 bg-brand-primary rounded-sm transition-opacity ${filters.budget === range.id ? "opacity-100" : "opacity-0 group-hover:opacity-20"}`}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-semibold uppercase tracking-wide transition-colors ${filters.budget === range.id ? "text-brand-primary" : "text-gray-500 group-hover:text-gray-900"}`}
                          >
                            {range.label}
                          </span>
                          <input
                            type="radio"
                            className="hidden"
                            name="budget"
                            onChange={() => updateFilters("budget", range.id)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      {t("services", "locationLabel")}
                    </label>
                    <div className="space-y-2">
                      <select
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none cursor-pointer"
                        value={filters.location || ""}
                        onChange={(e) =>
                          updateFilters("location", e.target.value || null)
                        }
                      >
                        <option value="">{t("services", "locationAll")}</option>
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

            <div
              className="p-8 bg-gray-900 rounded-[2.5rem] text-white relative overflow-hidden group cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary opacity-20 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h4 className="font-bold text-xl mb-3 relative z-10">
                {t("services", "partnerTitle")}
              </h4>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed relative z-10">
                {t("services", "partnerDesc")}
              </p>
              <button className="bg-brand-primary text-white w-full py-4 rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/10 flex items-center justify-center gap-2 group-hover:bg-brand-primary/80 transition-all">
                {t("services", "partnerBtn")}
                <ArrowRight size={16} />
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeCategory === "all"
                  ? t("services", "popularLabel")
                  : getCategoryTitle(
                      activeCategory,
                      CATEGORIES.find((c) => c.id === activeCategory)?.title ||
                        "",
                    )}
                <span className="ml-3 text-sm font-medium text-gray-400 uppercase tracking-widest">
                  {filteredOffers.length} {t("services", "resultsLabel")}
                </span>
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
                    onClick={() => navigate("/signup")}
                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={offer.img}
                        alt={offer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {offer.sukiCount > 100 && (
                          <div className="bg-brand-accent/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-white/20">
                            <Heart size={10} fill="currentColor" />
                            Suki Favorite
                          </div>
                        )}
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <div className="bg-white/95 backdrop-blur shadow-sm px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ring-1 ring-black/5">
                          <Star
                            size={12}
                            className="text-yellow-400 fill-yellow-400"
                          />
                          {offer.rating}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ring-1 ring-white/20">
                          {getCategoryTitle(
                            offer.category,
                            CATEGORIES.find((c) => c.id === offer.category)
                              ?.title || "",
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors leading-snug flex-1 pr-4">
                          {offer.name}
                        </h3>
                        {offer.isVerified && (
                          <ShieldCheck
                            size={20}
                            className="text-blue-500 fill-blue-50 flex-shrink-0"
                            title="Verified Provider"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {offer.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-wider"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          {offer.provider}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {offer.location}
                        </span>
                      </div>

                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                            Start sa
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-gray-900">
                              {offer.price}
                            </span>
                            <span className="text-xs text-gray-400 font-medium lowercase">
                              / {offer.unit}
                            </span>
                          </div>
                        </div>
                        <button className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:bg-brand-primary transition-all shadow-lg shadow-gray-200">
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("services", "emptyTitle")}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                  {t("services", "emptyDesc")}
                </p>
                <button
                  onClick={() => {
                    navigate("/services");
                  }}
                  className="mt-8 text-brand-primary font-bold hover:underline"
                >
                  {t("services", "emptyBtn")}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("services", "whyTitle")}
            </h2>
            <p className="text-gray-600 font-medium">
              {t("services", "whyDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: ShieldCheck,
                title: t("services", "feat1Title"),
                desc: t("services", "feat1Desc"),
                color: "text-blue-500",
              },
              {
                icon: Clock,
                title: t("services", "feat2Title"),
                desc: t("services", "feat2Desc"),
                color: "text-brand-primary",
              },
              {
                icon: CheckCircle2,
                title: t("services", "feat3Title"),
                desc: t("services", "feat3Desc"),
                color: "text-purple-500",
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center group">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform`}
                >
                  <feature.icon size={32} className={feature.color} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-gray-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>

          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">
              {t("services", "ctaTitle")}
            </h2>
            <p className="text-gray-400 text-lg mb-10 font-medium">
              {t("services", "ctaDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/signup?type=client")}
                className="bg-brand-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-brand-primary/20"
              >
                {t("services", "ctaBtn")}
              </button>
            </div>
          </div>

          <div className="relative z-10 lg:pr-12 hidden lg:block">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 max-w-xs rotate-3 animate-float">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
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
                <div className="h-4 w-12 bg-brand-primary/40 rounded"></div>
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
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                <img
                  src="/assets/logo.png"
                  alt="Lingkod Hub Logo"
                  className="w-[160%] h-[160%] max-w-none object-cover"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">
                Lingkod Hub
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-medium">
              {t("services", "footerDesc")}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h5 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">
                Marketplace
              </h5>
              <ul className="space-y-4 text-sm text-gray-500 font-bold">
                <li>
                  <button
                    onClick={() => {
                      setActiveCategory("all");
                      window.scrollTo(0, 0);
                    }}
                    className="hover:text-brand-primary transition-colors"
                  >
                    Browse All
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveCategory("home-maintenance");
                      window.scrollTo(0, 0);
                    }}
                    className="hover:text-brand-primary transition-colors"
                  >
                    Home Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveCategory("cleaning");
                      window.scrollTo(0, 0);
                    }}
                    className="hover:text-brand-primary transition-colors"
                  >
                    Cleaning
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">
                Community
              </h5>
              <ul className="space-y-4 text-sm text-gray-500 font-bold">
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-brand-primary transition-colors"
                  >
                    Trust & Safety
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-brand-primary transition-colors text-brand-accent"
                  >
                    Maging Lingkod Partner
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="hover:text-brand-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-bold">
          <p>{t("services", "footerCopy")}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
