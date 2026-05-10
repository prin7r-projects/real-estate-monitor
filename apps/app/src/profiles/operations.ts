import { HttpError } from "wasp/server";
import type {
  GetProfiles,
  GetProfile,
  CreateProfile,
  UpdateProfile,
  PauseProfile,
  ResumeProfile,
} from "wasp/server/operations";
import type { Profile, Match, Listing } from "wasp/entities";

export const getProfiles: GetProfiles<void, Profile[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  return context.entities.Profile.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};

export const getProfile: GetProfile<
  { id: string },
  Profile & { matches: (Match & { listing: Listing })[] }
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  const profile = await context.entities.Profile.findFirst({
    where: { id: args.id, userId: context.user.id },
    include: {
      matches: {
        include: { listing: true },
        orderBy: { matchedAt: "desc" },
        take: 50,
      },
    },
  });
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }
  return profile;
};

export const createProfile: CreateProfile<
  {
    name: string;
    city: string;
    side: string;
    minPriceCents: number;
    maxPriceCents: number;
    minBedrooms: number;
    radiusKm: number;
  },
  Profile
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  if (!args.name || !args.city) {
    throw new HttpError(400, "Name and city are required");
  }
  return context.entities.Profile.create({
    data: {
      userId: context.user.id,
      name: args.name,
      city: args.city,
      side: args.side || "rent",
      minPriceCents: args.minPriceCents,
      maxPriceCents: args.maxPriceCents,
      minBedrooms: args.minBedrooms,
      radiusKm: args.radiusKm,
      status: "active",
    },
  });
};

export const updateProfile: UpdateProfile<
  {
    id: string;
    name?: string;
    city?: string;
    side?: string;
    minPriceCents?: number;
    maxPriceCents?: number;
    minBedrooms?: number;
    radiusKm?: number;
  },
  Profile
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  const profile = await context.entities.Profile.findFirst({
    where: { id: args.id, userId: context.user.id },
  });
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }
  const { id, ...data } = args;
  return context.entities.Profile.update({ where: { id }, data });
};

export const pauseProfile: PauseProfile<{ id: string }, Profile> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  const profile = await context.entities.Profile.findFirst({
    where: { id: args.id, userId: context.user.id },
  });
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }
  return context.entities.Profile.update({
    where: { id: args.id },
    data: { status: "paused" },
  });
};

export const resumeProfile: ResumeProfile<{ id: string }, Profile> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }
  const profile = await context.entities.Profile.findFirst({
    where: { id: args.id, userId: context.user.id },
  });
  if (!profile) {
    throw new HttpError(404, "Profile not found");
  }
  return context.entities.Profile.update({
    where: { id: args.id },
    data: { status: "active" },
  });
};
