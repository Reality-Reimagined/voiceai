import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UsageData {
  feature: string;
  count: number;
  limit: number;
}

interface UsageLimits {
  free: {
    'text-to-speech': number;
    'voice-clone': number;
    podcast: number;
  };
  pro: {
    'text-to-speech': number;
    'voice-clone': number;
    podcast: number;
  };
  enterprise: {
    'text-to-speech': number;
    'voice-clone': number;
    podcast: number;
  };
}

export function useUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<Record<string, UsageData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUsage = async () => {
      try {
        const { data: usageData, error: usageError } = await supabase
          .from('usage_logs')
          .select('feature, count')
          .eq('user_id', user.id);

        if (usageError) throw usageError;

        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('plan_id')
          .eq('user_id', user.id)
          .single();

        if (subError) throw subError;

        const limits: UsageLimits = {
          free: {
            'text-to-speech': 50,
            'voice-clone': 1,
            podcast: 5,
          },
          pro: {
            'text-to-speech': 500,
            'voice-clone': 5,
            podcast: 50,
          },
          enterprise: {
            'text-to-speech': Infinity,
            'voice-clone': Infinity,
            podcast: Infinity,
          },
        };

        const planId = subscription?.plan_id as keyof UsageLimits;
        const planLimits = limits[planId || 'free'];

        const usageMap = usageData?.reduce((acc, curr) => {
          acc[curr.feature] = {
            feature: curr.feature,
            count: curr.count,
            limit: planLimits[curr.feature],
          };
          return acc;
        }, {} as Record<string, UsageData>);

        setUsage(usageMap || {});
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();

    const subscription = supabase
      .channel('usage_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_logs',
          filter: `user_id=eq.${user.id}`,
        },
        fetchUsage
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { usage, loading, error };
}




// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from './useAuth';

// interface UsageData {
//   feature: string;
//   count: number;
//   limit: number;
// }

// interface UsageLimits {
//   free: {
//     'text-to-speech': number;
//     'voice-clone': number;
//     podcast: number;
//   };
//   pro: {
//     'text-to-speech': number;
//     'voice-clone': number;
//     podcast: number;
//   };
//   enterprise: {
//     'text-to-speech': number;
//     'voice-clone': number;
//     podcast: number;
//   };
// }

// export function useUsage() {
//   const { user } = useAuth();
//   const [usage, setUsage] = useState<Record<string, UsageData>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const fetchUsage = async () => {
//       try {
//         const { data: usageData, error: usageError } = await supabase
//           .from('usage_logs')
//           .select('feature, count')
//           .eq('user_id', user.id);

//         if (usageError) throw usageError;

//         const { data: subscription, error: subError } = await supabase
//           .from('subscriptions')
//           .select('plan_id')
//           .eq('user_id', user.id)
//           .single();

//         if (subError) throw subError;

//         const limits: UsageLimits = {
//           free: {
//             'text-to-speech': 50,
//             'voice-clone': 1,
//             'podcast': 5
//           },
//           pro: {
//             'text-to-speech': 500,
//             'voice-clone': 5,
//             'podcast': 50
//           },
//           enterprise: {
//             'text-to-speech': Infinity,
//             'voice-clone': Infinity,
//             'podcast': Infinity
//           }
//         };

//         const planId = subscription?.plan_id as keyof UsageLimits;
//         const planLimits = limits[planId || 'free'];
        
//         const usageMap = usageData?.reduce((acc, curr) => {
//           acc[curr.feature] = {
//             feature: curr.feature,
//             count: curr.count,
//             limit: planLimits[curr.feature]
//           };
//           return acc;
//         }, {} as Record<string, UsageData>);

//         setUsage(usageMap || {});
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsage();

//     // Subscribe to usage changes
//     const subscription = supabase
//       .channel('usage_changes')
//       .on('postgres_changes', {
//         event: '*',
//         schema: 'public',
//         table: 'usage_logs',
//         filter: `user_id=eq.${user.id}`
//       }, fetchUsage)
//       .subscribe();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, 
// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from './useAuth';

// interface UsageData {
//   feature: string;
//   count: number;
//   limit: number;
// }

// interface UsageLimits {
//   free: {
//     'text-to-speech': number;
//     'voice-clone': number;
//     podcast: number;
//   };
//   pro: {
//     'text-to-speech': number;
//     'voice-clone': number;
//     podcast: number;
//   };
//   enterprise: {
//     'text-to-speech': number;
//     'voice-clone': number;
//     podcast: number;
//   };
// }

// export function useUsage() {
//   const { user } = useAuth();
//   const [usage, setUsage] = useState<Record<string, UsageData>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     if (!user) return;

//     const fetchUsage = async () => {
//       try {
//         const { data: usageData, error: usageError } = await supabase
//           .from('usage_logs')
//           .select('feature, count')
//           .eq('user_id', user.id);

//         if (usageError) throw usageError;

//         const { data: subscription, error: subError } = await supabase
//           .from('subscriptions')
//           .select('plan_id')
//           .eq('user_id', user.id)
//           .single();

//         if (subError) throw subError;

//         const limits: UsageLimits = {
//           free: {
//             'text-to-speech': 50,
//             'voice-clone': 1,
//             'podcast': 5
//           },
//           pro: {
//             'text-to-speech': 500,
//             'voice-clone': 5,
//             'podcast': 50
//           },
//           enterprise: {
//             'text-to-speech': Infinity,
//             'voice-clone': Infinity,
//             'podcast': Infinity
//           }
//         };

//         const planLimits = limits[subscription?.plan_id || 'free'];
        
//         const usageMap = usageData?.reduce((acc, curr) => {
//           acc[curr.feature] = {
//             feature: curr.feature,
//             count: curr.count,
//             limit: planLimits[curr.feature]
//           };
//           return acc;
//         }, {} as Record<string, UsageData>);

//         setUsage(usageMap || {});
//       } catch (err) {
//         setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsage();

//     // Subscribe to usage changes
//     const subscription = supabase
//       .channel('usage_changes')
//       .on('postgres_changes', {
//         event: '*',
//         schema: 'public',
//         table: 'usage_logs',
//         filter: `user_id=eq.${user.id}`
//       }, fetchUsage)
//       .subscribe();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [user]);

//   const incrementUsage = async (feature: string) => {
//     if (!user) throw new Error('User not authenticated');

//     try {
//       const { error } = await supabase.rpc('increment_usage', {
//         p_user_id: user.id,
//         p_feature: feature
//       });

//       if (error) throw error;
//     } catch (err) {
//       setError(err instanceof Error ? err : new Error('Failed to increment usage'));
//       throw err;
//     }
//   };

//   const checkUsage = (feature: string): boolean => {
//     const featureUsage = usage[feature];
//     if (!featureUsage) return true;
//     return featureUsage.count < featureUsage.limit;
//   };

//   const getUsagePercentage = (feature: string): number => {
//     const featureUsage = usage[feature];
//     if (!featureUsage || featureUsage.limit === Infinity) return 0;
//     return (featureUsage.count / featureUsage.limit) * 100;
//   };

//   return {
//     usage,
//     loading,
//     error,
//     incrementUsage,
//     checkUsage,
//     getUsagePercentage
//   };
// }
