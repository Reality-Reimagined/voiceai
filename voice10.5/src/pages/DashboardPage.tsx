import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageMeter } from '@/components/usage/UsageMeter';
import { ManageSubscription } from '@/components/subscription/ManageSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// interface User {
//   id: string;
//   email?: string;
// }

interface Subscription {
  status: string;
  current_period_end: string;
  user_id: string;
  plan_id: string;
}

export function DashboardPage(): JSX.Element {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const getSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        }

        setSubscription(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSubscription();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user?.email && (
            <p className="text-gray-500 mt-1">Logged in as: {user.email}</p>
          )}
        </div>
        <ManageSubscription />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageMeter feature="text-to-speech" />
          <UsageMeter feature="voice-clone" />
          <UsageMeter feature="podcast" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{subscription?.plan_id || 'Free'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Current period ends on:</p>
            <p className="text-lg font-medium">
              {subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="capitalize">{subscription?.status || 'Free tier'}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2>Subscription Status</h2>
        <p>Status: {subscription?.status || 'No active subscription'}</p>
        {subscription?.current_period_end && (
          <p>
            Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
