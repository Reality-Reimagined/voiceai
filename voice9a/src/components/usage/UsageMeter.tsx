import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUsage } from '@/hooks/useUsage';

interface UsageMeterProps {
  feature: string;
}

export function UsageMeter({ feature }: UsageMeterProps) {
  const { usage, getUsagePercentage } = useUsage();
  const featureUsage = usage[feature];
  const percentage = getUsagePercentage(feature);

  if (!featureUsage) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{feature}</span>
        <span>
          {featureUsage.count} / {featureUsage.limit === Infinity ? 'Unlimited' : featureUsage.limit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      
      {percentage >= 80 && (
        // <Alert variant="warning" className="mt-2">
        <Alert className="mt-2">
          <AlertDescription>
            You're approaching your usage limit. Consider upgrading your plan to continue using this feature.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
