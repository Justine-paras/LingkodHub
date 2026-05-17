import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'taglish' | 'english';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: string, key: string) => string;
}

const translations: Record<Language, Record<string, Record<string, string>>> = {
  taglish: {
    nav: {
      findServices: "Maghanap ng Serbisyo",
      aboutUs: "Tungkol sa Amin",
      howItWorks: "Paano Gumagana?",
      login: "Mag-login",
      getStarted: "Simulan Na",
      dashboard: "Dashboard",
      logout: "Logout ng Account",
      goToDashboard: "Pumunta sa Dashboard",
      registerFree: "Mag-register na (Libre lang!)",
      providerLogin: "Login sa Account",
    },
    hero: {
      tag: "Trusted ng Kapitbahay",
      title1: "Maaasahang Tulong,",
      title2: "Mula sa Kapitbahay.",
      desc: "From aircon cleaning to home repairs, we connect you with the best local talents in your area. Safe, mabilis, at abot-kaya.",
      placeholderSearch: "Anong service ang kailangan mo?",
      placeholderLocation: "Saan ka banda?",
      searchBtn: "Hanap Na"
    },
    popular: {
      tag: "Top Picks",
      title: "Mga Suki na Serbisyo",
      desc: "Ang pinaka-book na services sa iyong barangay ngayong linggo.",
      cardGawa: "Gawaing Bahay & Repairs",
      cardLinis: "Linis & Laba",
      cardGanda: "Ganda & Health",
      cardGadget: "Gadget & Tech",
      cardAral: "Aral & Tutorials",
      cardAbot: "Abot & Delivery",
      hoverText: "Tingnan ang mga Suki →"
    },
    suki: {
      tag: "Ang \"Suki\" System",
      title1: "Hindi lang basta service,",
      title2: "ka-Suki na yan.",
      desc: "Sa Lingkod Hub, we value long-term trust. Our \"Suki\" system helps you find providers who are already trusted by your neighbors. Repeat bookings mean higher trust scores!",
      badgeTag: "Suki Rating",
      badgeTitle: "Top Trusted",
      benefit1Title: "Subok na ng Marami",
      benefit1Desc: "See providers with high repeat booking rates in your barangay.",
      benefit2Title: "Suki Discounts",
      benefit2Desc: "Get special rates and priority booking from your favorite partners.",
      benefit3Title: "Trusted Kapitbahay",
      benefit3Desc: "Read reviews from real neighbors you can actually trust."
    },
    trust: {
      tag: "Siguradong Safe Ka",
      title1: "Kampante ka sa",
      title2: "bawat booking.",
      desc: "Built on trust, localized for you. Every interaction is secured para iwas-stress at siguradong quality ang gawa.",
      card1Title: "Protektado Ka",
      card1Desc: "If something isn't right, handa ang aming team na ayusin ang dispute para sa'yo.",
      card1Tag: "100% Secure",
      card1Detail: "Service Protection",
      card2Title: "Verified Partners",
      card2Desc: "Lahat ng providers ay dumaan sa background check at Barangay verification.",
      card2Tag: "Subok na",
      card2Detail: "ID & Background Checked",
      card3Title: "Kausap na Tao",
      card3Desc: "Walang bots dito. Local support team ang sasagot sa kahit anong concern mo.",
      card3Tag: "24/7 Gising",
      card3Detail: "Chat, Email & Phone"
    },
    howItWorks: {
      tag: "Paano Gumagana?",
      title1: "Madali lang: 3 steps at",
      title2: "tapos ang trabaho.",
      desc: "Mabilis, safe, at seamless ang bawat transaction para direcho trabaho agad.",
      step1Title: "Mag-search ng Service",
      step1Desc: "I-browse ang mga categories o i-search ang specific na tulong na kailangan mo.",
      step2Title: "Pumili ng Suki",
      step2Desc: "I-compare ang mga profiles, basahin ang reviews ng mga kapitbahay, at piliin ang swak sa budget.",
      step3Title: "Book & Relax",
      step3Desc: "Mag-set ng schedule, magbayad nang safe, at i-enjoy ang trabahong pulido."
    },
    cta: {
      title: "Ready nang simulan ang project?",
      desc: "Maka-connect sa mga subok na service providers sa iyong barangay in minutes.",
      btn: "Simulan na!"
    },
    footer: {
      desc: "The Philippines' most trusted marketplace for reliable local services and skilled professionals.",
      copyright: "© 2026 Lingkod Hub Philippines. Ang inyong ka-Suki sa serbisyo.",
      becomePartner: "Maging Lingkod Partner"
    },
    about: {
      tag: "Ang Aming Misyon",
      title1: "Kausap na tulong,",
      title2: "mapagkakatiwalaang gawa.",
      desc: "Ang Lingkod Hub ay isang community-driven platform para mapadali ang paghahanap at pag-hire ng mga local service professionals sa Pilipinas. Naniniwala kami sa kakayahan ng Pinoy at sa pagbibigay ng maaasahang tulong sa bawat tahanan.",
      valTrust: "Tiwala at Kaligtasan",
      valTrustDesc: "Bawat partner ay dumadaan sa verification process para masigurong ligtas at professional ang ating komunidad.",
      valComm: "Komunidad Muna",
      valCommDesc: "Inuuna namin ang pag-unlad ng komunidad sa pamamagitan ng pag-connect sa mga neighborhood experts at mga residente.",
      valQuality: "Kalidad na Serbisyo",
      valQualityDesc: "Sinisigurado ng ating review system na ang pinakamagagaling na serbisyo lang ang nangunguna.",
      visionTitle: "Gawa para sa kinabukasan ng lokal na trabaho.",
      visionDesc: "Sa pag-unlad ng digital landscape, nagbabago rin ang paraan ng pagtatrabaho. Ang Lingkod Hub ay nagbibigay ng modernong platform para sa mga self-employed partners upang pamahalaan ang kanilang business, makahanap ng bagong suki, at magpatuloy sa pag-asenso.",
      visionPoint1: "Ligtas na Digital Identity",
      visionPoint2: "Automated na Scheduling",
      visionPoint3: "Protektadong Pagbabayad",
      visionPoint4: "Direktang Chat sa Suki",
      visionBtn: "Simulan ang Iyong Journey",
      visionBadge: "Top Rated 2026",
      visionBadgeDesc: "Kinilala bilang pinakamabilis lumagong local service marketplace.",
      footerText: "© 2026 Lingkod Hub Philippines. All rights reserved."
    },
    services: {
      headerTitle: "Anong service ang kailangan mo ngayon?",
      searchPlaceholder: "Mag-search ng serbisyo (e.g. 'Aircon cleaning', 'Plumbing')",
      searchBtn: "Hanapin",
      filterTitle: "I-filter ang Resulta",
      ratingLabel: "Minimum Rating",
      priceLabel: "Presyo (Budget)",
      locationLabel: "Saan ka banda?",
      locationAll: "Lahat ng Area",
      partnerTitle: "Maging Lingkod Partner?",
      partnerDesc: "Sumali sa 5,000+ local experts sa area mo.",
      partnerBtn: "Maging Partner Na",
      resultsLabel: "Resulta",
      popularLabel: "Mga Suki na Serbisyo",
      emptyTitle: "Walang nahanap na serbisyo",
      emptyDesc: "Subukan ang ibang keywords o i-clear ang filters para makita ang iba pang options.",
      emptyBtn: "I-clear ang lahat ng filters",
      whyTitle: "Bakit Lingkod Hub ang piliin?",
      whyDesc: "Ang pinakaligtas at pinakamabilis na paraan para mag-hire ng local partners.",
      feat1Title: "Identity Verified",
      feat1Desc: "Lahat ng partners ay dumaan sa background at identity check ng barangay.",
      feat2Title: "Mabilis na Sagot",
      feat2Desc: "Makakuha ng quotes at confirmations sa loob ng ilang minuto, hindi araw.",
      feat3Title: "Quality Guarantee",
      feat3Desc: "Secure payments at totoong suporta para siguradong happy ka.",
      ctaTitle: "May ibang kailangan?",
      ctaDesc: "Mag-post ng custom request at hayaan ang mga verified pros na mag-bid sa project mo. Swak sa budget, swak sa quality.",
      ctaBtn: "Mag-post ng Job Request",
      footerDesc: "Empowering local service professionals and connecting them with customers through a secure, reliable marketplace.",
      footerCopy: "© 2026 Lingkod Hub. Ang inyong ka-Suki sa neighborhood."
    },
    auth: {
      loginHeader: "Welcome Back, Ka-Suki!",
      loginSub: "I-enter ang iyong details para ma-access ang account.",
      emailLabel: "Email Address",
      passLabel: "Password",
      signinBtn: "Mag-login",
      signinginBtn: "Sinisign-in...",
      noAccount: "Walang account?",
      signupLink: "Mag-register",
      signupHeaderClient: "Mag-create ng Account",
      signupHeaderProvider: "Provider Onboarding",
      step1Sub: "Pumili kung paano mo gustong gamitin ang Lingkod Hub",
      step2Sub: "Sabihin sa amin ang higit pa tungkol sa iyo",
      step3SubClient: "I-setup ang iyong profile picture at basic info",
      step3SubProvider: "Mag-upload ng profile photo at professional bio",
      step4Sub: "I-define ang iyong service area at expertise",
      step5Sub: "I-verify ang iyong identity para sa kaligtasan ng komunidad",
      step6Sub: "Basahin ang aming professional standards",
      hireTitle: "Mag-hire ng Talent",
      hireDesc: "Naghahanap ako ng professional services para sa aking bahay o business.",
      workTitle: "Maghanap ng Trabaho",
      workDesc: "Gusto kong i-alok ang aking skills at kumita bilang verified provider.",
      firstName: "Pangalan (First Name)",
      lastName: "Apelyido (Last Name)",
      continueBtn: "Magpatuloy",
      backBtn: "Bumalik",
      avatarTitle: "Mag-upload ng Profile Photo",
      phoneLabel: "Mobile Number",
      locLabel: "Lokasyon",
      bioLabel: "Maikling Bio / Tungkol sa Akin",
      tosAgree: "Sumasang-ayon ako sa Terms of Service at patakaran ng platform.",
      tosLink: "Terms of Service",
      regSuccess: "Matagumpay ang iyong Registration!",
      redirecting: "Welcome sa Lingkod Hub. Dinidirekta ka na sa iyong dashboard...",
      submitReg: "Kumpletuhin ang Registration"
    }
  },
  english: {
    nav: {
      findServices: "Find Services",
      aboutUs: "About Us",
      howItWorks: "How It Works",
      login: "Login",
      getStarted: "Get Started",
      dashboard: "Dashboard",
      logout: "Log Out",
      goToDashboard: "Go to Dashboard",
      registerFree: "Register Now (It's Free!)",
      providerLogin: "Provider Login",
    },
    hero: {
      tag: "Trusted by Neighbors",
      title1: "Reliable Services,",
      title2: "Right Next Door.",
      desc: "From aircon cleaning to home repairs, we connect you with the best local talents in your area. Safe, fast, and affordable.",
      placeholderSearch: "What service do you need?",
      placeholderLocation: "Where are you located?",
      searchBtn: "Search Now"
    },
    popular: {
      tag: "Top Picks",
      title: "Popular Services",
      desc: "The most booked services in your neighborhood this week.",
      cardGawa: "Home Maintenance & Repairs",
      cardLinis: "Cleaning & Laundry",
      cardGanda: "Beauty & Wellness",
      cardGadget: "Gadget & Tech Support",
      cardAral: "Academic Tutoring",
      cardAbot: "Errands & Delivery",
      hoverText: "View Local Favorites →"
    },
    suki: {
      tag: "The \"Suki\" System",
      title1: "Not just a service,",
      title2: "they're your regular partner.",
      desc: "At Lingkod Hub, we value long-term trust. Our \"Suki\" system helps you find providers who are already trusted by your neighbors. Repeat bookings mean higher trust scores!",
      badgeTag: "Suki Rating",
      badgeTitle: "Top Trusted",
      benefit1Title: "Proven and Tested",
      benefit1Desc: "See providers with high repeat booking rates in your neighborhood.",
      benefit2Title: "Loyalty Discounts",
      benefit2Desc: "Get special rates and priority booking from your favorite partners.",
      benefit3Title: "Trusted Neighbors",
      benefit3Desc: "Read reviews from real neighbors you can actually trust."
    },
    trust: {
      tag: "Rest Assured You're Safe",
      title1: "Peace of mind in",
      title2: "every booking.",
      desc: "Built on trust, localized for you. Every interaction is secured for a stress-free and high-quality service.",
      card1Title: "You're Protected",
      card1Desc: "If something isn't right, our team is ready to resolve the dispute for you.",
      card1Tag: "100% Secure",
      card1Detail: "Service Protection",
      card2Title: "Verified Partners",
      card2Desc: "All service providers undergo background checks and Barangay verification.",
      card2Tag: "Tested",
      card2Detail: "ID & Background Checked",
      card3Title: "Real Human Support",
      card3Desc: "No bots here. Our local support team is ready to answer any of your concerns.",
      card3Tag: "24/7 Active",
      card3Detail: "Chat, Email & Phone"
    },
    howItWorks: {
      tag: "How It Works",
      title1: "Easy as 1-2-3: 3 steps and",
      title2: "the job is done.",
      desc: "Fast, safe, and seamless transactions so you can get the work done immediately.",
      step1Title: "Search for a Service",
      step1Desc: "Browse through our categories or search for the specific help you need.",
      step2Title: "Choose your Suki",
      step2Desc: "Compare profiles, read reviews from neighbors, and pick the one that fits your budget.",
      step3Title: "Book & Relax",
      step3Desc: "Schedule a date, pay securely, and enjoy high-quality results."
    },
    cta: {
      title: "Ready to start your project?",
      desc: "Connect with trusted service providers in your neighborhood in minutes.",
      btn: "Get Started Now!"
    },
    footer: {
      desc: "The Philippines' most trusted marketplace for reliable local services and skilled professionals.",
      copyright: "© 2026 Lingkod Hub Philippines. Your trusted local service partner.",
      becomePartner: "Become a Lingkod Partner"
    },
    about: {
      tag: "Our Mission",
      title1: "Connecting Filipinos to",
      title2: "trusted local expertise.",
      desc: "Lingkod Hub is a community-driven platform designed to simplify the way you find and hire local service professionals in the Philippines. We believe in empowering local talent and providing every household with reliable help.",
      valTrust: "Trust & Safety",
      valTrustDesc: "Every provider undergoes a verification process to ensure the community remains safe and professional.",
      valComm: "Community First",
      valCommDesc: "We prioritize local growth by connecting neighborhood experts with residents who need their skills.",
      valQuality: "Quality Service",
      valQualityDesc: "Our review system ensures that only the best services stay at the top, fostering excellence.",
      visionTitle: "Built for the future of local work.",
      visionDesc: "As the digital landscape evolves, so does the way we work. Lingkod Hub provides a modern infrastructure for self-employed professionals to manage their business, find new clients, and build a lasting reputation.",
      visionPoint1: "Verified Digital Identity",
      visionPoint2: "Automated Scheduling Systems",
      visionPoint3: "Fair Payment Protection",
      visionPoint4: "Direct Communication Channels",
      visionBtn: "Start your journey",
      visionBadge: "Top Rated 2026",
      visionBadgeDesc: "Recognized as the fastest growing local service marketplace.",
      footerText: "© 2026 Lingkod Hub Philippines. All rights reserved."
    },
    services: {
      headerTitle: "What service do you need today?",
      searchPlaceholder: "Search for a service (e.g. 'Aircon cleaning', 'Plumbing')",
      searchBtn: "Search",
      filterTitle: "Filter Results",
      ratingLabel: "Minimum Rating",
      priceLabel: "Price (Budget)",
      locationLabel: "Where are you located?",
      locationAll: "All Areas",
      partnerTitle: "Become a Lingkod Partner?",
      partnerDesc: "Join 5,000+ local experts in your area.",
      partnerBtn: "Become a Partner Now",
      resultsLabel: "Results",
      popularLabel: "Popular Services",
      emptyTitle: "No services found",
      emptyDesc: "Try other keywords or clear filters to see more options.",
      emptyBtn: "Clear all filters",
      whyTitle: "Why choose Lingkod Hub?",
      whyDesc: "The safest and most trusted way to hire local partners.",
      feat1Title: "Identity Verified",
      feat1Desc: "All partners undergo background and identity checks by local Barangay.",
      feat2Title: "Fast Response",
      feat2Desc: "Get quotes and confirmations within minutes, not days.",
      feat3Title: "Quality Guarantee",
      feat3Desc: "Secure payments and real support so you are always happy.",
      ctaTitle: "Need something else?",
      ctaDesc: "Post a custom request and let verified pros bid on your project. Fits your budget, fits your quality.",
      ctaBtn: "Post a Job Request",
      footerDesc: "Empowering local service professionals and connecting them with customers through a secure, reliable marketplace.",
      footerCopy: "© 2026 Lingkod Hub. Your trusted neighborhood helper."
    },
    auth: {
      loginHeader: "Welcome back",
      loginSub: "Enter your details to access your account.",
      emailLabel: "Email address",
      passLabel: "Password",
      signinBtn: "Sign in",
      signinginBtn: "Signing in...",
      noAccount: "Don't have an account?",
      signupLink: "Sign up",
      signupHeaderClient: "Create an account",
      signupHeaderProvider: "Provider Onboarding",
      step1Sub: "Choose how you want to use Lingkod Hub",
      step2Sub: "Tell us a bit more about yourself",
      step3SubClient: "Setup your basic profile",
      step3SubProvider: "Add a profile picture and professional bio",
      step4Sub: "Define your service area and expertise",
      step5Sub: "Verify your identity for platform safety",
      step6Sub: "Review our professional standards",
      hireTitle: "Hire Talent",
      hireDesc: "I'm looking for professional services for my home or business.",
      workTitle: "Find Work",
      workDesc: "I want to offer my skills and earn money as a verified provider.",
      firstName: "First Name",
      lastName: "Last Name",
      continueBtn: "Continue",
      backBtn: "Back",
      avatarTitle: "Upload Profile Photo",
      phoneLabel: "Phone Number",
      locLabel: "Location",
      bioLabel: "Professional Bio / About Me",
      tosAgree: "I agree to the Terms of Service and understand platform policies.",
      tosLink: "Terms of Service",
      regSuccess: "Registration Successful!",
      redirecting: "Welcome to Lingkod Hub. Redirecting to your dashboard...",
      submitReg: "Complete Registration"
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lingkod_language');
    return (saved === 'english' || saved === 'taglish') ? saved : 'taglish';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lingkod_language', lang);
  };

  const t = (section: string, key: string): string => {
    return translations[language]?.[section]?.[key] || translations['taglish']?.[section]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
