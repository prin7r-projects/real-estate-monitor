import { useQuery } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';
import { getProfiles } from 'wasp/client/operations';
import { formatDate, formatPrice } from '../lib/formatters';

export default function ProfilesPage() {
  const { data: profiles, isLoading, error } = useQuery(getProfiles);

  if (isLoading) return <div className="p-8">Loading profiles...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-[var(--bone)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Your Profiles
            </h1>
            <p className="text-[var(--graphite)] mt-2">
              Manage your match profiles. Each profile defines what listings you're looking for.
            </p>
          </div>
          <Link
            to="/profiles/new"
            className="bg-[var(--clay)] text-white px-6 py-3 rounded-full hover:bg-[var(--clay-deep)] transition-colors"
          >
            + New Profile
          </Link>
        </div>

        {!profiles || profiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">No profiles yet</h2>
            <p className="text-[var(--graphite)] mb-6">
              Create your first profile to start receiving scored alerts for matching listings.
            </p>
            <Link
              to="/profiles/new"
              className="inline-block bg-[var(--clay)] text-white px-6 py-3 rounded-full hover:bg-[var(--clay-deep)] transition-colors"
            >
              Create First Profile
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to={`/profiles/${profile.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{profile.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-[var(--graphite)]">
                      <span className="flex items-center gap-1">
                        📍 {profile.city}
                      </span>
                      <span className="flex items-center gap-1">
                        {profile.side === 'rent' ? '🔑' : '🏷️'} {profile.side}
                      </span>
                      <span className="flex items-center gap-1">
                        🛏️ {profile.minBedrooms}+ beds
                      </span>
                      <span className="flex items-center gap-1">
                        📏 {profile.radiusKm}km radius
                      </span>
                    </div>
                    {profile.maxPriceCents > 0 && (
                      <p className="text-sm text-[var(--graphite)] mt-1">
                        Budget: {formatPrice(profile.minPriceCents)} – {formatPrice(profile.maxPriceCents)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : profile.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {profile.status}
                    </span>
                    <span className="text-xs text-[var(--graphite)]">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
