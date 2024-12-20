import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageMeter } from '@/components/usage/UsageMeter';
import { ManageSubscription } from '@/components/subscription/ManageSubscription';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
            <p className="text-2xl font-bold capitalize">{user?.subscription_tier || 'Free'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Current period ends on:</p>
            <p className="text-lg font-medium">
              {user?.subscription_end_date
                ? new Date(user.subscription_end_date).toLocaleDateString()
                : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="capitalize">{user?.subscription_status || 'Free tier'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}