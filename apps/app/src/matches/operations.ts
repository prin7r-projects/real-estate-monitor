import { HttpError } from 'wasp/server';
import type { GetMatches, GetMatchDetail } from 'wasp/server/operations';
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

export const getMatchDetail: GetMatchDetail<
  { id: string },
  Match & { profile: Profile; listing: Listing }
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  const match = await context.entities.Match.findFirst({
    where: {
      id: args.id,
      profile: { userId: context.user.id },
    },
    include: { profile: true, listing: true },
  });

  if (!match) {
    throw new HttpError(404, 'Match not found');
  }

  return match;
};
