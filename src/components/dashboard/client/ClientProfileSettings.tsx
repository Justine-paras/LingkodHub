import React from 'react';
import { 
  X, 
  PlusCircle, 
  Camera, 
  Edit2, 
  MapPin, 
  Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../../services/api';
import { InputGroup } from '../shared/InputGroup';
import { LegalModal } from '../shared/LegalModal';
import { PasswordModal } from '../shared/PasswordModal';

export const ClientProfileSettings = () => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [aboutMe, setAboutMe] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [jobsCount, setJobsCount] = React.useState(0);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [isOTPSent, setIsOTPSent] = React.useState(false);
  const [otpValue, setOtpValue] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);

  const [activeSettingsTab, setActiveSettingsTab] = React.useState('profile');
  const [isLoading, setIsLoading] = React.useState(true);
  const [legalModal, setLegalModal] = React.useState<{ isOpen: boolean, type: 'privacy' | 'tos' }>({
    isOpen: false,
    type: 'privacy'
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Load profile from Backend
    const loadData = async () => {
      try {
        const [userData, jobs] = await Promise.all([
          api.getMe(),
          api.getJobs({ view: 'my_posts' })
        ]);
        
        setDisplayName(userData.full_name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setLocation(userData.location || '');
        setAboutMe(userData.about_me || '');
        setAvatarUrl(userData.avatar_url || '');
        setJobsCount(jobs.length || 0);
        setIsEmailVerified(!!userData.is_email_verified);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveProfile = async () => {
    try {
      await api.updateMe({
        full_name: displayName,
        phone,
        location,
        about_me: aboutMe
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
      { name: 'About Me', value: aboutMe },
      { name: 'Profile Photo', value: avatarUrl },
      { name: 'Email Verified', value: isEmailVerified }
    ];
    const filled = fields.filter(f => !!f.value).length;
    return {
      percentage: Math.round((filled / fields.length) * 100),
      missing: fields.filter(f => !f.value).map(f => f.name)
    };
  };

  const completion = calculateCompletion();

  if (isLoading) {
    return <div className="p-12 text-center text-brand-text-variant">Loading profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-12">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text-main mb-2">Profile Settings</h1>
          <p className="text-sm text-brand-text-variant">Manage your account and personal details</p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-brand-text-variant mt-4 sm:mt-0">
            {isEmailVerified ? (
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-primary"></span> Verified User</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-accent"></span> Standard Account</span>
                {!isOTPSent ? (
                  <button 
                    onClick={handleSendOTP}
                    className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider"
                  >
                    Verify Now
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter OTP"
                      value={otpValue}
                      onChange={e => setOtpValue(e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-brand-outline rounded-md focus:border-brand-primary focus:outline-none"
                    />
                    <button 
                      onClick={handleVerifyOTP}
                      disabled={isVerifying}
                      className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Submit'}
                    </button>
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
                <p className="text-sm text-brand-text-variant">Homeowner</p>
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
                <h3 className="text-sm font-semibold text-brand-text-main mb-4">Account Stats</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Jobs Posted</span>
                        <span className="text-brand-text-main font-medium">{jobsCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-brand-text-variant">Member Since</span>
                        <span className="text-brand-text-main font-medium">Jan 2024</span>
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
                  <InputGroup label="About Me">
                    <textarea 
                      rows={4}
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="w-full bg-brand-surface border-2 border-brand-outline rounded-xl px-4 py-3 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 shadow-sm hover:shadow-md transition-all font-medium text-brand-text-main text-sm leading-relaxed resize-none"
                    />
                  </InputGroup>
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
                            <p className="text-xs text-brand-text-variant">Receive an email when providers message you.</p>
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
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Marketing Push</h4>
                            <p className="text-xs text-brand-text-variant">Receive occasional push notifications about local promotions and discounts.</p>
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
                            <p className="text-xs text-brand-text-variant">Allow other users to find and view your public profile page.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Show Location Status</h4>
                            <p className="text-xs text-brand-text-variant">Display your general location (e.g., Dasmariñas City) to help other users.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer outline-none">
                           <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                           <div className="w-11 h-6 bg-brand-surface border-2 border-brand-outline rounded-full peer peer-focus:ring-4 peer-focus:ring-brand-primary/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-text-variant peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:border-brand-primary shadow-sm transition-colors"></div>
                         </label>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="pr-4">
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Online Status</h4>
                            <p className="text-xs text-brand-text-variant">Show other users when you are currently active on the platform.</p>
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
                        <p className="text-xs text-brand-text-variant">Get a copy of all your job history, messages, and account information.</p>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Request Data
                     </button>
                   </div>
                   
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-red-50/50 border-2 border-red-200/50 rounded-2xl p-6 shadow-sm">
                     <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-1">Delete Account</h4>
                        <p className="text-xs text-red-600/80">Permanently remove your account and all associated data.</p>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-red-100 w-full sm:w-auto">
                        Delete Account
                     </button>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'billing' && (
               <div className="space-y-8">
                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Payment Methods</h3>
                     <button type="button" className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors">
                       + Add New Method
                     </button>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-brand-surface-card border border-brand-outline rounded flex items-center justify-center font-bold text-brand-text-main text-xs italic">
                                VISA
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-brand-text-main mb-0.5">Visa ending in 4242</h4>
                               <p className="text-xs text-brand-text-variant">Expires 12/28</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-1 rounded">Default</span>
                            <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-[#0079C1] rounded flex items-center justify-center font-bold text-white text-xs italic">
                                PayPal
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-brand-text-main mb-0.5">juan.delacruz@example.com</h4>
                               <p className="text-xs text-brand-text-variant">Connected account</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button type="button" className="text-xs font-bold text-brand-text-variant hover:text-brand-text-main transition-colors">
                               Make Default
                            </button>
                            <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                   </div>
                 </div>

                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Billing History</h3>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm overflow-hidden">
                      <table className="w-full text-left text-sm border-collapse">
                         <thead className="bg-brand-surface-container border-b border-brand-outline text-brand-text-variant text-xs uppercase">
                            <tr>
                               <th className="px-6 py-4 font-semibold">Date</th>
                               <th className="px-6 py-4 font-semibold">Description</th>
                               <th className="px-6 py-4 font-semibold">Amount</th>
                               <th className="px-6 py-4 font-semibold">Status</th>
                               <th className="px-6 py-4 font-semibold text-right">Receipt</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-brand-outline text-brand-text-main">
                            <tr className="hover:bg-brand-surface-card transition-colors">
                               <td className="px-6 py-4 whitespace-nowrap text-xs">Oct 24, 2023</td>
                               <td className="px-6 py-4 font-medium">Faucet Repair - Payment</td>
                               <td className="px-6 py-4">₱450.00</td>
                               <td className="px-6 py-4">
                                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Paid</span>
                               </td>
                               <td className="px-6 py-4 text-right">
                                  <button className="text-brand-primary hover:underline text-xs font-semibold">Download</button>
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                 </div>
               </div>
            )}

            {activeSettingsTab === 'location' && (
               <div className="space-y-8">
                 <div>
                   <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-4">Primary Address</h3>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-brand-surface border-2 border-brand-outline rounded-2xl p-6 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center shrink-0">
                           <MapPin className="text-brand-primary" size={24} />
                        </div>
                        <div>
                           <h4 className="text-sm font-semibold text-brand-text-main mb-1">Makati City, Metro Manila</h4>
                           <p className="text-xs text-brand-text-variant">123 Ayala Avenue, San Lorenzo</p>
                        </div>
                     </div>
                     <button type="button" className="shrink-0 px-6 py-2.5 bg-brand-surface-card border-2 border-brand-outline text-brand-text-main text-sm font-bold hover:border-brand-primary/50 hover:text-brand-primary transition-all rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/10 w-full sm:w-auto">
                        Edit Address
                     </button>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest">Saved Locations</h3>
                     <button type="button" className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                       <PlusCircle size={14} /> Add New Location
                     </button>
                   </div>
                   <div className="bg-brand-surface border-2 border-brand-outline rounded-2xl flex flex-col shadow-sm">
                      <div className="flex items-center justify-between p-6 border-b border-brand-outline">
                         <div>
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1 flex items-center gap-2">
                                Home <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">Default</span>
                            </h4>
                            <p className="text-xs text-brand-text-variant">Makati City, Metro Manila</p>
                         </div>
                         <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors p-2">
                            <Trash2 size={16} />
                         </button>
                      </div>
                      <div className="flex items-center justify-between p-6">
                         <div>
                            <h4 className="text-sm font-semibold text-brand-text-main mb-1">Office</h4>
                            <p className="text-xs text-brand-text-variant">BGC, Taguig City</p>
                         </div>
                         <button type="button" className="text-brand-text-variant hover:text-red-500 transition-colors p-2">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 </div>
               </div>
            )}
          </div>

           <div className="bg-brand-surface-container/50 px-6 py-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 border-t border-brand-outline">
             <div className="flex text-xs font-medium text-brand-text-variant text-center sm:text-left">
                <p>Private data will never be shared without your permission.</p>
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
