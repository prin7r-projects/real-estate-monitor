import { useState } from "react";
import { Link, routes } from "wasp/client/router";
import { useQuery } from "wasp/client/operations";
import { getProfile, pauseProfile, resumeProfile } from "wasp/client/operations";

function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof d === "string" ? new Date(d) : d);
}

function formatPrice(cents: number): string {
  if (cents === 0) return "No limit";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ProfileDetailPage({ profileId }: { profileId: string }) {
  const { data: profile, isLoading, error, refetch } = useQuery(getProfile, { id: profileId });
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) return <div className="p-8">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;
  if (!profile) return <div className="p-8">Profile not found</div>;

  const handlePauseResume = async () => {
    setIsUpdating(true);
    try {
      if (profile.status === "active") {
        await pauseProfile({ id: profile.id });
      } else {
        await resumeProfile({ id: profile.id });
      }
      refetch();
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link to={routes.ProfilesRoute.to} className="text-[#2545FF] hover:underline">
              &larr; Back to Profiles
            </Link>
            <h1 className="text-3xl font-bold text-[#171417] mt-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {profile.name}
            </h1>
            <div className="flex gap-4 mt-3 text-sm text-[#222222]">
              <span>{profile.city}</span>
              <span>{profile.side}</span>
              <span>{profile.minBedrooms}+ beds</span>
              <span>{profile.radiusKm}km radius</span>
            </div>
            {profile.maxPriceCents > 0 && (
              <p className="text-sm text-[#222222] mt-1">
                Budget: {formatPrice(profile.minPriceCents)} &ndash; {formatPrice(profile.maxPriceCents)}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                profile.status === "active"
                  ? "bg-green-100 text-green-800"
                  : profile.status === "paused"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {profile.status}
            </span>
            <button
              onClick={handlePauseResume}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                profile.status === "active"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              } disabled:opacity-50`}
            >
              {isUpdating ? "Updating..." : profile.status === "active" ? "Pause" : "Resume"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#CCCCCC] p-6">
          <h2 className="text-xl font-semibold text-[#171417] mb-4">
            Recent Matches ({profile.matches?.length || 0})
          </h2>

          {!profile.matches || profile.matches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#222222]">
                No matches yet. We'll alert you when listings matching your criteria appear.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.matches.map((match) => (
                <div key={match.id} className="border border-[#CCCCCC] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#171417]">{match.listing.addressNorm}</p>
                      <div className="flex gap-4 mt-2 text-sm text-[#222222]">
                        <span>{formatPrice(match.listing.priceCents)}</span>
                        {match.listing.sqm && <span>{match.listing.sqm} m&sup2;</span>}
                        {match.listing.bedrooms && <span>{match.listing.bedrooms} beds</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#2545FF]">{Math.round(match.score * 100)}</div>
                      <p className="text-xs text-[#222222]">{formatDate(match.matchedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
