import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  CheckSquare,
  LogOut,
  HelpCircle,
  History,
  Banknote,
  Settings,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../../../services/api";

const SidebarItem = ({
  icon: Icon,
  label,
  active = false,
  onClick,
  badge = 0,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-3.5 text-left transition-all relative group ${
        active
          ? "text-brand-text-main"
          : "text-brand-text-variant hover:text-brand-text-main"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Icon
            size={18}
            className={active ? "text-brand-primary" : "text-current"}
          />
          {badge > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ring-2 ring-brand-surface group-hover:ring-brand-surface-card transition-all animate-bounce">
              {badge}
            </span>
          )}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="w-1.5 h-1.5 rounded-full bg-brand-primary"
        />
      )}
    </button>
  );
};

export const Sidebar = ({ activeTab, onTabChange, role = "client" }) => {
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = React.useState(true);
  const [invitationCount, setInvitationCount] = React.useState(0);

  React.useEffect(() => {
    api
      .getMe()
      .then((user) => {
        setIsEmailVerified(!!user.is_email_verified);
        if (role === "provider") {
          // Fetch invitations count
          Promise.all([
            api.getJobsByView("assigned").catch(() => []),
            api.getJobs({ status: "pending" }).catch(() => []),
          ])
            .then(([assigned, pending]) => {
              const combined = [...assigned, ...pending];
              const unique = Array.from(
                new Map(combined.map((j) => [j.id, j])).values(),
              );
              const count = unique.filter(
                (j) => j.provider_id === user.id && j.status === "pending",
              ).length;
              setInvitationCount(count);
            })
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, [role]);

  const handleTabClick = (tab) => {
    if (
      !isEmailVerified &&
      ["jobs", "tasks", "offers", "active-work", "earnings"].includes(tab)
    ) {
      alert("Please verify your email address to access this feature.");
      onTabChange("profile");
      return;
    }
    onTabChange(tab);
  };

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 bg-brand-surface border-r border-brand-outline flex flex-col z-50">
      <div className="px-8 py-10">
        <div className="flex items-center gap-3 mb-1 mt-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-brand-primary/10">
            <img
              src="/assets/logo.png"
              alt="Lingkod Hub Logo"
              className="w-[160%] h-[160%] max-w-none object-cover"
            />
          </div>
          <span className="font-black tracking-tighter text-brand-text-main text-2xl">
            Lingkod Hub
          </span>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <SidebarItem
          icon={Home}
          label="Home"
          active={activeTab === "home"}
          onClick={() => handleTabClick("home")}
        />

        {role === "client" ? (
          <>
            <SidebarItem
              icon={FileText}
              label="My Active Posts"
              active={activeTab === "jobs"}
              onClick={() => handleTabClick("jobs")}
            />

            <SidebarItem
              icon={CheckSquare}
              label="Ongoing Tasks"
              active={activeTab === "tasks"}
              onClick={() => handleTabClick("tasks")}
            />
          </>
        ) : (
          <>
            <SidebarItem
              icon={FileText}
              label="My Offers"
              active={activeTab === "offers"}
              onClick={() => handleTabClick("offers")}
            />

            <SidebarItem
              icon={Zap}
              label="Work Invitations"
              active={activeTab === "invitations"}
              onClick={() => handleTabClick("invitations")}
              badge={invitationCount}
            />

            <SidebarItem
              icon={CheckSquare}
              label="Active Work"
              active={activeTab === "active-work"}
              onClick={() => handleTabClick("active-work")}
            />

            <SidebarItem
              icon={Banknote}
              label="Earnings"
              active={activeTab === "earnings"}
              onClick={() => handleTabClick("earnings")}
            />
          </>
        )}
        <SidebarItem
          icon={History}
          label="History"
          active={activeTab === "history"}
          onClick={() => handleTabClick("history")}
        />

        <SidebarItem
          icon={HelpCircle}
          label="Help & Safety"
          active={activeTab === "help"}
          onClick={() => handleTabClick("help")}
        />

        <SidebarItem
          icon={Settings}
          label="Settings"
          active={activeTab === "profile"}
          onClick={() => handleTabClick("profile")}
        />
      </nav>

      <div className="mt-auto px-6 py-8">
        <button
          type="button"
          onClick={async () => {
            try {
              await api.logout();
            } catch (err) {
              console.error("Logout failed:", err);
            }
            navigate("/");
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-brand-text-variant hover:text-brand-text-main transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
