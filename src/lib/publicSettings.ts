import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const PUBLIC_SETTING_KEYS = [
  "announcement",
  "contact_email",
  "contact_phone",
  "intake_url",
  "hero_heading",
  "hero_subheading",
] as const;
type PublicKey = (typeof PUBLIC_SETTING_KEYS)[number];

export function usePublicSetting(key: PublicKey, fallback = ""): string {
  const { data } = useQuery({
    queryKey: ["public", "settings"],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", [...PUBLIC_SETTING_KEYS]);
      if (error) throw error;
      const settings: Record<string, string> = {};
      for (const row of rows ?? []) {
        if (typeof row.value === "string") settings[row.key] = row.value;
      }
      return settings;
    },
    staleTime: 60_000,
    retry: 1,
  });
  const value = data?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
