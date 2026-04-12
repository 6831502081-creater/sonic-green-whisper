import { VolumeIcon } from './VolumeIcon';

interface Props {
  dbLevel: number;
  status: 'Quiet' | 'Normal' | 'Loud';
}

const statusColors: Record<string, string> = {
  Quiet: 'bg-success/10 border-success/30 text-success',
  Normal: 'bg-warning/10 border-warning/30 text-warning',
  Loud: 'bg-destructive/10 border-destructive/30 text-destructive',
};

const statusLabels: Record<string, string> = {
  Quiet: '🤫 เงียบ (Quiet)',
  Normal: '🔊 ปกติ (Normal)',
  Loud: '🔴 ดัง! (Loud)',
};

export function DecibelDisplay({ dbLevel, status }: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main circle */}
      <div className="relative w-56 h-56 rounded-full bg-primary/10 border-4 border-primary/30 flex flex-col items-center justify-center shadow-lg">
        <VolumeIcon status={status} />
        <span className="text-6xl font-black tracking-tighter mt-1">{Math.round(dbLevel)}</span>
        <span className="text-lg font-medium text-muted-foreground">dB</span>
      </div>

      {/* Status badge */}
      <div className={`px-5 py-2 rounded-full border text-sm font-semibold ${statusColors[status]}`}>
        {statusLabels[status]}
      </div>
    </div>
  );
}
