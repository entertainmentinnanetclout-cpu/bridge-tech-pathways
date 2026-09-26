import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  province: string | null;
  municipality: string | null;
  school_name: string | null;
  current_stage: string;
  highest_qualification: string | null;
  interests: string[];
  onboarding_completed: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSession = { user: User; profile: UserProfile | null };

export const UserContext = createContext<UserSession | null>(null);

export function usePortalUser() {
  const value = useContext(UserContext);
  if (!value) throw new Error("usePortalUser must be used inside the portal");
  return value;
}
