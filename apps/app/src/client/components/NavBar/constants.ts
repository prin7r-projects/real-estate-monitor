import { routes } from "wasp/client/router";
import type { NavigationItem } from "./NavBar";

export const marketingNavigationItems: NavigationItem[] = [
  { name: "Profiles", to: routes.ProfilesRoute.to },
  { name: "Matches", to: routes.MatchesRoute.to },
] as const;

export const demoNavigationitems: NavigationItem[] = [
  { name: "Profiles", to: routes.ProfilesRoute.to },
  { name: "Matches", to: routes.MatchesRoute.to },
] as const;
