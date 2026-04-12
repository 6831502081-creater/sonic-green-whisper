import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { DecibelReading } from '@/hooks/useDecibelData';

interface Props {
  data: DecibelReading[];
}

export function HistoryChart({ data }: Props) {
  const chartData = [...data]
    .reverse()
    .map((r) => ({
      time: new Date(r.recorded_at).toLocaleTimeString('th-TH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZone: 'Asia/Bangkok',
      }),
      db: r.db_level,
    }));

  return (
    <div className="w-full h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[20, 70]}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'dB', angle: -90, position: 'insideLeft', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <ReferenceLine y={35} stroke="hsl(43, 96%, 56%)" strokeDasharray="4 4" label={{ value: 'Normal', fontSize: 10 }} />
          <ReferenceLine y={55} stroke="hsl(12, 76%, 61%)" strokeDasharray="4 4" label={{ value: 'Loud', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="db"
            stroke="hsl(83, 38%, 49%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(83, 38%, 49%)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
