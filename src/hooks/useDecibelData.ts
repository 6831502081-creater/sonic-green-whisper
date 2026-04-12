import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DecibelReading {
  id: string;
  db_level: number;
  status: 'Quiet' | 'Normal' | 'Loud';
  recorded_at: string;
}

export function useLatestReading() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['latest-reading'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decibel_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data as DecibelReading;
    },
    refetchInterval: 2000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-decibel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'decibel_readings',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['latest-reading'] });
        queryClient.invalidateQueries({ queryKey: ['history'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useHistory(limit = 100) {
  return useQuery({
    queryKey: ['history', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decibel_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as DecibelReading[];
    },
    refetchInterval: 5000,
  });
}
