// Supabase Scheduled Edge Function: Nightly GitHub Skill Decay & Freshness Sync
// Configured to trigger via pg_cron at midnight UTC (0 0 * * *)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🌙 [Edge Function: nightly-github-sync] Initiating GitHub Freshness & Skill Decay evaluations...');

    // Enqueue job into ai_job_queue for asynchronous processing by backend workers
    const { data: job, error } = await supabase
      .from('ai_job_queue')
      .insert({
        job_type: 'nightly_github_sync',
        payload: { triggered_by: 'pg_cron_scheduled_edge_function', timestamp: new Date().toISOString() },
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully queued nightly GitHub skill decay and freshness sync job',
        job_id: job.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err: any) {
    console.error('❌ [Edge Function Error]:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
