import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Banknote, Users, AlertTriangle } from "lucide-react";

export const ProviderHelpSection = () => {
  const [activeFaq, setActiveFaq] = React.useState(0);

  const FAQS = [
    {
      q: "What if the job description doesn't match the reality?",
      a: "If you arrive and the scope of work is significantly different from what was described in the post, do NOT start the task. Taking the job implies you accept the terms. Immediately use the 'Misdescribed Job' button in the Active Work section to pause the job and trigger a mediation request. Our review team will assess if a price adjustment or cancellation without penalty is warranted.",
    },
    {
      q: "I feel unsafe at the job site. What should I do?",
      a: "Your safety is our absolute priority. If you ever feel uncomfortable or unsafe, leave the premises immediately. Use the 'Safety Concern' button in the platform to report the incident. This will immediately freeze the client's account pending investigation. Communication through Lingkod Hub allows us to track location and verified identities for your protection.",
    },
    {
      q: "What are the penalties for canceling an accepted job?",
      a: "Accepted jobs carry a commitment. Cancellations made within 12 hours of the start time result in a ₱300 Reliability Penalty deducted from your next payout. Repeated cancellations (more than 2 within 30 days) may lead to temporary account suspension. Cancellations with valid documentation (medical, emergency) can be appealed via support.",
    },
    {
      q: "When can I file a dispute?",
      a: "All disputes regarding payments or job completion must be filed within 24 hours of the job being marked as 'Done'. After this window, funds are released to the provider and the transaction is considered finalized.",
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Help Content */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          <div>
            <h1 className="text-4xl font-bold text-brand-text-main mb-4 tracking-tight">
              Help & Safety Protocol
            </h1>
            <p className="text-brand-text-variant max-w-xl font-medium">
              Protecting our providers is critical. Learn our safety guidelines,
              dispute rules, and how to handle discrepancies.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-brand-text-main mb-6">
              Frequently Asked Questions
            </h2>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-brand-surface-card border border-brand-outline rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between group"
                >
                  <span
                    className={`font-bold transition-colors ${activeFaq === i ? "text-brand-primary" : "text-brand-text-main group-hover:text-brand-primary"}`}
                  >
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={18}
                    className={`text-brand-text-variant transition-transform ${activeFaq === i ? "rotate-90 text-brand-primary" : ""}`}
                  />
                </button>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-6 pb-6 text-sm text-brand-text-variant leading-relaxed font-medium"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TOS Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-8">
            <div className="bg-brand-primary p-10 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">
                Terms Summary
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Banknote size={16} />
                  </div>
                  <p className="text-[13px] leading-relaxed">
                    Payments must be processed through our vault to ensure 100%
                    dispute coverage.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                  <p className="text-[13px] leading-relaxed">
                    Direct side-agreements are grounds for immediate provider
                    de-listing.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <p className="text-[13px] leading-relaxed">
                    Disputes must be raised within the 24-hour window
                    post-completion.
                  </p>
                </div>
              </div>
              <button className="w-full mt-10 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all text-sm border border-white/20">
                Read Full Provider TOS
              </button>
            </div>

            <div className="bg-brand-surface-card border border-brand-outline p-8 rounded-[2rem] shadow-sm">
              <h4 className="text-sm font-bold text-brand-text-main mb-4">
                Contact Mediation
              </h4>
              <p className="text-xs text-brand-text-variant mb-6 leading-relaxed">
                Our support team is available 24/7 for emergency job sites
                issues. Response time: &lt;10 mins.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => (window.location.href = "tel:+639000000000")}
                  className="flex-1 py-3 bg-brand-surface border border-brand-outline rounded-xl font-bold text-xs hover:bg-brand-surface-card transition-all"
                >
                  Support Line
                </button>
                <button
                  onClick={() =>
                    (window.location.href =
                      "mailto:lingkodhubsupport@gmail.com")
                  }
                  className="flex-1 py-3 bg-brand-surface border border-brand-outline rounded-xl font-bold text-xs hover:bg-brand-surface-card transition-all"
                >
                  Write Mail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
