import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const createCheckoutSession = async (priceId: string) => {
  try {
    const { data: { session } } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId }
    });

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const createPortalSession = async () => {
  try {
    const { data: { url } } = await supabase.functions.invoke('create-portal-session');
    if (!url) throw new Error('No URL returned from portal session creation');
    window.location.href = url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};