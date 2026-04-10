import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        setPlan(data?.plan || null);
      } catch {
        console.error("Failed to fetch user plan");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1) + " Plan"
    : "Free Plan";

  return { plan, planLabel, loading };
}
