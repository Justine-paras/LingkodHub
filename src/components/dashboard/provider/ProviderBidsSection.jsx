import React from "react";
import { CheckCircle } from "lucide-react";
import { api } from "../../../services/api";
import { UserProfileModal } from "../shared/UserProfileModal";

export const ProviderBidsSection = () => {
  const [offers, setOffers] = React.useState([]);
  const [selectedClientId, setSelectedClientId] = React.useState(null);

  const fetchOffers = React.useCallback(() => {
    api
      .getMyApplications()
      .then((apps) => {
        const appsList = Array.isArray(apps) ? apps : [];

        // Only show offers for jobs that are active or ongoing (pending, open, active, in_progress)
        const validStatuses = ["pending", "open", "active", "in_progress"];
        setOffers(appsList.filter((a) => validStatuses.includes(a.job_status)));
      })
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    fetchOffers();

    const channel = new BroadcastChannel("dashboard_sync");
    channel.onmessage = (event) => {
      if (event.data.type === "DATA_UPDATED") {
        fetchOffers();
      }
    };

    return () => channel.close();
  }, [fetchOffers]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-12 w-full">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-bold text-brand-text-main mb-2">
          My Offers
        </h1>
        <p className="text-sm text-brand-text-variant">
          Track your proposals and communication with potential clients
        </p>
      </div>

      <div className="space-y-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-brand-surface-card border border-brand-outline rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-brand-primary/30 transition-all"
          >
            <div
              onClick={() => setSelectedClientId(offer.client_id)}
              className="cursor-pointer group/client hover:opacity-85 hover:scale-[1.02] transition-all"
              title="Click to view client profile"
            >
              {offer.client_avatar ? (
                <img
                  src={
                    offer.client_avatar.startsWith("http")
                      ? offer.client_avatar
                      : `http://localhost:3000${offer.client_avatar}`
                  }
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-brand-outline group-hover/client:border-brand-primary transition-colors"
                  alt={offer.client_name}
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-emerald-600 flex items-center justify-center text-white text-xl font-extrabold border border-brand-outline shrink-0 shadow-sm group-hover/client:border-brand-primary transition-colors">
                  {offer.client_name
                    ? offer.client_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)
                    : "?"}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h3 className="text-lg font-bold text-brand-text-main group-hover:text-brand-primary transition-colors">
                  {offer.title}
                </h3>
                {offer.status === "accepted" ? (
                  <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-green-100 flex items-center gap-1">
                    <CheckCircle size={10} /> Hired
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded-md uppercase tracking-wider border border-brand-primary/10">
                    {offer.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-text-variant">
                Client:{" "}
                <span
                  onClick={() => setSelectedClientId(offer.client_id)}
                  className="font-bold border-b border-dashed border-brand-outline hover:border-brand-primary text-brand-text-main cursor-pointer hover:text-brand-primary transition-colors"
                >
                  {offer.client_name}
                </span>{" "}
                • Sent {new Date(offer.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-6 md:border-l md:border-brand-outline md:pl-8">
              <div className="text-left md:text-right min-w-[100px]">
                <p className="text-[10px] font-bold text-brand-text-variant uppercase tracking-widest mb-0.5">
                  Your Bid
                </p>
                <p className="text-xl font-bold text-brand-text-main">
                  ₱{Number(offer.budget || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {offer.status === "pending" && (
                  <button
                    onClick={async () => {
                      if (
                        confirm("Are you sure you want to cancel this offer?")
                      ) {
                        try {
                          await api.deleteApplication(offer.id);
                          setOffers((prev) =>
                            prev.filter((o) => o.id !== offer.id),
                          );
                          const channel = new BroadcastChannel(
                            "dashboard_sync",
                          );
                          channel.postMessage({ type: "DATA_UPDATED" });
                          channel.close();
                        } catch (err) {
                          console.error(err);
                          alert("Failed to cancel offer.");
                        }
                      }
                    }}
                    className="px-6 py-2.5 bg-brand-surface border border-brand-outline text-brand-text-variant hover:text-red-500 hover:border-red-100 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancel Offer
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <UserProfileModal
        userId={selectedClientId}
        isOpen={selectedClientId !== null}
        onClose={() => setSelectedClientId(null)}
      />
    </div>
  );
};
