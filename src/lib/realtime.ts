import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useRealtimeRefresh(tables: readonly string[], queryRoot: string) {
  const queryClient = useQueryClient();
  const signature = tables.join(",");

  useEffect(() => {
    const channel = supabase.channel(`techup-${queryRoot}-${signature}`);
    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => void queryClient.invalidateQueries({ queryKey: [queryRoot] }),
      );
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, queryRoot, signature]);
}
