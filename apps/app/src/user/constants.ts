import { routes } from "wasp/client/router";
import { User, LayoutDashboard, Settings } from "lucide-react";

export const userMenuItems = [
  {
    name: "Profiles",
    to: routes.ProfilesRoute.to,
    icon: LayoutDashboard,
    isAuthRequired: true,
    isAdminOnly: false,
  },
  {
    name: "Matches",
    to: routes.MatchesRoute.to,
    icon: LayoutDashboard,
    isAuthRequired: true,
    isAdminOnly: false,
  },
  {
    name: "Account",
    to: routes.AccountRoute.to,
    icon: User,
    isAuthRequired: true,
    isAdminOnly: false,
  },
];
