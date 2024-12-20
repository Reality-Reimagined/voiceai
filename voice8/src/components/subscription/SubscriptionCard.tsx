import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckIcon } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionCardProps {
  tier: {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    highlighted?: boolean;
  };
  currentPlan?: string;
}

export function SubscriptionCard({ tier, currentPlan }: SubscriptionCardProps) {
  const { toast } = useToast();
  const isCurrentPlan = currentPlan === tier.id;

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession(tier.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start subscription process. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={tier.highlighted ? 'border-primary' : undefined}>
      <CardHeader>
        <CardTitle>{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">
          ${tier.price}
          <span className="text-sm font-normal text-muted-foreground">/month</span>
        </div>
        <ul className="space-y-2">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-center">
              <CheckIcon className="mr-2 h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={tier.highlighted ? 'default' : 'outline'}
          onClick={handleSubscribe}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
}