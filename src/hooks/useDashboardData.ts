import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardData {
  activeListings: number;
  totalSold: number;
  avgOrderValue: string;
  fulfillmentCredits: string;
  priceAlerts: string;
  recentOrders: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    date: string;
  }>;
}

export function useDashboardData() {
  const { user, session } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !session?.access_token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data",
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, session?.access_token]);

  return { data, loading };
}

export interface StoreData {
  ebay_username: string;
  connected_at: string;
  access_token_expires_at: string;
  is_active: boolean;
}

export function useStoreData() {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStores = async () => {
      try {
        const { data } = await supabase
          .from("ebay_stores")
          .select("ebay_username, connected_at, access_token_expires_at, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true);

        setStores(data || []);
      } catch (error) {
        console.error("Failed to fetch store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [user]);

  // Backwards compat: expose first store as storeData
  return { stores, storeData: stores[0] || null, loading };
}
