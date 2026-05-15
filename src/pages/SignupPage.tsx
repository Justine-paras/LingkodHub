import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Shield, 
  FileText, 
  Camera,
  CheckCircle,
  AlertTriangle,
  Upload,
  Briefcase,
  Search,
  PlusCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_SERVICES, COMMON_SERVICES } from '../constants';

type AccountType = 'client' | 'provider';

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = React.useState(1);
  const [accountType, setAccountType] = React.useState<AccountType>(
    (searchParams.get('type') as AccountType) || 'client'
  );

  // Form State
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    avatarFile: null as File | null,
    aboutMe: '',
    email: '',
    password: '',
    phone: '',
    region: '',
    services: [] as string[],
    agreedToTOS: false,
    idType: 'National ID',
    paymentMethod: 'later',
  });

  const [isTOSOpen, setIsTOSOpen] = React.useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [customService, setCustomService] = React.useState('');
  const [error, setError] = React.useState('');

  const nextStep = () => { setError(''); setStep(prev => prev + 1); };
  const prevStep = () => { setError(''); setStep(prev => prev - 1); };

  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'client' && !formData.agreedToTOS) return;
    setError('');
    
    try {
      await api.register({
        role: accountType,
        full_name: `${formData.firstName} ${formData.lastName}`,
        avatar_url: formData.avatarUrl,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        location: formData.region || '',
        about_me: formData.aboutMe || '',
        payment_method: formData.paymentMethod || 'none'
      });

      if (formData.avatarFile) {
        await api.uploadAvatar(formData.avatarFile);
      }
      
      if (accountType === 'provider' && formData.services && formData.services.length > 0) {
        await api.updateMyServices(formData.services);
      }
      
      setIsSuccess(true);
      
      setTimeout(() => {
        if (accountType === 'provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  const stepsCount = accountType === 'provider' ? 5 : 4;

  const toggleService = (service: string) => {
    const current = formData.services;
    if (current.includes(service)) {
      setFormData({...formData, services: current.filter(s => s !== service)});
    } else {
      setFormData({...formData, services: [...current, service]});
    }
  };

  const addCustomService = () => {
    if (customService.trim() && !formData.services.includes(customService.trim())) {
      setFormData({...formData, services: [...formData.services, customService.trim()]});
      setCustomService('');
    }
  };

  const filteredServices = ALL_SERVICES.filter(s => 
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const renderProgress = () => (
    <div className="flex gap-2 mb-8 justify-center">
      {Array.from({ length: stepsCount }).map((_, i) => (
        <div 
          key={i} 
          className={`h-1.5 rounded-full transition-all duration-300 ${
            step > i + 1 ? 'w-8 bg-brand-primary' : 
            step === i + 1 ? 'w-12 bg-brand-primary' : 'w-4 bg-brand-outline'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-surface-container flex flex-col justify-center items-center p-6 py-20">
      <AnimatePresence>
        {isTOSOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTOSOpen(false)}
              className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8 lg:p-12 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-text-main">Terms of Service</h2>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsTOSOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-brand-surface-card flex items-center justify-center transition-colors text-brand-text-variant"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                <section className="space-y-3">
                  <h3 className="font-bold text-brand-text-main flex items-center gap-2">
                    <Shield size={16} className="text-brand-primary" /> 1. Platform Trust & Safety
                  </h3>
                  <p className="text-xs text-brand-text-variant leading-relaxed font-medium">
                    Lingkod Hub is a professional marketplace. Users are strictly prohibited from utilizing the platform to lure, harass, or endanger providers. Any attempt to solicit services for illegal activities, or to use the platform as a front for malicious intent, will result in immediate permanent account termination and coordination with local law enforcement.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-brand-text-main flex items-center gap-2">
                     <AlertTriangle size={16} className="text-brand-primary" /> 2. Prohibited Conduct
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Soliciting services outside the platform to bypass security and fees.",
                      "Providing false identity or location information.",
                      "Verbal or physical abuse towards any community member.",
                      "Failing to provide a safe working environment for hired professionals."
                    ].map((item, i) => (
                      <li key={i} className="text-[11px] text-brand-text-variant flex gap-2 font-medium">
                         <span className="text-brand-primary">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-3">
                  <h3 className="font-bold text-brand-text-main flex items-center gap-2">
                     <Lock size={16} className="text-brand-primary" /> 3. Data Privacy & Vulnerabilities
                  </h3>
                  <p className="text-xs text-brand-text-variant leading-relaxed font-medium">
                    We employ enterprise-grade encryption. However, users are responsible for maintaining the confidentiality of their credentials. Users must report any suspected system vulnerabilities or unauthorized access immediately. Exploiting or attempting to probe system vulnerabilities is an offense that leads to an irrevocable ban.
                  </p>
                </section>

                <section className="space-y-3">
                   <h3 className="font-bold text-brand-text-main flex items-center gap-2">
                      <CheckCircle size={16} className="text-brand-primary" /> 4. Payment Integrity
                   </h3>
                   <p className="text-xs text-brand-text-variant leading-relaxed font-medium">
                      Payments must be processed via the platform to ensure the 24-hour dispute window remains valid. Direct payments outside Lingkod Hub remove our ability to assist in cases of service failure or fraud.
                   </p>
                </section>

                <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                  <p className="text-[10px] text-brand-primary font-bold text-center uppercase tracking-widest leading-relaxed">
                    By clicking "I Agree", you acknowledge that Lingkod Hub reserves the right to suspend or ban users without prior notice if professional standards are breached.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsTOSOpen(false)}
                  className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                >
                  Close
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setFormData({...formData, agreedToTOS: true});
                    setIsTOSOpen(false);
                  }}
                  className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
                >
                  I Understand & Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsServiceModalOpen(false)}
              className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8 lg:p-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-text-main">All Services</h2>
                  <p className="text-sm text-brand-text-variant">Select all the skills you can offer to clients</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)} 
                  className="w-10 h-10 rounded-full hover:bg-brand-surface-card flex items-center justify-center text-brand-text-variant"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                <input 
                  type="text" 
                  placeholder="Search services (e.g. plumbing, tutor...)"
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredServices.map(service => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${
                      formData.services.includes(service)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-brand-outline hover:border-brand-primary/50 text-brand-text-variant'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{service}</span>
                  </button>
                ))}
                {filteredServices.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-brand-text-variant font-medium">No results for "{serviceSearch}"</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-brand-outline">
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="Don't see your skill? Add it here..."
                    value={customService}
                    onChange={e => setCustomService(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addCustomService()}
                    className="flex-1 px-5 py-3.5 bg-brand-surface-card border border-brand-outline rounded-xl text-sm font-medium focus:border-brand-primary transition-all shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={addCustomService}
                    disabled={!customService.trim()}
                    className="px-6 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#059669] transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <PlusCircle size={18} /> Add
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
                >
                  Apply Selected ({formData.services.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Link to="/" className="fixed top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-xl leading-none">L</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-brand-text-main">Lingkod Hub</span>
      </Link>

      <div className="w-full max-w-xl bg-brand-surface p-10 rounded-[2.5rem] border border-brand-outline shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-primary/5 rounded-full -ml-16 -mb-16 blur-3xl" />

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="animate-bounce" />
                </div>
                <h2 className="text-3xl font-bold text-brand-text-main mb-4">Registration Successful!</h2>
                <p className="text-brand-text-variant font-medium mb-8">
                  Welcome to Lingkod Hub, {formData.firstName}.<br />
                  Redirecting you to your {accountType} dashboard...
                </p>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                </div>
              </motion.div>
            ) : (
              <motion.div key="form">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-brand-text-main mb-2">
                    {accountType === 'provider' ? 'Provider Onboarding' : 'Create an account'}
                  </h1>
                  <p className="text-sm text-brand-text-variant font-medium">
                    {step === 1 && "Choose how you want to use Lingkod Hub"}
                    {step === 2 && "Tell us a bit more about yourself"}
                    {step === 3 && accountType === 'provider' && "Define your service area and expertise"}
                    {step === 4 && accountType === 'provider' && "Verify your identity for platform safety"}
                    {step === 5 && accountType === 'provider' && "Review our professional standards"}
                    {step === 4 && accountType === 'client' && "Setup your payment method"}
                  </p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
                
                {renderProgress()}

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => setAccountType('client')}
                            className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                              accountType === 'client' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                              accountType === 'client' ? 'bg-brand-primary text-white' : 'bg-brand-surface-container text-brand-text-variant group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
                            }`}>
                              <User size={24} />
                            </div>
                            <h3 className="font-bold text-brand-text-main mb-1">Hire Talent</h3>
                            <p className="text-[10px] text-brand-text-variant font-medium leading-relaxed">I'm looking for professional services for my home or business.</p>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setAccountType('provider')}
                            className={`p-6 rounded-3xl border-2 text-left transition-all group ${
                              accountType === 'provider' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                              accountType === 'provider' ? 'bg-brand-primary text-white' : 'bg-brand-surface-container text-brand-text-variant group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
                            }`}>
                              <Briefcase size={24} />
                            </div>
                            <h3 className="font-bold text-brand-text-main mb-1">Find Work</h3>
                            <p className="text-[10px] text-brand-text-variant font-medium leading-relaxed">I want to offer my skills and earn money as a verified provider.</p>
                          </button>
                        </div>

                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">First Name</label>
                              <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                                <input 
                                  type="text" 
                                  required
                                  value={formData.firstName}
                                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                                  placeholder="Juan"
                                  className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Last Name</label>
                              <input 
                                type="text" 
                                required
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                                placeholder="Dela Cruz"
                                className="w-full px-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          type="button" 
                          onClick={nextStep}
                          disabled={!formData.firstName || !formData.lastName}
                          className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue <ChevronRight size={18} />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                              <input 
                                type="email" 
                                required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="juan.delacruz@email.com"
                                className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Secure Password</label>
                            <div className="relative">
                              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                              <input 
                                type="password" 
                                required
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••••••"
                                className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                              />
                            </div>
                            
                            {/* Password Strength Meter */}
                            {formData.password && (
                              <div className="px-1 pt-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-variant">Strength</span>
                                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                                    formData.password.length < 8 ? 'text-red-500' : 
                                    formData.password.length < 10 ? 'text-orange-500' : 
                                    'text-brand-primary'
                                  }`}>
                                    {(() => {
                                      const s = formData.password.length;
                                      if (s === 0) return '';
                                      if (s < 6) return 'Very Weak';
                                      if (s < 8) return 'Weak';
                                      if (s < 12) return 'Fair';
                                      if (s < 16) return 'Good';
                                      return 'Strong';
                                    })()}
                                  </span>
                                </div>
                                <div className="flex gap-1 h-1.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ scaleX: 0 }}
                                      animate={{ 
                                        scaleX: 1,
                                        backgroundColor: 
                                          formData.password.length >= i * 3 ? '#22C55E' : 
                                          formData.password.length >= i * 2 ? '#EAB308' : 
                                          formData.password.length > 0 ? '#EF4444' : '#E5E7EB'
                                      }}
                                      className="flex-1 rounded-full h-full bg-brand-outline transition-colors duration-500"
                                    />
                                  ))}
                                </div>
                                <p className="text-[9px] text-brand-text-variant mt-2 leading-relaxed">
                                  Use 8+ characters with a mix of letters, numbers & symbols.
                                </p>
                              </div>
                            )}
                          </div>

                          {accountType === 'client' && (
                            <div className="pt-2">
                              <label className="flex items-start gap-3 p-4 bg-brand-surface-container border border-brand-outline rounded-2xl cursor-pointer group hover:bg-brand-surface transition-all">
                                <input 
                                  type="checkbox" 
                                  required
                                  checked={formData.agreedToTOS}
                                  onChange={e => setFormData({...formData, agreedToTOS: e.target.checked})}
                                  className="mt-1 w-5 h-5 rounded-md border-brand-outline text-brand-primary focus:ring-brand-primary transition-all" 
                                />
                                <div className="text-[11px] font-bold text-brand-text-main leading-relaxed">
                                  I agree to the <button type="button" onClick={() => setIsTOSOpen(true)} className="text-brand-primary hover:underline underline-offset-4">Terms of Service</button> and understand platform policies regarding professional conduct.
                                </div>
                              </label>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={prevStep}
                            className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all flex items-center justify-center gap-2"
                          >
                            <ChevronLeft size={18} /> Back
                          </button>
                          <button 
                            type="button" 
                            onClick={nextStep}
                            disabled={!formData.email || !formData.password || (accountType === 'client' && !formData.agreedToTOS)}
                            className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {accountType === 'provider' ? 'Next: Provider Info' : 'Next: Profile Info'} <ChevronRight size={18} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && accountType === 'client' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="flex flex-col items-center justify-center gap-2 mb-4">
                            <div className="relative w-24 h-24 rounded-full bg-brand-surface-card border-2 border-dashed border-brand-outline flex items-center justify-center overflow-hidden hover:border-brand-primary/50 transition-colors group cursor-pointer">
                              {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <Camera size={24} className="text-brand-text-variant group-hover:text-brand-primary transition-colors" />
                              )}
                              <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFormData({
                                      ...formData, 
                                      avatarFile: file,
                                      avatarUrl: URL.createObjectURL(file)
                                    });
                                  }
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-brand-text-variant">Upload Profile Picture</span>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Phone Number</label>
                            <div className="relative">
                              <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="+63 900 000 0000"
                                className="w-full px-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Location</label>
                            <div className="relative">
                              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                              <input 
                                type="text" 
                                value={formData.region}
                                onChange={e => setFormData({...formData, region: e.target.value})}
                                placeholder="Makati City, Metro Manila"
                                className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Short Bio</label>
                            <textarea 
                              rows={3}
                              value={formData.aboutMe}
                              onChange={e => setFormData({...formData, aboutMe: e.target.value})}
                              placeholder="Tell us a bit about what you're looking for..."
                              className="w-full px-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium resize-none" 
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={prevStep}
                            className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all flex items-center justify-center gap-2"
                          >
                            <ChevronLeft size={18} /> Back
                          </button>
                          <button 
                            type="button" 
                            onClick={nextStep}
                            className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            Next: Payment Method <ChevronRight size={18} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && accountType === 'client' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <label 
                            onClick={() => setFormData({...formData, paymentMethod: 'credit_card'})}
                            className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            formData.paymentMethod === 'credit_card' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'
                          }`}>
                            <div className="flex-1">
                              <h4 className="font-bold text-brand-text-main text-sm">Credit Card</h4>
                              <p className="text-[10px] font-medium text-brand-text-variant">Pay securely via Stripe</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.paymentMethod === 'credit_card' ? 'border-brand-primary' : 'border-brand-outline'
                            }`}>
                              {formData.paymentMethod === 'credit_card' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                            </div>
                          </label>

                          <label 
                            onClick={() => setFormData({...formData, paymentMethod: 'gcash'})}
                            className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            formData.paymentMethod === 'gcash' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'
                          }`}>
                            <div className="flex-1">
                              <h4 className="font-bold text-brand-text-main text-sm">GCash</h4>
                              <p className="text-[10px] font-medium text-brand-text-variant">Connect your e-wallet</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.paymentMethod === 'gcash' ? 'border-brand-primary' : 'border-brand-outline'
                            }`}>
                              {formData.paymentMethod === 'gcash' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                            </div>
                          </label>

                          <label 
                            onClick={() => setFormData({...formData, paymentMethod: 'later'})}
                            className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            formData.paymentMethod === 'later' ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-outline hover:border-brand-primary/50'
                          }`}>
                            <div className="flex-1">
                              <h4 className="font-bold text-brand-text-main text-sm">Set up later</h4>
                              <p className="text-[10px] font-medium text-brand-text-variant">I'll do this later from my dashboard</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              formData.paymentMethod === 'later' ? 'border-brand-primary' : 'border-brand-outline'
                            }`}>
                              {formData.paymentMethod === 'later' && <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
                            </div>
                          </label>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button 
                            type="button" 
                            onClick={handleSignup}
                            className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
                          >
                            Complete Registration <ChevronRight size={18} />
                          </button>
                          
                          <div className="flex gap-4">
                            <button 
                              type="button" 
                              onClick={prevStep}
                              className="flex-1 py-3 bg-brand-surface border border-brand-outline text-brand-text-variant text-xs font-bold rounded-xl hover:bg-brand-surface-card transition-all"
                            >
                              Back
                            </button>
                            <button 
                              type="button" 
                              onClick={() => {
                                setFormData({...formData, paymentMethod: 'later'});
                                handleSignup(new Event('submit') as any);
                              }}
                              className="flex-1 py-3 text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary/5 transition-all"
                            >
                              Skip for now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && accountType === 'provider' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Mobile Number</label>
                            <div className="relative">
                              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                              <input 
                                type="tel" 
                                required
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="+63 9XX XXX XXXX"
                                className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Coverage Region</label>
                            <div className="relative">
                              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-variant" />
                              <select 
                                value={formData.region}
                                onChange={e => setFormData({...formData, region: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 transition-all text-sm font-medium appearance-none"
                              >
                                <option value="">Select your city...</option>
                                <option value="Dasmariñas">Dasmariñas City</option>
                                <option value="Imus">Imus City</option>
                                <option value="Bacoor">Bacoor City</option>
                                <option value="General Trias">General Trias</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-end ml-1 mb-2">
                              <label className="text-xs font-bold text-brand-text-main uppercase tracking-widest">Services You Offer</label>
                              <button 
                                type="button"
                                onClick={() => setIsServiceModalOpen(true)}
                                className="text-[10px] font-bold text-brand-primary hover:underline hover:underline-offset-4"
                              >
                                Browse All
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {COMMON_SERVICES.map(service => (
                                <button
                                  type="button"
                                  key={service}
                                  onClick={() => toggleService(service)}
                                  className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                    formData.services.includes(service) 
                                      ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                                      : 'bg-brand-surface border-brand-outline text-brand-text-variant hover:border-brand-primary'
                                  }`}
                                >
                                  {service}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => setIsServiceModalOpen(true)}
                                className="px-4 py-2 rounded-xl text-[11px] font-bold border border-dashed border-brand-outline text-brand-text-variant hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-1.5"
                              >
                                <PlusCircle size={14} /> More...
                              </button>
                            </div>

                            {formData.services.filter(s => !COMMON_SERVICES.includes(s)).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-brand-outline border-dashed">
                                 <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-3">Your Additional Skills</p>
                                 <div className="flex flex-wrap gap-2">
                                    {formData.services.filter(s => !COMMON_SERVICES.includes(s)).map(service => (
                                      <div key={service} className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/20 px-3 py-1.5 rounded-lg">
                                        <span className="text-[11px] font-bold text-brand-primary">{service}</span>
                                        <button 
                                          type="button" 
                                          onClick={() => toggleService(service)}
                                          className="text-brand-primary/60 hover:text-brand-primary transition-colors"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={prevStep}
                            className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            onClick={nextStep}
                            disabled={!formData.phone || !formData.region || formData.services.length === 0}
                            className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all disabled:opacity-50"
                          >
                            Next: Identity Check
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 4 && accountType === 'provider' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl">
                           <div className="flex gap-4 mb-4">
                              <Shield className="text-brand-primary shrink-0" size={24} />
                              <div>
                                 <h4 className="font-bold text-brand-text-main text-sm">Identity Verification</h4>
                                 <p className="text-[10px] text-brand-text-variant font-medium leading-relaxed mt-1">To maintain a safe community, we require all providers to submit valid government documentation. This data is encrypted and discarded after verification.</p>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="aspect-[4/3] bg-brand-surface-card border-2 border-dashed border-brand-outline rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-brand-primary transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-brand-surface-container flex items-center justify-center text-brand-text-variant group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                                   <Upload size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest">ID Front View</span>
                             </div>
                             <div className="aspect-[4/3] bg-brand-surface-card border-2 border-dashed border-brand-outline rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-brand-primary transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-brand-surface-container flex items-center justify-center text-brand-text-variant group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                                   <Camera size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest">Verification Selfie</span>
                             </div>
                          </div>
                          
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-brand-text-main ml-1 uppercase tracking-widest">Document Type</label>
                             <select 
                              value={formData.idType}
                              onChange={e => setFormData({...formData, idType: e.target.value})}
                              className="w-full px-5 py-4 bg-brand-surface-card border border-brand-outline rounded-2xl text-sm font-medium appearance-none"
                             >
                                <option>National ID (PhilID)</option>
                                <option>Driver's License</option>
                                <option>Passport</option>
                                <option>UMID</option>
                             </select>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={prevStep}
                            className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            onClick={nextStep}
                            className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
                          >
                            Next: Legal Agreement
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 5 && accountType === 'provider' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="bg-brand-surface-card border border-brand-outline rounded-3xl p-6 h-[250px] overflow-y-auto space-y-6 custom-scrollbar">
                           <div>
                              <h4 className="text-sm font-extrabold text-brand-text-main mb-3 flex items-center gap-2">
                                 <FileText size={16} className="text-brand-primary" /> Professional Conduct & Liability
                              </h4>
                              <div className="space-y-4">
                                 <p className="text-[11px] leading-relaxed text-brand-text-variant font-medium">
                                    By registering as a Provider on Lingkod Hub, you explicitly agree to our strict verification and monitoring protocols.
                                 </p>
                                 <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3">
                                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                    <p className="text-[10px] text-red-600 font-bold leading-relaxed lowercase italic">
                                       Verified criminal history, identity theft, or platform circumvention (side-deals) will result in an immediate permanent ban and forfeiture of all pending earnings.
                                    </p>
                                 </div>
                                 <p className="text-[11px] leading-relaxed text-brand-text-variant font-medium">
                                    Providers act as independent contractors. You are responsible for your own safety equipment and specialized tools. Lingkod Hub provides the marketplace and dispute protection but does not act as your direct employer.
                                 </p>
                                 <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-brand-text-main italic">
                                       <CheckCircle size={12} className="text-[#059669]" /> Account verification takes 24-48 hours.
                                    </li>
                                    <li className="flex items-center gap-2 text-[10px] font-bold text-brand-text-main italic">
                                       <CheckCircle size={12} className="text-[#059669]" /> Weekly payouts require verified GCash/Bank accounts.
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>

                        <label className="flex items-start gap-3 p-4 bg-brand-surface-container border border-brand-outline rounded-2xl cursor-pointer group hover:bg-brand-surface transition-all">
                          <input 
                            type="checkbox" 
                            required
                            checked={formData.agreedToTOS}
                            onChange={e => setFormData({...formData, agreedToTOS: e.target.checked})}
                            className="mt-1 w-5 h-5 rounded-md border-brand-outline text-brand-primary focus:ring-brand-primary transition-all" 
                          />
                          <span className="text-[11px] font-bold text-brand-text-main leading-relaxed group-hover:text-brand-primary transition-colors">
                            I have read, understood, and agree to the <button type="button" onClick={() => setIsTOSOpen(true)} className="text-brand-primary hover:underline">Provider Terms of Service</button>, Professional Code of Conduct, and Dispute Resolution Policy.
                          </span>
                        </label>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={prevStep}
                            className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-surface-card transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            onClick={handleSignup}
                            disabled={!formData.agreedToTOS}
                            className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all disabled:opacity-50"
                          >
                            Create Provider Account
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <div className="mt-10 text-center">
                  <p className="text-xs text-brand-text-variant font-medium">
                    Already have an account? <Link to="/login" className="text-brand-primary font-bold hover:underline">Sign in</Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
