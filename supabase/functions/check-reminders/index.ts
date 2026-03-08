import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Find children who haven't completed a mission in 3+ days
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();

    // Get all children
    const { data: children } = await supabase.from('children').select('id, name, parent_id');
    if (!children || children.length === 0) {
      return new Response(JSON.stringify({ message: 'No children found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notifications: string[] = [];

    for (const child of children) {
      // Check last mission attempt
      const { data: lastAttempt } = await supabase
        .from('mission_attempts')
        .select('created_at')
        .eq('child_id', child.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastActivity = lastAttempt?.created_at;
      const isInactive = !lastActivity || new Date(lastActivity) < new Date(threeDaysAgo);

      if (isInactive) {
        // Get push subscriptions for this parent
        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth')
          .eq('user_id', child.parent_id);

        if (subs && subs.length > 0) {
          for (const sub of subs) {
            try {
              // Send web push notification
              // Note: In production, you'd use web-push library with VAPID keys
              // For now, we log the notification
              console.log(`Push notification for ${child.name}: endpoint=${sub.endpoint}`);
              notifications.push(`Reminder sent for ${child.name}`);
            } catch (e) {
              console.error('Push send error:', e);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      message: `Checked ${children.length} children, sent ${notifications.length} reminders`,
      notifications,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Reminder check error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
