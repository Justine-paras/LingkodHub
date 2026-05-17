import React from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Zap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { api } from "../../../services/api";
import { UserProfileModal } from "../shared/UserProfileModal";

export const ProviderInvitationsSection = () => {
  const [invitations, setInvitations] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedClientId, setSelectedClientId] = React.useState(null);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const user = await api.getMe();
      // Try both methods to be safe
      const [assignedJobs, allJobs] = await Promise.all([
        api.getJobsByView("assigned").catch(() => []),
        api.getJobs().catch(() => []),
      ]);

      const assignedList = Array.isArray(assignedJobs) ? assignedJobs : [];
      const allJobsList = Array.isArray(allJobs) ? allJobs : [];

      // Combine and deduplicate
      const combined = [...assignedList, ...allJobsList];
      const uniqueInvites = Array.from(
        new Map(combined.map((j) => [j.id, j])).values(),
      );
      // Fetch applications to identify which jobs the provider applied to themselves
      const myApps = await api.getMyApplications().catch(() => []);
      const appliedJobIds = Array.isArray(myApps)
        ? myApps.map((a) => a.job_id)
        : [];
      // Filter for jobs specifically assigned to this provider (Direct Invites)
      // If we already applied to it, it means it's an accepted public job, NOT a new invite.
      const filtered = uniqueInvites.filter(
        (j) =>
          j.provider_id === user.id &&
          (j.status === "pending" || j.status === "invited") &&
          !appliedJobIds.includes(j.id),
      );
      setInvitations(filtered);
    } catch (error) {
      console.error("Failed to fetch invitations", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvitations();
  }, []);

  const handleDecision = async (jobId, status) => {
    try {
      if (status === "accepted") {
        // 1. Send application/acceptance message
        await api.applyToJob(
          jobId,
          "I accept your direct work invitation! Let's get started.",
        );
        // 2. Broadcast update so Ongoing Tasks picks it up
        const channel = new BroadcastChannel("dashboard_sync");
        channel.postMessage({ type: "DATA_UPDATED", section: "jobs" });
        channel.close();

        alert(
          "Invitation accepted! Please check your Ongoing Tasks to confirm arrival.",
        );
      } else {
        // Officially decline by cancelling the job on the backend
        await api.updateJobStatus(jobId, "cancelled");
        const channel = new BroadcastChannel("dashboard_sync");
        channel.postMessage({ type: "DATA_UPDATED", section: "jobs" });
        channel.close();

        alert("Invitation declined.");
      }
      setInvitations((prev) => prev.filter((inv) => inv.id !== jobId));
    } catch (error) {
      console.error("Failed to update invitation", error);
      alert("Failed to update invitation status.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-12 w-full flex flex-col min-h-screen font-sans">
      <div className="mb-12 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck size={20} className="text-brand-primary" />
          </div>
          <h1 className="text-3xl font-black text-brand-text-main tracking-tight uppercase">
            Work Invitations
          </h1>
        </div>
        <p className="text-brand-text-variant font-medium">
          Direct requests from clients who specifically want your expertise.
        </p>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-6"></div>
          <p className="text-brand-text-variant font-bold animate-pulse uppercase tracking-widest text-sm">
            Reviewing your inbox...
          </p>
        </div>
      ) : invitations.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl bg-brand-surface-card border-2 border-brand-outline rounded-[3rem] p-12 text-center shadow-xl">
            <div className="w-20 h-20 bg-brand-primary/5 text-brand-primary/40 rounded-3xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
              <Clock size={40} />
            </div>
            <h2 className="text-3xl font-black text-brand-text-main mb-4">
              Inbox is quiet 📥
            </h2>
            <p className="text-brand-text-variant text-lg leading-relaxed">
              You don't have any direct work invitations yet. Keep your profile
              updated and your status "Online" to attract more direct clients.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-start pb-20">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="group bg-brand-surface-card border-2 border-brand-outline hover:border-brand-primary p-8 rounded-[2.5rem] transition-all relative flex flex-col shadow-sm hover:shadow-2xl hover:shadow-brand-primary/5"
            >
              {/* Badge */}
              <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                  <Zap size={12} /> Direct Request
                </span>
                <span className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={12} />{" "}
                  {new Date(inv.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-2xl font-black text-brand-text-main leading-tight mb-4 group-hover:text-brand-primary transition-colors">
                  {inv.title}
                </h3>
                <p className="text-brand-text-variant text-sm line-clamp-3 leading-relaxed mb-6 font-medium bg-brand-surface/50 p-4 rounded-2xl border border-brand-outline/50 italic">
                  "{inv.description}"
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-brand-surface border border-brand-outline rounded-2xl shadow-sm">
                    <MapPin size={18} className="text-brand-primary shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest">
                        Location
                      </p>
                      <p className="text-xs font-bold text-brand-text-main truncate">
                        {inv.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-brand-surface border border-brand-outline rounded-2xl shadow-sm">
                    <Calendar
                      size={18}
                      className="text-brand-primary shrink-0"
                    />
                    <div>
                      <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest">
                        Schedule
                      </p>
                      <p className="text-xs font-bold text-brand-text-main truncate">
                        {inv.scheduled_at
                          ? new Date(inv.scheduled_at).toLocaleDateString()
                          : "ASAP"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-brand-outline/50 mb-8">
                <div
                  onClick={() => setSelectedClientId(inv.client_id)}
                  className="flex items-center gap-4 cursor-pointer group/client hover:opacity-85 hover:scale-[1.02] transition-all"
                  title="Click to view client profile"
                >
                  {inv.client_avatar ? (
                    <img
                      src={
                        inv.client_avatar.startsWith("http")
                          ? inv.client_avatar
                          : `http://localhost:3000${inv.client_avatar}`
                      }
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-outline shadow-sm group-hover/client:border-brand-primary transition-colors"
                      alt="Client"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-brand-outline shadow-sm shrink-0 group-hover/client:border-brand-primary transition-colors">
                      {inv.client_name
                        ? inv.client_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest">
                      Client
                    </p>
                    <p className="text-sm font-bold text-brand-text-main group-hover/client:text-brand-primary transition-colors">
                      {inv.client_name || "Homeowner"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-1">
                    Offered Budget
                  </p>
                  <p className="text-2xl font-black text-[#059669]">
                    ₱{inv.budget?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDecision(inv.id, "rejected")}
                  className="flex-1 py-4 bg-brand-surface border border-brand-outline text-brand-text-main rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleDecision(inv.id, "accepted")}
                  className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-[#059669] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Accept & Start
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <UserProfileModal
        userId={selectedClientId}
        isOpen={selectedClientId !== null}
        onClose={() => setSelectedClientId(null)}
      />
    </div>
  );
};
