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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Parse request body
    const body = await req.json();
    const { quantity, store_id, asins } = body;

    if (!store_id) {
      return new Response(
        JSON.stringify({ error: "store_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch refresh_token for the selected store
    const { data: storeData, error: storeError } = await supabase
      .from("ebay_stores")
      .select("refresh_token")
      .eq("id", store_id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (storeError || !storeData?.refresh_token) {
      return new Response(
        JSON.stringify({ error: "No active eBay store found or missing refresh token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiSecret = Deno.env.get("API_SECRET");
    if (!apiSecret) {
      console.error("API_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build payload for the external API
    const apiBody: Record<string, unknown> = {
      user_id: userId,
      refresh_token: storeData.refresh_token,
    };

    if (asins && Array.isArray(asins)) {
      apiBody.asins = asins;
    } else if (quantity) {
      apiBody.quantity = quantity;
    }

    // Forward to external API
    const apiRes = await fetch("https://api.airborne.gg/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Secret": apiSecret,
      },
      body: JSON.stringify(apiBody),
    });

    const apiData = await apiRes.json();

    return new Response(JSON.stringify(apiData), {
      status: apiRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in trigger-listing:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
