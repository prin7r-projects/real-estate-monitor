import { type User } from "wasp/entities";
import { HttpError } from "wasp/server";
import {
  type GetPaginatedUsers,
} from "wasp/server/operations";

type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    | "id"
    | "email"
    | "subscriptionStatus"
    | "isAdmin"
  >[];
  totalPages: number;
};

export const getPaginatedUsers: GetPaginatedUsers<
  { skipPages: number; filter: { emailContains?: string; isAdmin?: boolean } },
  GetPaginatedUsersOutput
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, "Not authenticated");
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403, "Admin only");
  }

  const pageSize = 10;
  const skip = (rawArgs.skipPages || 0) * pageSize;

  const where: Record<string, unknown> = {};
  if (rawArgs.filter?.emailContains) {
    where.email = { contains: rawArgs.filter.emailContains, mode: "insensitive" };
  }
  if (rawArgs.filter?.isAdmin !== undefined) {
    where.isAdmin = rawArgs.filter.isAdmin;
  }

  const [pageOfUsers, totalUsers] = await Promise.all([
    context.entities.User.findMany({
      skip,
      take: pageSize,
      where,
      select: {
        id: true,
        email: true,
        isAdmin: true,
        subscriptionStatus: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    context.entities.User.count({ where }),
  ]);

  return {
    users: pageOfUsers,
    totalPages: Math.ceil(totalUsers / pageSize),
  };
};
