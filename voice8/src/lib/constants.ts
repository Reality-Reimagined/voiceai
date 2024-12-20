export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for trying out our services',
    features: [
      '50 text-to-speech credits/month',
      '1 voice clone',
      'Basic podcast creation',
      'Standard support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    description: 'For professionals and content creators',
    features: [
      '500 text-to-speech credits/month',
      '5 voice clones',
      'Advanced podcast creation',
      'Priority support',
      'Custom voice styles'
    ],
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'For businesses with advanced needs',
    features: [
      'Unlimited text-to-speech credits',
      'Unlimited voice clones',
      'Enterprise podcast creation',
      '24/7 dedicated support',
      'API access',
      'Custom integration'
    ]
  }
];