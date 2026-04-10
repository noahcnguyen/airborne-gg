import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  ebay_order_id: string;
  state: string;
  tracking_carrier: string;
  tracking_number: string;
  payout_estimate_cents: number;
  actual_amazon_total_cents: number;
  actual_profit_cents: number;
}

export function useDashboardOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        let fetched = false;
        try {
          const res = await fetch(
            'https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data',
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.orders) {
              setOrders(data.orders);
              fetched = true;
            }
          }
        } catch {}

        if (!fetched) {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          if (data) setOrders(data);
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, [user]);

  return { orders };
}
