import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*,https://voiceai-seven.vercel.app,http://localhost:5173,',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
  })
  
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No stripe signature found')
    }

    const body = await req.text()
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (!session.client_reference_id) {
          throw new Error('No client_reference_id found in session')
        }

        const subscription = {
          user_id: session.client_reference_id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          plan_id: session.metadata?.plan_id || 'default',
          current_period_end: new Date(
            (session.expires_at ?? Date.now()) * 1000
          ).toISOString(),
        }

        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(subscription)

        if (upsertError) {
          throw new Error(`Error upserting subscription: ${upsertError.message}`)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: err.message }), 
      { headers: corsHeaders, status: 400 }
    )
  }
}) 