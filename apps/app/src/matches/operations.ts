import { HttpError } from 'wasp/server';
import type { GetMatches } from 'wasp/server/operations';
import type { Match, Profile, Listing } from 'wasp/entities';

export const getMatches: GetMatches<
  { profileId?: string; since?: string },
  (Match & { profile: Profile; listing: Listing })[]
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const where: Record<string, unknown> = {
    profile: { userId: context.user.id },
  };

  if (args.profileId) {
    where.profileId = args.profileId;
  }

  if (args.since) {
    where.matchedAt = { gte: new Date(args.since) };
  }

  return context.entities.Match.findMany({
    where,
    include: { profile: true, listing: true },
    orderBy: { matchedAt: 'desc' },
    take: 100,
  });
};
