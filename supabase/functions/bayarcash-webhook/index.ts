import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const API_SECRET = Deno.env.get('BAYARCASH_API_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!API_SECRET) throw new Error('API secret not configured');

    const body = await req.json();
    console.log('Bayarcash webhook received:', JSON.stringify(body));

    const { payment_intent_id, transaction_id, status, metadata } = body;

    let parsedMeta: { user_id?: string; plan?: string } = {};
    try {
      parsedMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata || {};
    } catch { /* ignore */ }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Update payment record
    if (payment_intent_id) {
      await supabase
        .from('payments')
        .update({
          status: status === '3' || status === 'successful' ? 'success' : 'failed',
          bayarcash_transaction_id: transaction_id,
        })
        .eq('bayarcash_payment_intent_id', payment_intent_id);
    }

    // If payment successful, activate subscription
    if ((status === '3' || status === 'successful') && parsedMeta.user_id && parsedMeta.plan) {
      const durations: Record<string, number> = {
        monthly: 30 * 86400000,
        yearly: 365 * 86400000,
      };
      const duration = durations[parsedMeta.plan] || 30 * 86400000;

      await supabase
        .from('subscriptions')
        .update({
          plan: parsedMeta.plan,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + duration).toISOString(),
        })
        .eq('user_id', parsedMeta.user_id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
