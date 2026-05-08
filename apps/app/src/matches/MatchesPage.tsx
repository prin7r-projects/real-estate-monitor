import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';
import { getMatches, getProfiles } from 'wasp/client/operations';
import { formatDate, formatPrice, formatScore } from '../lib/formatters';

export default function MatchesPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>();
  const { data: matches, isLoading, error } = useQuery(getMatches, { profileId: selectedProfileId });
  const { data: profiles } = useQuery(getProfiles);

  if (isLoading) return <div className="p-8">Loading matches...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-[var(--bone)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Match Queue
            </h1>
            <p className="text-[var(--graphite)] mt-2">
              Your scored alerts. Only listings that beat the comp baseline.
            </p>
          </div>
          <Link
            to="/profiles"
            className="text-[var(--clay)] hover:underline"
          >
            Manage Profiles →
          </Link>
        </div>

        {/* Filter by profile */}
        {profiles && profiles.length > 0 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedProfileId(undefined)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                !selectedProfileId
                  ? 'bg-[var(--clay)] text-white'
                  : 'bg-white border border-[var(--contour)] text-[var(--graphite)] hover:border-[var(--clay)]'
              }`}
            >
              All Profiles
            </button>
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedProfileId === profile.id
                    ? 'bg-[var(--clay)] text-white'
                    : 'bg-white border border-[var(--contour)] text-[var(--graphite)] hover:border-[var(--clay)]'
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
        )}

        {/* Matches list */}
        {!matches || matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-[var(--ink)] mb-2">No matches yet</h2>
            <p className="text-[var(--graphite)] mb-6">
              {selectedProfileId
                ? 'No matches for this profile yet. Try broadening your search criteria.'
                : 'Create a profile to start receiving scored alerts for matching listings.'}
            </p>
            {!selectedProfileId && (
              <Link
                to="/profiles/new"
                className="inline-block bg-[var(--clay)] text-white px-6 py-3 rounded-full hover:bg-[var(--clay-deep)] transition-colors"
              >
                Create Profile
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl shadow-sm border border-[var(--contour)] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-[var(--graphite)]">
                        {match.profile.name}
                      </span>
                      <span className="text-xs text-[var(--graphite)]">•</span>
                      <span className="text-xs text-[var(--graphite)]">
                        {match.listing.city}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-[var(--ink)]">
                      {match.listing.addressNorm}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-[var(--graphite)]">
                      <span>💰 {formatPrice(match.listing.priceCents)}</span>
                      {match.listing.sqm && <span>📐 {match.listing.sqm} m²</span>}
                      {match.listing.bedrooms && <span>🛏️ {match.listing.bedrooms} beds</span>}
                      <span>{match.listing.side === 'rent' ? '🔑 Rent' : '🏷️ Sale'}</span>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-3xl font-bold text-[var(--clay)]">
                      {formatScore(match.score)}
                    </div>
                    <p className="text-xs text-[var(--graphite)] mt-1">
                      {formatDate(match.matchedAt)}
                    </p>
                    {match.deliveredEmailAt && (
                      <p className="text-xs text-green-600 mt-1">✓ Emailed</p>
                    )}
                    {match.deliveredTgAt && (
                      <p className="text-xs text-green-600 mt-1">✓ Telegram</p>
                    )}
                  </div>
                </div>

                {/* Score signals */}
                {match.signals && Object.keys(match.signals).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--contour)]">
                    <p className="text-xs text-[var(--graphite)] mb-2">Score breakdown:</p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(match.signals as Record<string, number>).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-[var(--haze)] rounded text-xs text-[var(--graphite)]"
                        >
                          {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
