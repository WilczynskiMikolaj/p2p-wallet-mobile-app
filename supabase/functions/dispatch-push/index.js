import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import { processJob } from "./worker.mjs";

Deno.serve(async (req) => {
  const secret = Deno.env.get("PUSH_DISPATCH_SECRET");
  if (!secret || req.headers.get("x-dispatch-secret") !== secret)
    return new Response("Unauthorized", { status: 401 });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });
  const client = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: jobs, error } = await client.rpc("stage3_claim_push");
  if (error) return new Response("Unable to claim jobs", { status: 500 });
  const api = {
    async ownsToken(token, userId) {
      const { data, error } = await client
        .from("push_devices")
        .select("token")
        .eq("token", token)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    async removeToken(token, userId) {
      const { error } = await client
        .from("push_devices")
        .delete()
        .eq("token", token)
        .eq("user_id", userId);
      if (error) throw error;
    },
    async update(job, values) {
      const { error } = await client
        .from("push_jobs")
        .update({ ...values, lease_id: null })
        .eq("id", job.id)
        .eq("lease_id", job.lease_id);
      if (error) throw error;
    },
    async expo(path, body) {
      const headers = { "Content-Type": "application/json" };
      const accessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const response = await fetch(`https://exp.host/--/api/v2/push/${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("PUSH_HTTP_ERROR");
      return response.json();
    },
  };
  try {
    for (let i = 0; i < jobs.length; i += 10)
      await Promise.all(
        jobs.slice(i, i + 10).map((job) => processJob(job, api)),
      );
    return Response.json({ processed: jobs.length });
  } catch {
    return new Response("Dispatcher failed; leases will expire", {
      status: 500,
    });
  }
});
