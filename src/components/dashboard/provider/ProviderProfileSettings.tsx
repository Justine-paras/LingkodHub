import React from 'react';
import { 
  Search, 
  X, 
  PlusCircle, 
  Camera, 
  Edit2, 
  MapPin, 
  Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../../services/api';
import { ALL_SERVICES } from '../../../constants';
import { InputGroup } from '../shared/InputGroup';
import { LegalModal } from '../shared/LegalModal';
import { PasswordModal } from '../shared/PasswordModal';

export const ProviderProfileSettings = () => {
  const [services, setServices] = React.useState<string[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [customService, setCustomService] = React.useState('');
  
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [aboutMe, setAboutMe] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [createdAt, setCreatedAt] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [serviceRadius, setServiceRadius] = React.useState(15);
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [isDocumentsVerified, setIsDocumentsVerified] = React.useState(false);
  const [isOTPSent, setIsOTPSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [documentStatus, setDocumentStatus] = React.useState('none');

  const [activeSettingsTab, setActiveSettingsTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean, type: 'privacy' | 'tos' }>({
    isOpen: false,
    type: 'privacy'
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [historyJobs, setHistoryJobs] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ avg_rating: 0, total_reviews: 0 });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getMe();
        setDisplayName(data.full_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setAboutMe(data.about_me || '');
        setAvatarUrl(data.avatar_url || '');
        setCreatedAt(data.created_at || '');
        setServiceRadius(data.service_radius || 15);
        setIsEmailVerified(!!data.is_email_verified);
        setIsDocumentsVerified(!!data.is_documents_verified);
        setDocumentStatus(data.document_status || 'none');

        const [history, reviews, userServices] = await Promise.all([
          api.getJobsByView('history'),
          api.getUserReviews(data.id),
          api.getMyServices()
        ]);

        setHistoryJobs(history);
        setStats(reviews);
        setServices(userServices.map((s: any) => s.name));
      } catch (error) {
        console.error('Failed to load provider profile data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedJobs = historyJobs.filter(j => j.status === 'completed');
  const memberSince = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024';

  const saveProfile = async () => {
    try {
      await api.updateMe({
        full_name: displayName,
        phone,
        location,
        about_me: aboutMe,
        service_radius: serviceRadius
      });
      setShowSuccess(true);
      window.dispatchEvent(new CustomEvent('profile-updated'));
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile', e);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleSendOTP = async () => {
    try {
      await api.sendOTP();
      setIsOTPSent(true);
    } catch (err) {
      alert('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    try {
      await api.verifyOTP(otpValue);
      setIsEmailVerified(true);
      setIsOTPSent(false);
      setOtpValue('');
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    } catch (err: any) {
      alert(err.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { status } = await api.uploadDocuments(file);
      setDocumentStatus(status);
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
      alert('Documents uploaded successfully! Waiting for verification.');
    } catch (err) {
      console.error('Document upload failed', err);
      alert('Failed to upload documents.');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { avatar_url } = await api.uploadAvatar(file);
      setAvatarUrl(avatar_url);
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (err) {
      console.error('Failed to upload avatar', err);
      alert('Failed to upload photo.');
    }
  };

  const calculateCompletion = () => {
    const fields = [
      { name: 'Display Name', value: displayName },
      { name: 'Phone Number', value: phone },
      { name: 'Location', value: location },
      { name: 'Professional Bio', value: aboutMe },
      { name: 'Profile Photo', value: avatarUrl },
      { name: 'Service Offerings', value: services.length > 0 },
      { name: 'Email Verified', value: isEmailVerified },
      { name: 'Identity Verified', value: isDocumentsVerified },
      { name: 'Documents Submitted', value: documentStatus !== 'none' }
    ];
    const filled = fields.filter(f => !!f.value).length;
    return {
      percentage: Math.round((filled / fields.length) * 100),
      missing: fields.filter(f => !f.value).map(f => f.name)
    };
  };

  const completion = calculateCompletion();

  const toggleService = async (service: string) => {
    let updatedServices: string[] = [];
    if (services.includes(service)) {
      updatedServices = services.filter(s => s !== service);
    } else {
      updatedServices = [...services, service];
    }
    setServices(updatedServices);
    await api.updateMyServices(updatedServices);
  };

  const addCustomService = async () => {
    if (customService.trim() && !services.includes(customService.trim())) {
      const updatedServices = [...services, customService.trim()];
      setServices(updatedServices);
      setCustomService('');
      await api.updateMyServices(updatedServices);
    }
  };

  const filteredServices = ALL_SERVICES.filter(s => 
    s.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-12 text-center text-brand-text-variant">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-12">
      <AnimatePresence>
        {isServiceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                  <h2 className="text-2xl font-bold text-brand-text-main">Manage Your Services</h2>
                  <p className="text-sm text-brand-text-variant font-medium">Update the services you can offer to clients</p>
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
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-brand-surface border-2 hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 border-brand-outline rounded-2xl focus:border-brand-primary transition-all text-sm font-medium shadow-sm outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredServices.map(service => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => toggleService(service)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${
                      services.includes(service)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm'
                        : 'border-brand-outline hover:border-brand-primary/50 text-brand-text-variant'
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{service}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-brand-outline">
                <div className="flex gap-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="Manually add a specialized service..."
                    value={customService}
                    onChange={e => setCustomService(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addCustomService()}
                    className="flex-1 px-5 py-3.5 bg-brand-surface border-2 border-brand-outline hover:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 rounded-xl text-sm font-medium focus:border-brand-primary outline-none transition-all shadow-sm"
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
                  Save Selection ({services.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text-main mb-2">Profile Settings</h1>
          <p className="text-sm text-brand-text-variant">Manage your account and personal details</p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-brand-text-variant mt-4 sm:mt-0">
            {isDocumentsVerified ? (
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-primary"></span> Verified Provider</span>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                   <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-accent"></span> Standard Provider</span>
                   {documentStatus === 'none' && (
                     <>
                       <input type="file" id="doc-upload" className="hidden" onChange={handleDocumentUpload} />
                       <button 
                         onClick={() => document.getElementById('doc-upload')?.click()}
                         className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider"
                       >
                         Verify Identity
                       </button>
                     </>
                   )}
                   {documentStatus === 'pending' && (
                     <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">Verification Pending</span>
                   )}
                </div>
                {!isEmailVerified && (
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] text-brand-text-variant italic">Email unverified</span>
                     {!isOTPSent ? (
                       <button onClick={handleSendOTP} className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider">Verify Email</button>
                     ) : (
                       <div className="flex items-center gap-1">
                          <input 
                            type="text" 
                            placeholder="OTP" 
                            className="w-12 px-1 py-0.5 text-[10px] border border-brand-outline rounded focus:outline-none" 
                            value={otpValue}
                            onChange={e => setOtpValue(e.target.value)}
                          />
                          <button onClick={handleVerifyOTP} className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider">Submit</button>
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}
        </div>
      </header>

      {/* Settings Tabs Container */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-brand-outline mb-8">
        <div className="flex gap-8 px-2">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'security', label: 'Security' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'privacy', label: 'Privacy' },
              { id: 'billing', label: 'Billing' },
              { id: 'location', label: 'Location' },
            ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveSettingsTab(tab.id)}
                 className={`pb-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                   activeSettingsTab === tab.id 
                     ? 'border-brand-primary text-brand-primary' 
                     : 'border-transparent text-brand-text-variant hover:text-brand-text-main hover:border-brand-outline'
                 }`}
               >
                 {tab.label}
               </button>
            ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-brand-surface-card border border-brand-outline p-8 rounded-2xl text-center shadow-sm">
                <div className="relative inline-block mb-6 group">
                   <div className="w-24 h-24 bg-brand-surface border border-brand-outline mx-auto flex items-center justify-center relative overflow-hidden rounded-full">
                        {avatarUrl ? (
                          <img 
                              src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:3000${avatarUrl}`} 
                              alt="Profile" 
                              className="w-full h-full object-cover transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <span className="text-2xl font-bold">{displayName.charAt(0)}</span>
                          </div>
                        )}
                    </div>
                    <input 
                      type="file" 
                      id="avatar-input" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                    />
                    <button 
                      type="button" 
                      onClick={() => document.getElementById('avatar-input')?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-brand-primary text-brand-surface rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                        <Camera size={14} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1 group max-w-[200px] mx-auto min-h-[32px]">
                   {isEditingName ? (
                      <input 
                         type="text" 
                         value={displayName}
                         onChange={(e) => setDisplayName(e.target.value)}
                         onBlur={() => setIsEditingName(false)}
                         onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                         autoFocus
                         className="text-lg font-medium text-brand-text-main bg-brand-surface border-b-2 border-brand-primary outline-none text-center px-1 py-0 w-full"
                      />
                   ) : (
                      <>
                         <h4 className="text-lg font-medium text-brand-text-main truncate" title={displayName}>{displayName}</h4>
                         <button onClick={() => setIsEditingName(true)} className="text-brand-text-variant opacity-0 group-hover:opacity-100 hover:text-brand-primary transition-all p-1 -mr-6 shrink-0" title="Edit Name">
                            <Edit2 size={16} />
                         </button>
                      </>
                   )}
                </div>
                <p className="text-sm text-brand-text-variant">Premium Provider</p>
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-brand-text-main">Profile Completion</h3>
                    <span className="text-sm font-bold text-brand-primary">{completion.percentage}%</span>
                </div>
                <div className="w-full bg-brand-outline/50 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-brand-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${completion.percentage}%` }}></div>
                </div>
                {completion.missing.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-brand-text-variant mb-2 uppercase tracking-wider">Missing Items</p>
                    <ul className="space-y-2">
                        {completion.missing.map(item => (
                          <li key={item} className="flex items-center gap-2 text-xs text-brand-text-main group cursor-pointer hover:text-brand-primary transition-colors">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent group-hover:scale-125 transition-transform"></div>
                              <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-semibold text-brand-text-main mb-4">Provider Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Jobs Completed</span>
                        <span className="text-brand-text-main font-medium">{completedJobs.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Avg. Rating</span>
                        <span className="text-brand-text-main font-medium">{stats.avg_rating.toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Member Since</span>
                        <span className="text-brand-text-main font-medium">{memberSince}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Fields */}
        <div className="md:col-span-2 bg-brand-surface-card border border-brand-outline rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-8 space-y-8 flex-1">
            {activeSettingsTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Full Name">
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                  />
                </InputGroup>

                <InputGroup label="Email Address" helper="You cannot change your email address right now.">
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full bg-brand-surface-container border border-brand-outline/40 rounded-xl px-4 py-3 text-brand-text-variant cursor-not-allowed opacity-70 text-sm"
                  />
                </InputGroup>

                <InputGroup label="Phone Number">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                  />
                </InputGroup>

                <InputGroup label="Location">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-variant" size={16} />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl pl-10 pr-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm"
                    />
                  </div>
                </InputGroup>

                <div className="col-span-1 md:col-span-2">
                  <InputGroup label="About Me / Professional Bio">
                    <textarea 
                      rows={4}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm leading-relaxed resize-none"
                    />
                  </InputGroup>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-brand-outline">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">My Service Offerings</h3>
                    <button 
                      type="button"
                      onClick={() => setIsServiceModalOpen(true)}
                      className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4"
                    >
                      <PlusCircle size={14} /> Update Services
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {services.map(service => (
                      <div key={service} className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-xl transition-all hover:bg-brand-primary/15">
                        <span className="text-xs font-bold text-brand-primary">{service}</span>
                        <button 
                          type="button"
                          onClick={() => toggleService(service)}
                          className="text-brand-primary/50 hover:text-brand-primary"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-xs text-brand-text-variant font-medium italic">No services selected. Add services to start receiving job alerts.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSettingsTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Security</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-text-main mb-1">Account Password</h4>
                      <p className="text-xs text-brand-text-variant">Change your password to keep your account secure.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
              </div>
            )}

            {activeSettingsTab === 'notifications' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Email Notifications</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">New Messages</h4>
                            <p className="text-xs text-brand-text-variant">Receive an email when clients message you.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Job Updates</h4>
                            <p className="text-xs text-brand-text-variant">Get notified when a job status changes or an offer is made.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Promotional Offers</h4>
                            <p className="text-xs text-brand-text-variant">Receive emails about new features, discounts, and platform updates.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Push Notifications</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Push Alerts</h4>
                            <p className="text-xs text-brand-text-variant">Allow the website to send you browser push notifications for real-time updates.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'privacy' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Profile Visibility</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Public Profile</h4>
                            <p className="text-xs text-brand-text-variant">Allow clients to find and view your public profile page.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Online Status</h4>
                            <p className="text-xs text-brand-text-variant">Show others when you are currently active on the platform.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={false} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Data & History</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm mb-4">
                     <div>
                        <h4 className="text-sm font-semibold text-brand-text-main mb-1">Download Account Data</h4>
                        <p className="text-xs text-brand-text-variant">Get a copy of all your job history, earnings, and account information.</p>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Request Data
                     </button>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'billing' && (
               <div className="space-y-8">
                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Payout Methods</h3>
                     <button type="button" className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                       + Add New Method
                     </button>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-[#0079C1] rounded flex items-center justify-center font-bold text-white text-xs italic">
                                GCash
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-brand-text-main mb-0.5">**** 6789</h4>
                               <p className="text-xs text-brand-text-variant">Connected wallet</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">Default</span>
                            <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Earnings History</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm overflow-hidden">
                      <table className="w-full text-left text-sm border-collapse">
                         <thead className="bg-brand-surface-container border-b border-brand-outline text-brand-text-variant text-xs uppercase">
                            <tr>
                               <th className="px-6 py-4 font-semibold">Date</th>
                               <th className="px-6 py-4 font-semibold">Description</th>
                               <th className="px-6 py-4 font-semibold">Amount</th>
                               <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-brand-outline text-brand-text-main">
                             {completedJobs.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-brand-surface-card transition-colors">
                                   <td className="px-6 py-4 whitespace-nowrap text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                                   <td className="px-6 py-4 font-medium">{tx.title}</td>
                                   <td className="px-6 py-4">₱{Number(tx.budget || 0).toLocaleString()}</td>
                                   <td className="px-6 py-4">
                                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Cleared</span>
                                   </td>
                                </tr>
                             ))}
                             {completedJobs.length === 0 && (
                                <tr>
                                   <td colSpan={4} className="px-6 py-8 text-center text-brand-text-variant italic text-xs">No completed jobs yet.</td>
                                </tr>
                             )}
                         </tbody>
                      </table>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'location' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Base of Operations</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0">
                           <MapPin className="text-brand-primary" size={24} />
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-brand-text-main mb-1">{location || 'Set your location'}</h4>
                           <p className="text-xs text-brand-text-variant">Primary service area</p>
                        </div>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Edit Address
                     </button>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Service Radius</h3>
                      <span className="text-xs font-bold text-brand-primary">{serviceRadius} km</span>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                      <p className="text-xs text-brand-text-variant mb-6">Set the maximum distance you are willing to travel for service requests from your base.</p>
                      <input 
                         type="range" 
                         min="1" 
                         max="50" 
                         value={serviceRadius}
                         onChange={(e) => setServiceRadius(parseInt(e.target.value))}
                         className="w-full h-2 bg-brand-outline rounded-lg appearance-none cursor-pointer accent-brand-primary"
                      />
                      <div className="flex justify-between text-xs text-brand-text-variant mt-2 font-medium">
                         <span>1 km</span>
                         <span>50 km</span>
                      </div>
                   </div>
                 </div>
               </div>
            )}
          </div>

           <div className="bg-brand-surface-container/50 px-6 py-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 border-t border-brand-outline">
             <div className="flex text-xs font-medium text-brand-text-variant text-center sm:text-left">
                <p>Provider data is protected and only shared with clients during active jobs.</p>
             </div>
            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto items-center">
                <AnimatePresence>
                  {showSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-sm font-bold text-brand-primary"
                    >
                      Successfully saved changes!
                    </motion.span>
                  )}
                </AnimatePresence>
                <button type="button" className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold text-brand-text-variant hover:text-brand-text-main hover:bg-brand-text-variant/10 rounded-xl transition-colors">
                Cancel
                </button>
                <button 
                  type="button" 
                  onClick={saveProfile}
                  className="flex-1 sm:flex-none px-8 py-2.5 bg-brand-primary text-white text-sm font-semibold hover:bg-[#059669] transition-all shadow-lg hover:shadow-brand-primary/20 rounded-xl"
                >
                Save Changes
                </button>
            </div>
          </div>
        </div>
      </motion.div>

      <LegalModal 
        isOpen={legalModal.isOpen} 
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
        type={legalModal.type} 
      />

      <footer className="mt-16 flex justify-between border-t border-brand-outline pt-8">
        <div className="flex gap-8 text-xs text-brand-text-variant font-medium">
          <button 
            onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })} 
            className="hover:text-brand-text-main transition-colors outline-none"
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setLegalModal({ isOpen: true, type: 'tos' })} 
            className="hover:text-brand-text-main transition-colors outline-none"
          >
            Terms of Service
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('change-tab', { detail: 'help' }))} 
            className="hover:text-brand-text-main transition-colors outline-none"
          >
            Help Center
          </button>
        </div>
        <div className="flex gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/20"></div>
        </div>
      </footer>
    </div>
  );
};
