import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface StoreOption {
  id: string;
  ebay_username: string;
  connected_at: string;
  is_active: boolean;
}

export function useStores() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stores", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("ebay_stores")
        .select("id, ebay_username, connected_at, is_active")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("connected_at", { ascending: true });
      return (data as StoreOption[]) || [];
    },
    enabled: !!user,
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
  });
}
