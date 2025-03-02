
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface SecretRequest {
  secretName: string;
}

serve(async (req) => {
  try {
    const { secretName } = await req.json() as SecretRequest;
    
    if (!secretName) {
      return new Response(
        JSON.stringify({ success: false, error: "Secret name is required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const secretValue = Deno.env.get(secretName);
    const exists = !!secretValue;
    
    return new Response(
      JSON.stringify({ success: true, exists }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
