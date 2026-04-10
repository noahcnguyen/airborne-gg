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

export function useDashboardOrders(storeId?: string) {
  const { user, session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user || !session?.access_token) return;

    const fetchOrders = async () => {
      try {
        let fetched = false;
        try {
          const url = storeId
            ? `https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data?store_id=${storeId}`
            : 'https://dopntxyftolkcrbumgbb.supabase.co/functions/v1/dashboard-data';
          const res = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.orders) {
              setOrders(data.orders);
              fetched = true;
            }
          }
        } catch {}

        if (!fetched) {
          let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          if (storeId) {
            query = query.eq('ebay_store_id', storeId);
          }
          const { data } = await query;
          if (data) setOrders(data);
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, [user, session?.access_token, storeId]);

  return { orders };
}
