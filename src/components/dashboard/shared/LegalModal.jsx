import React from "react";
import { X, Shield, ScrollText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const LegalModal = ({ isOpen, onClose, type }) => {
  const content = {
    privacy: {
      title: "Privacy Policy",
      icon: Shield,
      sections: [
        {
          title: "1. Information We Collect",
          text: "We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.",
        },
        {
          title: "2. How We Use Your Information",
          text: "We use the information we collect to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request, and develop new features.",
        },
        {
          title: "3. Data Sharing and Disclosure",
          text: "We may share your information with service providers who perform services on our behalf, and in connection with, or during negotiations of, any merger, sale of company assets, consolidation or restructuring, financing, or acquisition of all or a portion of our business.",
        },
        {
          title: "4. Security",
          text: "We use reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.",
        },
      ],
    },
    tos: {
      title: "Terms of Service",
      icon: ScrollText,
      sections: [
        {
          title: "1. Acceptance of Terms",
          text: "By accessing or using LingkodHub, you agree to be bound by these terms. If you do not agree to all the terms and conditions, then you may not access the service.",
        },
        {
          title: "2. User Conduct",
          text: "You agree not to use the service for any purpose that is prohibited by these terms. You are responsible for all of your activity in connection with the service.",
        },
        {
          title: "3. Service Fees",
          text: "LingkodHub reserves the right to charge fees for certain services. Any such fees will be disclosed to you prior to being incurred.",
        },
        {
          title: "4. Limitation of Liability",
          text: "In no event shall LingkodHub be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.",
        },
      ],
    },
  };

  const activeContent = content[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-text-main/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-brand-surface rounded-[2.5rem] shadow-2xl border border-brand-outline overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-brand-outline flex justify-between items-center bg-brand-surface-container/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                  <activeContent.icon size={20} />
                </div>
                <h2 className="text-xl font-bold text-brand-text-main">
                  {activeContent.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-brand-outline/30 flex items-center justify-center text-brand-text-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="space-y-8">
                {activeContent.sections.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-sm font-bold text-brand-text-main uppercase tracking-widest mb-3">
                      {section.title}
                    </h3>
                    <p className="text-sm text-brand-text-variant leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-center">
                <p className="text-xs text-brand-text-variant font-medium">
                  Last updated: May 14, 2026. For questions regarding these
                  terms, please contact{" "}
                  <a
                    href="mailto:legal@lingkodhub.com"
                    className="text-brand-primary hover:underline font-bold"
                  >
                    legal@lingkodhub.com
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-brand-outline bg-brand-surface-container/10 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-brand-primary/10"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
