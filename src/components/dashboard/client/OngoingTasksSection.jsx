import React from "react";
import {
  Clock,
  Banknote,
  Star,
  X,
  CheckCircle,
  MessageSquare,
  MapPin,
  Trash2,
} from "lucide-react";
import { api } from "../../../services/api";
import { ProcessTimeline } from "../shared/ProcessTimeline";

export const OngoingTasksSection = () => {
  const [showCompletionModal, setShowCompletionModal] = React.useState(null);
  const [showCancelModal, setShowCancelModal] = React.useState(null);
  const [showReportModal, setShowReportModal] = React.useState(null);
  const [activeTasks, setActiveTasks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  // Review state
  const [rating, setRating] = React.useState(5);
  const [reviewComment, setReviewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    try {
      const [ongoingJobs, pendingJobs] = await Promise.all([
        api.getJobsByView("ongoing"),
        api.getJobs({ status: "pending" }),
      ]);
      // Filter pending jobs for those that have a provider assigned AND the provider has accepted (applied)
      const assignedPendingCandidates = pendingJobs.filter(
        (j) => j.provider_id !== null,
      );
      const assignedPendingResults = await Promise.all(
        assignedPendingCandidates.map(async (job) => {
          try {
            const apps = await api.getJobApplications(job.id);
            const providerApplied = apps.some(
              (a) => a.provider_id === job.provider_id,
            );
            return providerApplied ? job : null;
          } catch (e) {
            return null;
          }
        }),
      );
      const validAssignedPending = assignedPendingResults.filter(
        (j) => j !== null,
      );
      // Merge and deduplicate
      const combined = [...ongoingJobs, ...validAssignedPending];
      const unique = Array.from(
        new Map(combined.map((j) => [j.id, j])).values(),
      );
      // For each task, check if it has been "Submitted for Review"
      // We check this by seeing if there's a recent message from the provider about completion
      const enrichedTasks = await Promise.all(
        unique.map(async (job) => {
          try {
            const allMessages = await api.getMessages(job.provider_id);
            const messages = allMessages.filter((m) => m.job_id === job.id);
            const hasSubmission = messages.some(
              (m) =>
                m.sender_id === job.provider_id &&
                m.content &&
                (m.content.includes("completed the work") ||
                  m.content.includes("release the funds")),
            );
            const providerArrived = messages.some(
              (m) =>
                m.content && m.content.includes("[SYSTEM:PROVIDER_ARRIVED]"),
            );
            const clientConfirmed = messages.some(
              (m) =>
                m.content &&
                m.content.includes("[SYSTEM:CLIENT_CONFIRMED_ARRIVAL]"),
            );
            if (
              clientConfirmed &&
              providerArrived &&
              job.status === "pending"
            ) {
              try {
                await api.updateJobStatus(job.id, "in_progress");
                job.status = "in_progress";
              } catch (e) {
                console.error("Auto-resolve failed", e);
              }
            }
            return {
              ...job,
              is_submitted: hasSubmission,
              provider_arrived: providerArrived,
              client_confirmed: clientConfirmed,
            };
          } catch (e) {
            return job;
          }
        }),
      );
      setActiveTasks(enrichedTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTasks();

    const channel = new BroadcastChannel("dashboard_sync");
    channel.onmessage = (event) => {
      if (event.data.type === "DATA_UPDATED") {
        fetchTasks();
      }
    };

    const interval = setInterval(fetchTasks, 15000);

    return () => {
      channel.close();
      clearInterval(interval);
    };
  }, [fetchTasks]);

  const completeTask = async (job) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1. Handshake Fix (if pending)
      if (job.status === "pending") {
        try {
          const applications = await api.getJobApplications(Math.floor(job.id));
          const providerApp = applications.find(
            (a) => Math.floor(a.provider_id) === Math.floor(job.provider_id),
          );
          if (providerApp && providerApp.status !== "accepted") {
            await api.decideApplication(
              Math.floor(providerApp.id),
              "accepted",
              job.payment_method,
            );
          }
          await api.updateJobStatus(Math.floor(job.id), "in_progress");
        } catch (e) {
          console.warn("Handshake fix failed", e);
        }
      }

      // 2. Mark as Completed
      await api.updateJobStatus(Math.floor(job.id), "completed");

      // 3. Create Review (if rating/comment provided)
      if (rating > 0) {
        try {
          await api.createReview(
            Math.floor(job.id),
            rating,
            reviewComment || "Excellent work!",
          );
        } catch (e) {
          console.warn("Failed to submit review", e);
        }
      }
      const channel = new BroadcastChannel("dashboard_sync");
      channel.postMessage({ type: "DATA_UPDATED" });
      channel.close();

      setActiveTasks((prev) => prev.filter((t) => t.id !== job.id));
      setShowCompletionModal(null);
      setRating(5);
      setReviewComment("");
      alert(
        "Funds released and review submitted! Thank you for using LingkodHub.",
      );
    } catch (error) {
      console.error("Failed to complete task", error);
      alert(
        `Payment Release Failed: The system encountered an error. This can happen if the professional has not officially accepted the job on their dashboard yet.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelTask = async (jobId) => {
    try {
      await api.updateJobStatus(jobId, "cancelled");
      setActiveTasks((prev) => prev.filter((task) => task.id !== jobId));
      setShowCancelModal(null);
    } catch (error) {
      console.error("Failed to cancel task", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-12 w-full flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-brand-outline pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-brand-text-main">
              Tasks in Progress
            </h1>
            <div className="flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold text-xs px-3 py-1 rounded-full border border-brand-primary/20">
              {activeTasks.length} Active
            </div>
          </div>
          <p className="text-sm text-brand-text-variant">
            Manage your hired workers and track progress
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-8 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center bg-brand-surface-card border border-brand-outline rounded-3xl p-16 text-center shadow-sm h-full max-h-[400px]">
            <p className="text-brand-text-variant text-sm">Loading tasks...</p>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-brand-surface-card border border-brand-outline rounded-3xl p-16 text-center shadow-sm h-full max-h-[400px]">
            <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center mb-6">
              <Clock size={48} className="text-brand-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-brand-text-main mb-2">
              No tasks currently in progress.
            </h3>
            <p className="text-brand-text-variant text-sm max-w-sm">
              Find a worker in the Search tab!
            </p>
          </div>
        ) : (
          activeTasks.map((task) => (
            <div
              key={task.id}
              className="bg-brand-surface-card border border-brand-outline rounded-[2rem] shadow-lg overflow-hidden flex flex-col group relative"
            >
              {/* "Submitted for Review" Banner */}
              {task.is_submitted && (
                <div className="bg-amber-500 text-white px-6 py-2.5 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <CheckCircle size={14} /> Work Submitted for Review
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                    Action Required
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col md:flex-row md:items-start gap-8 relative">
                {/* Financial Info */}
                <div className="md:absolute md:top-8 md:right-8 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 w-full md:w-auto mb-4 md:mb-0">
                  <div className="flex flex-col md:items-end">
                    <span className="text-2xl font-black text-[#059669]">
                      ₱{Number(task.budget || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded flex items-center gap-1 mt-1 border border-[#059669]/20 uppercase tracking-tighter">
                      <CheckCircle size={10} /> Escrow Secured
                    </span>
                  </div>
                </div>

                {/* Worker Profile */}
                <div className="flex flex-col items-center shrink-0 w-24">
                  {task.provider_avatar ? (
                    <img
                      src={
                        task.provider_avatar.startsWith("http")
                          ? task.provider_avatar
                          : `http://localhost:3000${task.provider_avatar}`
                      }
                      alt={task.provider_name || "Provider"}
                      className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-outline mb-3 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white text-3xl font-extrabold mb-3 border-2 border-brand-outline shadow-md shrink-0">
                      {task.provider_name
                        ? task.provider_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "?"}
                    </div>
                  )}
                </div>

                {/* Job Context */}
                <div className="flex-1 text-center md:text-left pt-1">
                  <h3 className="text-3xl font-bold text-brand-text-main mb-4 leading-tight pr-0 md:pr-40">
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                    <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border border-brand-primary/10 shrink-0">
                      {task.category}
                    </span>
                    <span className="text-sm font-bold text-brand-text-main flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                      {task.provider_name || "Assigned provider"}
                    </span>
                    <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                      <Star
                        size={12}
                        className="fill-amber-400 text-amber-500 mr-1.5"
                      />
                      {task.rating || "New"}
                    </span>
                  </div>

                  {/* Process Timeline */}
                  <div className="mb-8 bg-brand-surface/50 p-6 rounded-[2rem] border border-brand-outline/50 relative group/escrow">
                    <ProcessTimeline
                      currentState={
                        task.is_submitted
                          ? "review"
                          : task.status === "in_progress"
                            ? "in_progress"
                            : "hired"
                      }
                    />
                    <div className="mt-4 text-[10px] font-medium text-brand-text-variant flex items-center justify-center gap-1.5 opacity-80 group-hover/escrow:opacity-100 transition-opacity">
                      <Banknote size={12} className="text-[#059669]" />
                      {task.status === "in_progress"
                        ? "Payment is locked in escrow. Release only after verification."
                        : "Invitation pending. Professional must accept to start work."}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-2 w-full pt-6 border-t border-brand-outline">
                    <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto">
                      <button
                        onClick={() => setShowCancelModal(task)}
                        className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={14} />
                        Cancel Job
                      </button>
                      <button
                        onClick={() => setShowReportModal(task)}
                        className="px-4 py-2 text-[10px] font-bold text-brand-text-variant uppercase tracking-widest hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Bottom) */}
              {task.status === "pending" ? (
                <button
                  onClick={async () => {
                    if (!task.client_confirmed) {
                      try {
                        await api.sendMessage(
                          task.provider_id,
                          "[SYSTEM:CLIENT_CONFIRMED_ARRIVAL]",
                          task.id,
                        );
                        if (task.provider_arrived) {
                          await api.updateJobStatus(
                            Math.floor(task.id),
                            "in_progress",
                          );
                        }
                        const channel = new BroadcastChannel("dashboard_sync");
                        channel.postMessage({ type: "DATA_UPDATED" });
                        channel.close();
                        alert(
                          task.provider_arrived
                            ? "Worker confirmed! Task is now in progress."
                            : "You confirmed arrival. Waiting for worker to also confirm.",
                        );
                        fetchTasks();
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  }}
                  disabled={task.client_confirmed}
                  className={`w-full py-5 text-sm font-black transition-all border-t flex items-center justify-center gap-3 uppercase tracking-widest ${
                    task.client_confirmed
                      ? "bg-brand-surface text-brand-text-variant cursor-not-allowed border-brand-outline"
                      : "bg-brand-primary text-white hover:bg-brand-primary/90"
                  }`}
                >
                  <MapPin size={20} />
                  {task.client_confirmed
                    ? "Waiting for Professional to arrive..."
                    : "Confirm Worker is Here"}
                </button>
              ) : (
                <button
                  onClick={() => setShowCompletionModal(task)}
                  className={`w-full py-5 text-sm font-black transition-all border-t flex items-center justify-center gap-3 uppercase tracking-widest ${
                    task.is_submitted
                      ? "bg-[#059669] text-white hover:bg-[#047857] animate-pulse shadow-inner"
                      : "bg-brand-surface text-brand-text-variant hover:bg-brand-surface-card border-brand-outline"
                  }`}
                >
                  {task.is_submitted ? (
                    <CheckCircle size={20} />
                  ) : (
                    <MessageSquare size={18} />
                  )}
                  {task.is_submitted
                    ? "Release Funds & Rate Professional"
                    : "Review & Release Funds"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Completion & Review Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => !isSubmitting && setShowCompletionModal(null)}
          ></div>
          <div className="relative bg-brand-surface-card w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="p-10">
              <div className="w-20 h-20 bg-[#059669]/10 text-[#059669] rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-3xl font-black text-brand-text-main mb-2 text-center">
                Rate & Release Funds
              </h3>
              <p className="text-brand-text-variant mb-10 text-center leading-relaxed font-medium">
                How was your experience with{" "}
                <span className="text-brand-text-main font-bold">
                  {showCompletionModal.provider_name || "the professional"}
                </span>
                ?
              </p>

              {/* Rating Stars */}
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 transition-all transform hover:scale-110 ${rating >= star ? "text-amber-400" : "text-brand-outline"}`}
                  >
                    <Star
                      size={40}
                      fill={rating >= star ? "currentColor" : "none"}
                      strokeWidth={2.5}
                    />
                  </button>
                ))}
              </div>

              {/* Review Box */}
              <div className="mb-10">
                <label className="block text-[10px] font-black text-brand-text-variant uppercase tracking-widest mb-3 ml-2">
                  Your Feedback
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write a brief review about the work done..."
                  className="w-full bg-brand-surface border-2 border-brand-outline rounded-3xl p-6 text-sm font-medium focus:outline-none focus:border-brand-primary transition-all resize-none h-32"
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  disabled={isSubmitting}
                  className={`w-full py-5 bg-[#059669] text-white text-base font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest ${isSubmitting ? "opacity-50 cursor-wait" : "hover:bg-[#047857] active:scale-[0.98]"}`}
                  onClick={() => completeTask(showCompletionModal)}
                >
                  {isSubmitting ? (
                    "Processing Payment..."
                  ) : (
                    <>
                      <Banknote size={20} />
                      Pay ₱
                      {Number(
                        showCompletionModal.budget || 0,
                      ).toLocaleString()}{" "}
                      & Release
                    </>
                  )}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowCompletionModal(null)}
                  className="w-full py-4 text-xs font-black text-brand-text-variant uppercase tracking-widest hover:text-brand-text-main transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Task Modal (Simplified for space) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCancelModal(null)}
          ></div>
          <div className="relative bg-brand-surface-card w-full max-w-md rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <X size={32} />
            </div>
            <h3 className="text-2xl font-bold text-brand-text-main mb-4">
              Cancel this task?
            </h3>
            <p className="text-brand-text-variant mb-8 text-sm">
              This will remove the job from your active list and notify the
              professional.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 py-4 bg-brand-surface border border-brand-outline rounded-xl font-bold text-xs uppercase"
              >
                Stay
              </button>
              <button
                onClick={() => cancelTask(showCancelModal.id)}
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold text-xs uppercase"
              >
                Cancel Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal (Simplified for space) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReportModal(null)}
          ></div>
          <div className="relative bg-brand-surface-card w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-brand-text-main mb-6">
              Report Issue
            </h3>
            <textarea
              className="w-full bg-brand-surface border border-brand-outline rounded-2xl p-4 mb-6 h-32"
              placeholder="What happened?"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowReportModal(null)}
                className="flex-1 py-3 bg-brand-surface border border-brand-outline rounded-xl font-bold text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setShowReportModal(null)}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-xs"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
