import { useQuery } from "wasp/client/operations";
import { Link, routes } from "wasp/client/router";
import { getProfiles } from "wasp/client/operations";

function formatDate(d: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
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

export default function ProfilesPage() {
  const { data: profiles, isLoading, error } = useQuery(getProfiles);

  if (isLoading) return <div className="p-8">Loading profiles...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#171417]" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Your Profiles
            </h1>
            <p className="text-[#222222] mt-2">Manage your match profiles. Each profile defines what listings you're looking for.</p>
          </div>
          <Link to={routes.ProfileNewRoute.to}
            className="bg-[#2545FF] text-white px-6 py-3 rounded-full hover:bg-[#1A2EBC] transition-colors">
            + New Profile
          </Link>
        </div>

        {!profiles || profiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#CCCCCC] p-12 text-center">
            <h2 className="text-xl font-semibold text-[#171417] mb-2">No profiles yet</h2>
            <p className="text-[#222222] mb-6">Create your first profile to start receiving scored alerts for matching listings.</p>
            <Link to={routes.ProfileNewRoute.to}
              className="inline-block bg-[#2545FF] text-white px-6 py-3 rounded-full hover:bg-[#1A2EBC] transition-colors">
              Create First Profile
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <div key={profile.id}
                className="block bg-white rounded-2xl shadow-sm border border-[#CCCCCC] p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#171417]">{profile.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-[#222222]">
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
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.status === "active" ? "bg-green-100 text-green-800"
                        : profile.status === "paused" ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {profile.status}
                    </span>
                    <span className="text-xs text-[#222222]">{formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
