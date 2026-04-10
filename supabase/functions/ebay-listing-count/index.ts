import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: store } = await supabase
      .from("ebay_stores")
      .select("access_token")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!store?.access_token) {
      return new Response(JSON.stringify({ total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ebayRes = await fetch(
      "https://api.ebay.com/sell/inventory/v1/inventory_item?limit=1",
      {
        headers: {
          Authorization: `Bearer ${store.access_token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!ebayRes.ok) {
      const text = await ebayRes.text();
      console.error("eBay API error:", ebayRes.status, text);
      return new Response(JSON.stringify({ total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ebayData = await ebayRes.json();
    return new Response(JSON.stringify({ total: ebayData.total || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ total: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
