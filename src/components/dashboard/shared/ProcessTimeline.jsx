import React from "react";
import { Check, Clock, UserCheck, Play, CreditCard } from "lucide-react";

const STAGES = [
  {
    id: "pending",
    label: "Pending",
    icon: Clock,
    description: "Finding workers",
  },
  {
    id: "hired",
    label: "Hired",
    icon: UserCheck,
    description: "Provider selected",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Play,
    description: "Work being done",
  },
  {
    id: "review",
    label: "Review & Pay",
    icon: CreditCard,
    description: "Finalize task",
  },
];

export const ProcessTimeline = ({ currentState, className = "" }) => {
  const currentIndex = STAGES.findIndex((s) => s.id === currentState);
  return (
    <div className={`w-full py-6 ${className}`}>
      <div className="relative flex justify-between items-start">
        {/* Connection Lines */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-brand-outline -z-0">
          <div
            className="h-full bg-brand-primary transition-all duration-700 ease-in-out"
            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className="relative z-10 flex flex-col items-center group"
            >
              {/* Node */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2
                  ${isCompleted ? "bg-brand-primary border-brand-primary text-white" : ""}
                  ${isActive ? "bg-brand-surface-card border-brand-primary text-brand-primary shadow-lg shadow-brand-primary/20 scale-110" : ""}
                  ${isUpcoming ? "bg-brand-surface border-brand-outline text-brand-text-variant" : ""}
                `}
              >
                {isCompleted ? (
                  <Check
                    size={20}
                    className="animate-in zoom-in duration-300"
                  />
                ) : (
                  <Icon size={18} className={isActive ? "animate-pulse" : ""} />
                )}
              </div>

              {/* Label */}
              <div className="mt-3 text-center">
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? "text-brand-primary" : isCompleted ? "text-brand-text-main" : "text-brand-text-variant"}`}
                >
                  {stage.label}
                </p>
                <p
                  className={`text-[9px] font-medium hidden md:block transition-opacity ${isActive ? "text-brand-text-variant opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {stage.description}
                </p>
              </div>

              {/* Tooltip for mobile */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-brand-text-main text-white text-[9px] px-2 py-1 rounded-md md:hidden pointer-events-none whitespace-nowrap">
                {stage.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
