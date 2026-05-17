import React from "react";
import { Sun, Moon, Bell, BadgeCheck } from "lucide-react";
import { api } from "../../../services/api";

export const TopBar = ({ isDark, toggleTheme, role = "client" }) => {
  const [userProfile, setUserProfile] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifications, setShowNotifications] = React.useState(false);
  React.useEffect(() => {
    const loadUser = () => {
      api
        .getMe()
        .then((user) => {
          setUserProfile(user);
        })
        .catch(console.error);
    };

    const loadNotifications = () => {
      api
        .getNotifications()
        .then((data) => {
          setNotifications(data.notifications);
          setUnreadCount(data.unread_count);
        })
        .catch(console.error);
    };

    loadUser();
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s

    window.addEventListener("profile-updated", loadUser);
    window.addEventListener("refresh-notifications", loadNotifications);
    return () => {
      window.removeEventListener("profile-updated", loadUser);
      window.removeEventListener("refresh-notifications", loadNotifications);
      clearInterval(interval);
    };
  }, []);

  const displayName =
    userProfile?.full_name || (role === "client" ? "Client" : "Provider");
  const displayAvatar = userProfile?.avatar_url
    ? userProfile.avatar_url.startsWith("http")
      ? userProfile.avatar_url
      : `http://localhost:3000${userProfile.avatar_url}`
    : null;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <header className="h-[72px] bg-brand-surface border-b border-brand-outline flex items-center justify-between px-12 sticky top-0 z-40">
      <div className="flex items-center gap-12">
        <div className="text-sm font-light text-brand-text-main tracking-wide">
          Welcome, <span className="font-semibold">{displayName}!</span>
        </div>
        {userProfile && !userProfile.is_email_verified && (
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-full animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
            <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
              Account Unverified
            </span>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("change-tab", { detail: "profile" }),
                )
              }
              className="text-[10px] font-bold text-brand-text-main hover:underline decoration-brand-accent decoration-2"
            >
              Verify Email to unlock features
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r border-brand-outline pr-4 mr-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50 rounded-full transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition-colors ${showNotifications ? "bg-brand-primary/10 text-brand-primary" : "text-brand-text-variant hover:text-brand-text-main hover:bg-brand-outline/50"}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-brand-surface"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-brand-surface border border-brand-outline rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-brand-outline flex justify-between items-center bg-brand-surface-container/50">
                  <h3 className="text-sm font-bold text-brand-text-main">
                    Notifications
                  </h3>
                  <button
                    onClick={() => {
                      api.markAllNotificationsRead().then(() => {
                        setUnreadCount(0);
                        setNotifications(
                          notifications.map((n) => ({ ...n, is_read: 1 })),
                        );
                      });
                    }}
                    className="text-[10px] font-bold text-brand-primary hover:underline uppercase tracking-wider"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-brand-text-variant text-xs italic">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) {
                            api.markNotificationRead(n.id).then(() => {
                              setUnreadCount((prev) => Math.max(0, prev - 1));
                              setNotifications(
                                notifications.map((notif) =>
                                  notif.id === n.id
                                    ? { ...notif, is_read: 1 }
                                    : notif,
                                ),
                              );
                            });
                          }
                        }}
                        className={`p-4 border-b border-brand-outline last:border-0 hover:bg-brand-surface-card transition-colors cursor-pointer relative ${!n.is_read ? "bg-brand-primary/5" : ""}`}
                      >
                        {!n.is_read && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-primary rounded-full"></div>
                        )}
                        <p className="text-sm font-semibold text-brand-text-main mb-0.5">
                          {n.title}
                        </p>
                        <p className="text-xs text-brand-text-variant leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-brand-text-variant mt-2 opacity-60">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-brand-text-main font-medium flex items-center justify-end gap-1.5">
              {displayName}
              {userProfile?.is_email_verified === 1 && (
                <BadgeCheck
                  size={14}
                  className="text-brand-primary fill-brand-primary/10"
                />
              )}
            </p>
            <p className="text-xs text-brand-text-variant font-light">
              {role === "client" ? "Homeowner" : "Service Provider"}
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full border border-brand-outline p-0.5 overflow-hidden">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="User"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold rounded-full">
                  {initials}
                </div>
              )}
            </div>
            {userProfile?.is_email_verified === 1 && (
              <div className="absolute -bottom-1 -right-1 bg-brand-surface rounded-full p-0.5">
                <div className="bg-brand-primary rounded-full p-0.5 border border-brand-surface">
                  <BadgeCheck size={8} className="text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
