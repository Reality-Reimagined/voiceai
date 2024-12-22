import { Button } from '@/components/ui/button';
import { createPortalSession } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

export function ManageSubscription() {
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open subscription management. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button variant="outline" onClick={handleManageSubscription}>
      Manage Subscription
    </Button>
  );
}