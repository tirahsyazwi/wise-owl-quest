import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BAYARCASH_API_URL = 'https://api.console.bayar.cash/v3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PAT = Deno.env.get('BAYARCASH_PAT');
    const PORTAL_KEY = Deno.env.get('BAYARCASH_PORTAL_KEY');
    const API_SECRET = Deno.env.get('BAYARCASH_API_SECRET_KEY');
    
    if (!PAT || !PORTAL_KEY || !API_SECRET) {
      throw new Error('Bayarcash credentials not configured');
    }

    const { plan, amount, payer_name, payer_email, user_id, return_url } = await req.json();

    if (!plan || !amount || !payer_name || !payer_email || !user_id) {
      throw new Error('Missing required fields');
    }

    // Create checksum using HMAC-SHA256
    const checksumData = `${PORTAL_KEY}|${amount}|${payer_name}|${payer_email}|${plan}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(API_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(checksumData));
    const checksum = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Create payment intent via Bayarcash API v3
    const paymentData = {
      portal_key: PORTAL_KEY,
      order_number: `SM-${Date.now()}-${user_id.substring(0, 8)}`,
      amount: amount.toString(),
      payer_name,
      payer_email,
      payer_telephone_no: '',
      product_description: `SparkMind ${plan} subscription`,
      return_url: return_url || `${req.headers.get('origin')}/pricing`,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/bayarcash-webhook`,
      checksum,
      metadata: JSON.stringify({ user_id, plan }),
    };

    const response = await fetch(`${BAYARCASH_API_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAT}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Bayarcash API error [${response.status}]: ${JSON.stringify(result)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      checkout_url: result.url,
      payment_intent_id: result.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Bayarcash checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
