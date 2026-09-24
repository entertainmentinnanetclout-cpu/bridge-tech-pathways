import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

import type { StaffRole } from "@/lib/supabase";

export interface StaffSession {
  user: User;
  role: StaffRole;
}

export const StaffContext = createContext<StaffSession | null>(null);

export function useStaff(): StaffSession {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used inside the admin area");
  return ctx;
}
