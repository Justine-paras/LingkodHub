import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Activity,
  Users,
  Banknote,
  CheckCircle2,
  X,
  CheckCircle,
  Star,
} from "lucide-react";
import { api } from "../../../services/api";
import { ProcessTimeline } from "../shared/ProcessTimeline";

export const HomeDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [activeJobs, setActiveJobs] = React.useState([]);
  const [ongoingJobs, setOngoingJobs] = React.useState([]);
  const [completedJobs, setCompletedJobs] = React.useState([]);
  const [totalApplicants, setTotalApplicants] = React.useState(0);
  const [topProviders, setTopProviders] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const [isEmailVerified, setIsEmailVerified] = React.useState(true);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);
  const [selectedProviderForView, setSelectedProviderForView] =
    React.useState(null);

  React.useEffect(() => {
    api
      .getMe()
      .then((user) => {
        setIsEmailVerified(!!user.is_email_verified);
      })
      .catch(console.error)
      .finally(() => setIsProfileLoading(false));

    Promise.all([
      api.getJobs({ status: "pending" }),
      api.getJobs({ status: "in_progress" }),
      api.getJobs({ status: "completed" }),
    ])
      .then(async ([pending, ongoing, completed]) => {
        // For Active Jobs, only show those that haven't been assigned yet
        const unassignedPending = pending.filter((j) => j.provider_id === null);
        setActiveJobs(unassignedPending);

        // For Ongoing Jobs, show 'in_progress' and 'pending but accepted'
        const assignedPendingCandidates = pending.filter(
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
        const assignedPending = assignedPendingResults.filter(
          (j) => j !== null,
        );
        const combinedOngoing = [...ongoing, ...assignedPending];
        // Enrich with submission status
        const enrichedOngoing = await Promise.all(
          combinedOngoing.map(async (job) => {
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
              const clientConfirmed = messages.some(
                (m) =>
                  m.content &&
                  m.content.includes("[SYSTEM:CLIENT_CONFIRMED_ARRIVAL]"),
              );
              const providerArrived = messages.some(
                (m) =>
                  m.content && m.content.includes("[SYSTEM:PROVIDER_ARRIVED]"),
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
                client_confirmed: clientConfirmed,
                provider_arrived: providerArrived,
              };
            } catch (e) {
              return job;
            }
          }),
        );

        setOngoingJobs(enrichedOngoing);
        setCompletedJobs(completed);

        // Fetch applications count for unassigned pending jobs
        let applicantCount = 0;
        for (const job of unassignedPending) {
          try {
            const apps = await api.getJobApplications(job.id);
            applicantCount += apps.length;
          } catch (err) {
            console.error(`Failed to fetch apps for job ${job.id}`, err);
          }
        }
        setTotalApplicants(applicantCount);
        // Fetch top providers for recommendation
        const providers = await api.getProviders({ location: locationQuery });
        setTopProviders(providers.slice(0, 3)); // Show top 3 for now
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (overrideQuery) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (!q.trim() && !locationQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    api
      .getProviders({ q, location: locationQuery })
      .then((providers) => {
        setSearchResults(providers);
      })
      .catch(console.error)
      .finally(() => setIsSearching(false));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col h-full px-12 py-8 gap-8 max-w-[1400px] mx-auto w-full relative">
      {!isProfileLoading && !isEmailVerified && (
        <div className="absolute inset-0 z-50 bg-brand-surface/60 backdrop-blur-sm flex items-center justify-center p-8 rounded-3xl">
          <div className="bg-brand-surface-card border-2 border-brand-outline rounded-[2.5rem] p-10 max-w-lg text-center shadow-2xl">
            <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent">
              <Search size={40} />
            </div>
            <h2 className="text-2xl font-bold text-brand-text-main mb-4">
              Verification Required
            </h2>
            <p className="text-brand-text-variant mb-8 leading-relaxed">
              To maintain a safe and trusted community, we require all users to
              verify their email address before accessing the dashboard
              features.
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("change-tab", { detail: "profile" }),
                )
              }
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:bg-[#059669] transition-all"
            >
              Go to Verification
            </button>
          </div>
        </div>
      )}

      {/* Search Section (Full Width Now) */}
      <div
        className={`flex flex-col gap-5 w-full mb-4 ${!isEmailVerified ? "opacity-50 pointer-events-none select-none" : ""}`}
      >
        <div className="flex items-center bg-brand-surface-card border-2 border-brand-outline rounded-[2.5rem] p-1.5 shadow-sm hover:shadow-md hover:border-brand-primary/50 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all w-full">
          <div className="flex-[1.5] flex items-center relative pl-6">
            <Search className="text-brand-text-variant shrink-0" size={20} />
            <input
              id="main-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What do you need help with today?"
              className="w-full bg-transparent py-4 pl-4 pr-4 text-sm tracking-wide text-brand-text-main focus:outline-none placeholder:text-brand-text-variant"
            />
          </div>

          <div className="w-px h-8 bg-brand-outline hidden sm:block"></div>

          <div className="flex-[1] flex items-center relative pl-6 hidden sm:flex">
            <MapPin className="text-brand-text-variant shrink-0" size={20} />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Location"
              className="w-full bg-transparent py-4 pl-4 pr-4 text-sm tracking-wide text-brand-text-main focus:outline-none placeholder:text-brand-text-variant truncate"
            />
          </div>

          <button
            onClick={() => handleSearch()}
            className="px-10 py-4 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-[#059669] transition-all shadow-sm active:scale-[0.98] shrink-0 ml-2"
          >
            Search
          </button>
        </div>

        <div className="flex gap-3 items-center flex-wrap px-4">
          <span className="text-sm text-brand-text-variant font-medium">
            Popular:
          </span>
          {["Plumbing", "Electrical", "Cleaning", "Carpentry"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearchQuery(cat);
                handleSearch(cat);
              }}
              className="px-5 py-2 border border-brand-outline bg-transparent rounded-full text-xs font-medium text-brand-text-variant hover:text-brand-text-main hover:border-brand-primary hover:bg-brand-primary/10 transition-all outline-none"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {hasSearched ? (
        <div
          className={`flex flex-col gap-6 w-full bg-brand-surface-container p-8 rounded-3xl border border-brand-outline ${!isEmailVerified ? "opacity-50 pointer-events-none select-none" : ""}`}
        >
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-outline/50">
            <div>
              <h2 className="text-2xl font-semibold text-brand-text-main">
                Search Results
              </h2>
              <p className="text-sm text-brand-text-variant mt-1.5">
                Found {searchResults.length} providers for "
                {searchQuery || locationQuery}"
              </p>
            </div>
            <button
              onClick={() => {
                setHasSearched(false);
                setSearchResults([]);
              }}
              className="text-sm font-semibold text-brand-primary hover:text-[#059669] transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
          </div>

          {isSearching ? (
            <div className="text-center text-brand-text-variant py-12">
              Searching for providers...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-brand-text-variant py-12 border-2 border-dashed border-brand-outline rounded-3xl">
              No providers found for your search. Try different keywords or
              location.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => setSelectedProviderForView(provider)}
                  className="bg-brand-surface-card border border-brand-outline p-6 rounded-2xl hover:border-brand-primary/50 hover:shadow-level-2 transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                  {provider.avatar_url ? (
                    <img
                      src={
                        provider.avatar_url.startsWith("http")
                          ? provider.avatar_url
                          : `http://localhost:3000${provider.avatar_url}`
                      }
                      alt={provider.full_name}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-brand-outline group-hover:border-brand-primary/50 transition-colors"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white text-3xl font-extrabold mb-4 border-2 border-brand-outline group-hover:border-brand-primary/50 transition-colors shadow-md shrink-0">
                      {provider.full_name
                        ? provider.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)
                        : "?"}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-brand-text-main flex items-center gap-2">
                    {provider.full_name}
                    {provider.is_documents_verified === 1 && (
                      <span
                        className="w-2 h-2 rounded-full bg-brand-primary"
                        title="Verified Provider"
                      ></span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5 mb-3 text-xs font-bold text-amber-500">
                    <Star size={12} className="fill-current" />
                    {provider.total_reviews > 0
                      ? `${provider.avg_rating.toFixed(1)} (${provider.total_reviews} reviews)`
                      : "New"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-brand-text-variant bg-brand-surface px-3 py-1 rounded-full border border-brand-outline mb-4">
                    <MapPin size={12} className="text-brand-primary" />{" "}
                    {provider.location || "No location specified"}
                  </div>
                  {provider.services && (
                    <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                      {provider.services
                        .split(", ")
                        .slice(0, 3)
                        .map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(
                        new CustomEvent("hire-provider", { detail: provider }),
                      );
                    }}
                    className="mt-auto w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-[#059669] transition-all shadow-sm shadow-brand-primary/20 active:scale-95"
                  >
                    Hire / Invite
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex flex-col gap-12 w-full ${!isEmailVerified ? "opacity-50 pointer-events-none select-none" : ""}`}
        >
          {/* Dashboard Overview - High-Level Summary Cards */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-brand-outline pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-brand-text-main">
                  Dashboard Overview
                </h2>
                <p className="text-sm text-brand-text-variant mt-1.5">
                  Your activity at a glance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Active Tasks Card */}
              <div className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1">
                  Active Tasks
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-text-main">
                    {ongoingJobs.length}
                  </span>
                  <span className="text-xs text-brand-text-variant mb-1 font-medium">
                    In Progress
                  </span>
                </div>
              </div>

              {/* New Applicants Card */}
              <div className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={20} />
                  </div>
                  {totalApplicants > 0 && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1">
                  New Applicants
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-text-main">
                    {totalApplicants}
                  </span>
                  <span className="text-xs text-brand-text-variant mb-1 font-medium">
                    Waiting Review
                  </span>
                </div>
              </div>

              {/* Total Spent Card */}
              <div className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-[#059669]/10 text-[#059669] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Banknote size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#059669]/10 px-2 py-0.5 rounded-full uppercase">
                    Total
                  </span>
                </div>
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1">
                  Total Spent
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xs text-brand-text-variant mb-1 font-bold">
                    ₱
                  </span>
                  <span className="text-3xl font-bold text-brand-text-main">
                    {completedJobs
                      .reduce((acc, job) => acc + (job.budget || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tasks Completed Card */}
              <div className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                    Done
                  </span>
                </div>
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-1">
                  Tasks Completed
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-brand-text-main">
                    {completedJobs.length}
                  </span>
                  <span className="text-xs text-brand-text-variant mb-1 font-medium">
                    Successful Jobs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Professionals Feed */}
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end border-b border-brand-outline pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-brand-text-main">
                  Recommended Professionals
                </h2>
                <p className="text-sm text-brand-text-variant mt-1.5">
                  Top-rated experts ready to help in{" "}
                  {locationQuery || "your area"}
                </p>
              </div>
              <button
                className="text-sm font-semibold text-brand-primary hover:text-[#059669] transition-colors flex items-center gap-1"
                onClick={() => {
                  setSearchQuery("");
                  handleSearch("");
                }}
              >
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topProviders.length > 0 ? (
                topProviders.map((provider, i) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProviderForView(provider)}
                    className="bg-brand-surface-card border-2 border-brand-outline p-6 rounded-[2rem] hover:border-brand-primary/50 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden cursor-pointer"
                  >
                    {/* Distance Badge */}
                    <div className="absolute top-6 right-6 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[10px] font-bold border border-brand-primary/10">
                      {i === 0 ? "0.8km" : i === 1 ? "1.2km" : "2.5km"} away
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      {provider.avatar_url ? (
                        <img
                          src={
                            provider.avatar_url.startsWith("http")
                              ? provider.avatar_url
                              : `http://localhost:3000${provider.avatar_url}`
                          }
                          alt={provider.full_name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-outline group-hover:border-brand-primary/50 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white text-xl font-extrabold border-2 border-brand-outline group-hover:border-brand-primary/50 transition-colors shrink-0 shadow-sm">
                          {provider.full_name
                            ? provider.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)
                            : "?"}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-brand-text-main line-clamp-1">
                          {provider.full_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                            <Star
                              size={12}
                              className="fill-amber-500 text-amber-500"
                            />
                            <span className="text-xs font-bold text-amber-700">
                              {provider.total_reviews > 0
                                ? provider.avg_rating.toFixed(1)
                                : "New"}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-brand-text-variant bg-brand-surface px-2 py-1 rounded-md border border-brand-outline">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-brand-text-main font-medium mb-6 leading-relaxed">
                      Need a{" "}
                      {provider.services?.split(", ")[0] || "Professional"}?{" "}
                      {provider.full_name.split(" ")[0]} is available now to
                      help.
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.dispatchEvent(
                          new CustomEvent("hire-provider", {
                            detail: provider,
                          }),
                        );
                      }}
                      className="w-full py-3.5 bg-brand-surface border-2 border-brand-outline text-brand-text-main font-bold rounded-2xl hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                    >
                      Direct Hire
                      <ChevronRight
                        size={18}
                        className="group-hover/btn:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-brand-text-variant border-2 border-dashed border-brand-outline rounded-3xl">
                  Searching for nearby professionals...
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Active Posts Section (Concise) */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-end mb-8 border-b border-brand-outline pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-brand-text-main">
                    My Active Posts
                  </h2>
                  <p className="text-sm text-brand-text-variant mt-1.5">
                    Quick overview of open requests
                  </p>
                </div>
                <button
                  className="text-sm font-semibold text-brand-primary hover:text-[#059669] transition-colors flex items-center gap-1"
                  onClick={() => {
                    const jobsTab =
                      document.querySelector(
                        'button[aria-label="My Active Posts"]',
                      ) ||
                      Array.from(document.querySelectorAll("nav button")).find(
                        (b) => b.textContent?.includes("My Active Posts"),
                      );
                    if (jobsTab) jobsTab.click();
                  }}
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  <div className="col-span-2 text-center text-brand-text-variant py-8">
                    Loading your posts...
                  </div>
                ) : activeJobs.length === 0 ? (
                  <div className="col-span-2 text-center text-brand-text-variant py-8 border-2 border-dashed border-brand-outline rounded-3xl">
                    You have no active posts.
                  </div>
                ) : (
                  activeJobs.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      className="bg-brand-surface-card border border-brand-outline p-5 rounded-3xl hover:border-brand-primary/50 hover:shadow-level-2 transition-all group relative overflow-hidden flex flex-col cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-brand-text-main leading-snug line-clamp-1">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-brand-text-variant mb-4">
                        <MapPin size={14} />
                        <span className="text-xs truncate">{job.location}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-brand-outline flex justify-between items-center">
                        <span className="text-lg font-semibold text-brand-text-main">
                          ₱{job.budget?.toLocaleString() ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-text-variant bg-brand-surface px-2 py-1 rounded-md border border-brand-outline">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-text-variant/40"></span>
                          Pending
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ongoing Tasks Section (Right Column equivalent) */}
            <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col bg-brand-surface-container rounded-3xl p-8 border border-brand-outline shrink-0">
              <div className="mb-8 border-b border-brand-outline/50 pb-4">
                <h2 className="text-2xl font-semibold text-brand-text-main">
                  Ongoing Tasks
                </h2>
                <p className="text-sm text-brand-text-variant mt-1.5">
                  Track jobs in progress
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {isLoading ? (
                  <div className="text-center text-brand-text-variant py-8">
                    Loading tasks...
                  </div>
                ) : ongoingJobs.length === 0 ? (
                  <div className="text-center text-brand-text-variant py-8 border-2 border-dashed border-brand-outline rounded-3xl">
                    No ongoing tasks.
                  </div>
                ) : (
                  ongoingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-brand-surface-card border border-brand-primary/30 p-8 rounded-3xl relative overflow-hidden shadow-sm"
                    >
                      {/* Active indicator */}
                      <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                        {job.is_submitted && (
                          <div className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1 rounded-full animate-pulse shadow-lg mb-1">
                            <CheckCircle2 size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              WORK SUBMITTED
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                          <span className="relative flex h-2 w-2">
                            <span
                              className={
                                job.status === "in_progress"
                                  ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"
                                  : ""
                              }
                            ></span>
                            <span
                              className={`relative inline-flex rounded-full h-2 w-2 ${job.status === "in_progress" ? "bg-brand-primary" : "bg-blue-500"}`}
                            ></span>
                          </span>
                          <span
                            className={`text-xs font-semibold px-1 ${job.status === "in_progress" ? "text-brand-primary" : "text-blue-600"}`}
                          >
                            {job.status === "in_progress"
                              ? "IN PROGRESS"
                              : "ASSIGNED"}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 mt-1 pr-32">
                        <h3 className="text-xl font-semibold text-brand-text-main leading-snug">
                          {job.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-brand-text-variant mb-6">
                        <MapPin size={14} />
                        <span className="text-sm truncate">{job.location}</span>
                      </div>

                      <div className="mb-6 bg-brand-surface/50 p-4 rounded-2xl border border-brand-outline/50">
                        <ProcessTimeline
                          currentState={
                            job.status === "in_progress"
                              ? "in_progress"
                              : "hired"
                          }
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-6 pb-6 border-t border-brand-outline mb-6 -mx-8 px-8">
                        {job.provider_avatar ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand-outline">
                            <img
                              src={
                                job.provider_avatar.startsWith("http")
                                  ? job.provider_avatar
                                  : `http://localhost:3000${job.provider_avatar}`
                              }
                              alt="Provider"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-brand-outline shrink-0 shadow-sm">
                            {job.provider_name
                              ? job.provider_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .substring(0, 2)
                              : "?"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-text-main font-medium truncate">
                            {job.provider_name || "Assigned Provider"}
                          </p>
                          <p className="text-xs text-brand-text-variant mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                            <span className="font-medium text-brand-text-variant">
                              Service Provider
                            </span>
                          </p>
                        </div>
                        <button
                          className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-brand-surface border border-brand-primary/20 transition-all shrink-0 outline-none hover:shadow-lg hover:-translate-y-0.5 duration-200"
                          title="Message Provider"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </div>
                      {job.status === "pending" ? (
                        <button
                          onClick={async () => {
                            if (!job.client_confirmed) {
                              try {
                                await api.sendMessage(
                                  job.provider_id,
                                  "[SYSTEM:CLIENT_CONFIRMED_ARRIVAL]",
                                  job.id,
                                );
                                if (job.provider_arrived) {
                                  await api.updateJobStatus(
                                    Math.floor(job.id),
                                    "in_progress",
                                  );
                                }
                                const channel = new BroadcastChannel(
                                  "dashboard_sync",
                                );
                                channel.postMessage({ type: "DATA_UPDATED" });
                                channel.close();
                                alert(
                                  job.provider_arrived
                                    ? "Worker confirmed! Task is now in progress."
                                    : "You confirmed arrival. Waiting for worker to also confirm.",
                                );
                                // Update local state to trigger UI changes
                                setOngoingJobs(
                                  ongoingJobs.map((j) =>
                                    j.id === job.id
                                      ? {
                                          ...j,
                                          client_confirmed: true,
                                          status: job.provider_arrived
                                            ? "in_progress"
                                            : "pending",
                                        }
                                      : j,
                                  ),
                                );
                              } catch (e) {
                                console.error(e);
                              }
                            }
                          }}
                          disabled={job.client_confirmed}
                          className={`w-full py-3.5 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                            job.client_confirmed
                              ? "bg-brand-surface text-brand-text-variant cursor-not-allowed border border-brand-outline"
                              : "bg-brand-primary text-white hover:bg-brand-primary/90"
                          }`}
                        >
                          <MapPin size={18} />
                          {job.client_confirmed
                            ? "Waiting for Arrival..."
                            : "Confirm Worker is Here"}
                        </button>
                      ) : (
                        <button
                          className="w-full py-3.5 bg-[#059669] text-white text-sm font-bold rounded-xl hover:bg-[#047857] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                          onClick={async () => {
                            try {
                              await api.updateJobStatus(
                                Math.floor(job.id),
                                "completed",
                              );
                              const channel = new BroadcastChannel(
                                "dashboard_sync",
                              );
                              channel.postMessage({ type: "DATA_UPDATED" });
                              channel.close();
                              setOngoingJobs(
                                ongoingJobs.filter((j) => j.id !== job.id),
                              );
                              alert(
                                "Funds released successfully! The professional has been paid and the task is archived.",
                              );
                            } catch (err) {
                              console.error("Failed to complete task", err);
                              alert(
                                'Payment Release Failed: The system encountered an error. Please ensure the professional has clicked "Accept" in their dashboard before you release funds.',
                              );
                            }
                          }}
                        >
                          <CheckCircle2 size={18} />
                          Release Funds
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Provider Profile Details Modal */}
      {selectedProviderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedProviderForView(null)}
          ></div>
          <div className="relative bg-brand-surface-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col text-left max-h-[90vh] border border-white/10">
            {/* Close Button Row */}
            <div className="flex justify-end px-8 pt-6 pb-2 relative z-10">
              <button
                onClick={() => setSelectedProviderForView(null)}
                className="p-2.5 bg-brand-surface hover:bg-brand-outline/50 text-brand-text-variant hover:text-brand-text-main rounded-full transition-all border border-brand-outline shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="px-8 pt-2 flex flex-col sm:flex-row sm:items-end gap-5 mb-6 relative z-10">
              {selectedProviderForView.avatar_url ? (
                <img
                  src={
                    selectedProviderForView.avatar_url.startsWith("http")
                      ? selectedProviderForView.avatar_url
                      : `http://localhost:3000${selectedProviderForView.avatar_url}`
                  }
                  alt={selectedProviderForView.full_name}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-brand-surface-card bg-brand-surface shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-4xl border-4 border-brand-surface-card shadow-2xl shrink-0">
                  {selectedProviderForView.full_name
                    ? selectedProviderForView.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : "?"}
                </div>
              )}
              <div className="mb-2">
                <h3 className="text-2xl font-black text-brand-text-main flex items-center gap-2">
                  {selectedProviderForView.full_name}
                  {selectedProviderForView.is_documents_verified === 1 && (
                    <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-brand-primary/20 flex items-center gap-1">
                      <CheckCircle
                        size={10}
                        className="fill-brand-primary text-white"
                      />{" "}
                      Verified
                    </span>
                  )}
                </h3>
                <span className="inline-block mt-1 px-3 py-1 bg-brand-surface-card text-brand-text-variant border border-brand-outline rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Service Provider
                </span>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-8 overflow-y-auto bg-brand-surface/30 space-y-6">
              {/* Detailed Bio */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.15em] text-brand-text-variant mb-2.5">
                  About Professional
                </h4>
                <div className="bg-brand-surface-card p-5 rounded-2xl border border-brand-outline shadow-inner">
                  <p className="text-sm text-brand-text-main italic leading-relaxed">
                    "
                    {selectedProviderForView.about_me ||
                      "This professional is highly dedicated to delivering world-class service with LingkodHub. Ready to assist you anytime!"}
                    "
                  </p>
                </div>
              </div>

              {/* Services & Offerings */}
              {selectedProviderForView.services && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.15em] text-brand-text-variant mb-2.5">
                    Offered Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProviderForView.services
                      .split(", ")
                      .map((s, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 bg-brand-primary/15 text-brand-primary text-[11px] font-black uppercase tracking-wider rounded-xl border border-brand-primary/25"
                        >
                          {s}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Profile Logistics Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">
                      Location
                    </p>
                    <p className="text-xs font-bold text-brand-text-main">
                      {selectedProviderForView.location || "Dasmariñas"}
                    </p>
                  </div>
                </div>

                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">
                      Coverage Radius
                    </p>
                    <p className="text-xs font-bold text-brand-text-main">
                      {selectedProviderForView.service_radius || 5} km
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                    <Banknote size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">
                      GCash Status
                    </p>
                    <p className="text-xs font-bold text-brand-text-main">
                      {selectedProviderForView.gcash_number ||
                      selectedProviderForView.maya_number
                        ? `Enabled (${selectedProviderForView.gcash_number ? "GCash" : ""} ${selectedProviderForView.maya_number ? "Maya" : ""})`
                        : "Cash Only"}
                    </p>
                  </div>
                </div>

                <div className="bg-brand-surface-card/65 p-4 rounded-2xl border border-brand-outline flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-text-variant uppercase tracking-wider">
                      Average Rating
                    </p>
                    <p className="text-xs font-bold text-brand-text-main">
                      {selectedProviderForView.total_reviews > 0
                        ? `${selectedProviderForView.avg_rating.toFixed(1)} / 5.0 (⭐ ${selectedProviderForView.total_reviews} reviews)`
                        : "New Provider (⭐ New)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div className="p-8 border-t border-brand-outline flex gap-4 bg-brand-surface/50 backdrop-blur-md sticky bottom-0">
              <button
                onClick={() => setSelectedProviderForView(null)}
                className="flex-1 py-4 bg-brand-surface border-2 border-brand-outline hover:bg-brand-surface-card text-brand-text-main rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("hire-provider", {
                      detail: selectedProviderForView,
                    }),
                  );
                  setSelectedProviderForView(null);
                }}
                className="flex-1 py-4 bg-brand-primary text-white hover:bg-[#059669] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 active:scale-95 flex items-center justify-center gap-2"
              >
                Direct Hire Now <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
