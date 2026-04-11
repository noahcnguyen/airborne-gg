import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getNestedValue = (source: unknown, path: string[]): unknown => {
  let current: unknown = source;

  for (const key of path) {
    const record = asRecord(current);
    if (!record || !(key in record)) {
      return null;
    }

    current = record[key];
  }

  return current;
};

const getFirstNumber = (source: unknown, paths: string[][]): number => {
  for (const path of paths) {
    const value = asNumber(getNestedValue(source, path));
    if (value !== null) return value;
  }

  return 0;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const storeId = url.searchParams.get("store_id");

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
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Build query for the specific store or first active store
    let query = supabase
      .from("ebay_stores")
      .select("id, access_token, access_token_expires_at")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (storeId) {
      query = query.eq("id", storeId);
    }

    const { data: storeData, error: storeError } = await query.order("connected_at", { ascending: true }).limit(1).single();

    if (storeError || !storeData?.access_token) {
      return new Response(JSON.stringify({ error: "No active eBay store found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get remaining monthly selling limits from Trading API summary
    const sellingSummaryXml = `<?xml version="1.0" encoding="utf-8"?>
<GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${storeData.access_token}</eBayAuthToken>
  </RequesterCredentials>
  <Summary>
    <Include>true</Include>
  </Summary>
</GetMyeBaySellingRequest>`;

    const sellingSummaryRes = await fetch("https://api.ebay.com/ws/api.dll", {
      method: "POST",
      headers: {
        "X-EBAY-API-SITEID": "0",
        "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
        "X-EBAY-API-CALL-NAME": "GetMyeBaySelling",
        "X-EBAY-API-IAF-TOKEN": storeData.access_token,
        "Content-Type": "text/xml",
      },
      body: sellingSummaryXml,
    });

    const sellingSummaryText = await sellingSummaryRes.text();

    // Parse XML response for selling limits and store subscription
    const getTag = (xml: string, tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1] : "";
    };

    // Extract Trading API summary limits
    const sellingSummaryMatch = sellingSummaryText.match(/<Summary>([\s\S]*?)<\/Summary>/);
    const sellingSummary = sellingSummaryMatch ? sellingSummaryMatch[1] : "";

    // Get selling limits from the REST API
    const limitsRes = await fetch("https://apiz.ebay.com/sell/account/v1/privilege", {
      headers: {
        Authorization: `Bearer ${storeData.access_token}`,
        Accept: "application/json",
      },
    });

    let limitsData: Record<string, unknown> = {};
    if (limitsRes.ok) {
      limitsData = await limitsRes.json();
      console.log("eBay privilege API response:", JSON.stringify(limitsData));
    } else {
      const errText = await limitsRes.text();
      console.error("eBay privilege API error:", limitsRes.status, errText);
    }

    const itemsLimitFromRest = getFirstNumber(limitsData, [
      ["sellingLimit", "quantity"],
      ["sellingLimit", "quantityLimit"],
      ["sellingLimitQuantity"],
      ["quantityLimit"],
    ]);

    const amountLimitFromRest = getFirstNumber(limitsData, [
      ["sellingLimit", "amount", "value"],
      ["sellingLimit", "amount"],
      ["amountLimit", "value"],
      ["amountLimit"],
    ]);

    const itemsRemainingFromXml = asNumber(getTag(sellingSummary, "QuantityLimitRemaining"));
    const amountRemainingFromXml = asNumber(getTag(sellingSummary, "AmountLimitRemaining"));

    const itemsLimit = itemsLimitFromRest || itemsRemainingFromXml || 0;
    const amountLimit = amountLimitFromRest || amountRemainingFromXml || 0;

    // Try to get store subscription info
    let subscription = "No Store";
    let freeListings = 0;

    // Use GetStore API for subscription info
    const storeXml = `<?xml version="1.0" encoding="utf-8"?>
<GetStoreRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${storeData.access_token}</eBayAuthToken>
  </RequesterCredentials>
</GetStoreRequest>`;

    const storeRes = await fetch("https://api.ebay.com/ws/api.dll", {
      method: "POST",
      headers: {
        "X-EBAY-API-SITEID": "0",
        "X-EBAY-API-COMPATIBILITY-LEVEL": "967",
        "X-EBAY-API-CALL-NAME": "GetStore",
        "X-EBAY-API-IAF-TOKEN": storeData.access_token,
        "Content-Type": "text/xml",
      },
      body: storeXml,
    });

    const storeText = await storeRes.text();
    const subLevelMatch = storeText.match(/<SubscriptionLevel>([^<]*)<\/SubscriptionLevel>/);
    if (subLevelMatch) {
      subscription = subLevelMatch[1];
      // Free listings by tier
      const tierListings: Record<string, number> = {
        "Starter": 250,
        "Basic": 1000,
        "Premium": 10000,
        "Anchor": 25000,
        "Enterprise": 100000,
      };
      freeListings = tierListings[subscription] || 0;
    }

    // Get active listing count for usage estimate
    const activeRes = await fetch("https://api.ebay.com/sell/inventory/v1/inventory_item?limit=1", {
      headers: {
        Authorization: `Bearer ${storeData.access_token}`,
        Accept: "application/json",
      },
    });

    let itemsUsed = itemsLimit > 0 && itemsRemainingFromXml !== null
      ? Math.max(itemsLimit - itemsRemainingFromXml, 0)
      : 0;

    if (activeRes.ok) {
      const activeData = await activeRes.json();
      if (itemsUsed === 0) {
        itemsUsed = activeData?.total || 0;
      }
    }

    const amountUsed = amountLimit > 0 && amountRemainingFromXml !== null
      ? Math.max(amountLimit - amountRemainingFromXml, 0)
      : 0;

    return new Response(JSON.stringify({
      subscription,
      free_listings: freeListings,
      items_limit: itemsLimit,
      items_used: itemsUsed,
      amount_limit: amountLimit,
      amount_used: amountUsed,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ebay-store-info:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
