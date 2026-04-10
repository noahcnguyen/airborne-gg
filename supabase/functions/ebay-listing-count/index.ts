import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { data: storeData, error: storeError } = await supabase
      .from("ebay_stores")
      .select("access_token, access_token_expires_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (storeError || !storeData?.access_token) {
      return new Response(JSON.stringify({ count: 0, total: 0, error: "No active eBay store found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ebayRes = await fetch("https://api.ebay.com/sell/inventory/v1/inventory_item?limit=1", {
      headers: {
        Authorization: `Bearer ${storeData.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!ebayRes.ok) {
      const errorText = await ebayRes.text();
      console.error("eBay API error:", ebayRes.status, errorText);
      return new Response(JSON.stringify({ count: 0, total: 0, status: ebayRes.status, details: errorText }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ebayData = await ebayRes.json();
    const count = Number(ebayData?.total ?? ebayData?.count ?? 0);

    return new Response(JSON.stringify({ count, total: count, raw: ebayData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ebay-listing-count:", error);
    return new Response(JSON.stringify({ count: 0, total: 0, error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
