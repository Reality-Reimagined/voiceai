import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Add this type declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'buy-button-id': string;
        'publishable-key': string;
        'client-reference-id'?: string;
      };
    }
  }
}

export function SubscriptionButton() {
  const { user } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <stripe-buy-button
      buy-button-id={import.meta.env.VITE_STRIPE_BUY_BUTTON_ID}
      publishable-key={import.meta.env.VITE_STRIPE_PUBLIC_KEY}
      client-reference-id={user?.id}
    />
  );
} 