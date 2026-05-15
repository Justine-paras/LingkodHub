import React from 'react';
import { 
  Book, 
  CreditCard, 
  ShieldCheck, 
  Mail, 
  ChevronRight,
  MessageCircle,
  AlertCircle,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../../services/api';

const HelpCard = ({ icon: Icon, title, description, children }: { icon: any, title: string, description: string, children?: React.ReactNode }) => (
  <div className="bg-brand-surface-card border border-brand-outline rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-brand-text-main">{title}</h3>
        <p className="text-xs text-brand-text-variant font-medium">{description}</p>
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
  <div className="group cursor-pointer">
    <div className="flex justify-between items-start gap-4 mb-2">
      <h4 className="text-sm font-semibold text-brand-text-main group-hover:text-brand-primary transition-colors leading-tight">
        {question}
      </h4>
      <ChevronRight size={14} className="text-brand-text-variant mt-1 shrink-0 group-hover:translate-x-1 transition-transform" />
    </div>
    <p className="text-xs text-brand-text-variant leading-relaxed">
      {answer}
    </p>
  </div>
);

export const HelpSection = () => {
  const [isContactOpen, setIsContactOpen] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Contact State
  const [contactSubject, setContactSubject] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');

  // Report State
  const [reportType, setReportType] = React.useState('General Issue');
  const [reportDescription, setReportDescription] = React.useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.contactSupport(contactSubject, contactMessage);
      alert('Your message has been sent to support!');
      setIsContactOpen(false);
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.reportIssue(reportType, reportDescription);
      alert('Report submitted successfully!');
      setIsReportOpen(false);
      setReportDescription('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-8 lg:px-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-brand-text-main mb-3 flex items-center justify-center gap-3">
          <span className="text-4xl">🆘</span> LingkodHub Help Center
        </h1>
        <p className="text-brand-text-variant max-w-2xl mx-auto">
          Need assistance with your tasks or payments? Find answers to commonly asked questions below.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <HelpCard 
          icon={Book} 
          title="Using the App" 
          description="Basics of managing your tasks"
        >
          <FAQItem 
            question="How do I post a task?" 
            answer="Go to Home, type what you need (e.g., 'Fix Sink') in the search bar, or select a category like Plumbing."
          />
          <FAQItem 
            question="Where are my active requests?" 
            answer="Check the My Active Posts section on your dashboard to see jobs that haven't started yet."
          />
          <FAQItem 
            question="How do I track a worker?" 
            answer="Once a helper starts, move to the Ongoing Tasks tab to see their progress and status."
          />
        </HelpCard>

        <HelpCard 
          icon={CreditCard} 
          title="Payments & History" 
          description="Handling money and disputes"
        >
          <FAQItem 
            question="How do I pay?" 
            answer="Payments are handled via the Profile section under Billing. We support GCash and Maya."
          />
          <FAQItem 
            question="Can I get a refund?" 
            answer="If a task isn't completed, click the Dispute button in your Task History or contact support within 24 hours."
          />
        </HelpCard>

        <HelpCard 
          icon={ShieldCheck} 
          title="Safety & Account" 
          description="Security and verification"
        >
          <FAQItem 
            question="What is a 'Verified Worker'?" 
            answer="Verified workers have submitted a government ID for community safety. Look for the green checkmark!"
          />
          <FAQItem 
            question="How do I report a problem?" 
            answer="If you have an issue with a helper, use the Report button on their profile or email us at support@lingkodhub.com."
          />
          <FAQItem 
            question="Changing my address?" 
            answer="Update your neighborhood location in the Profile settings to find local helpers near you."
          />
        </HelpCard>
      </div>

      <div className="bg-brand-primary/5 border-2 border-brand-primary/20 rounded-[2rem] p-10 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-primary/20">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-text-main mb-2">Still need help?</h2>
          <p className="text-sm text-brand-text-variant mb-8 max-w-lg mx-auto">
            Our support team is available 24/7 to help you with any issues or concerns you might have.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setIsContactOpen(true)}
              className="px-8 py-3.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <MessageCircle size={18} /> Contact Support
            </button>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="px-8 py-3.5 bg-white border-2 border-brand-outline text-brand-text-main font-bold rounded-xl hover:border-brand-primary/50 transition-all flex items-center gap-2"
            >
              <AlertCircle size={18} /> Report an Issue
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsContactOpen(false)} className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-text-main">Contact Support</h2>
                <button onClick={() => setIsContactOpen(false)} className="p-2 hover:bg-brand-outline/30 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-main uppercase tracking-widest mb-2">Subject</label>
                  <input required value={contactSubject} onChange={e => setContactSubject(e.target.value)} type="text" placeholder="What do you need help with?" className="w-full px-4 py-3 bg-brand-surface border-2 border-brand-outline rounded-xl focus:border-brand-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-main uppercase tracking-widest mb-2">Message</label>
                  <textarea required value={contactMessage} onChange={e => setContactMessage(e.target.value)} rows={4} placeholder="Describe your issue in detail..." className="w-full px-4 py-3 bg-brand-surface border-2 border-brand-outline rounded-xl focus:border-brand-primary outline-none transition-all resize-none" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReportOpen(false)} className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-brand-text-main">Report an Issue</h2>
                <button onClick={() => setIsReportOpen(false)} className="p-2 hover:bg-brand-outline/30 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text-main uppercase tracking-widest mb-2">Issue Type</label>
                  <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-4 py-3 bg-brand-surface border-2 border-brand-outline rounded-xl focus:border-brand-primary outline-none transition-all">
                    <option>General Issue</option>
                    <option>Bug Report</option>
                    <option>Payment Problem</option>
                    <option>User Misconduct</option>
                    <option>Safety Concern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-text-main uppercase tracking-widest mb-2">Description</label>
                  <textarea required value={reportDescription} onChange={e => setReportDescription(e.target.value)} rows={4} placeholder="Please provide more details..." className="w-full px-4 py-3 bg-brand-surface border-2 border-brand-outline rounded-xl focus:border-brand-primary outline-none transition-all resize-none" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><AlertCircle size={18} /> Submit Report</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
