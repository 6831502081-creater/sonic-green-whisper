import { Volume, Volume1, Volume2 } from 'lucide-react';

interface Props {
  status: 'Quiet' | 'Normal' | 'Loud';
}

export function VolumeIcon({ status }: Props) {
  const iconClass = "w-16 h-16";

  if (status === 'Quiet') {
    return <Volume className={`${iconClass} text-success`} />;
  }
  if (status === 'Normal') {
    return <Volume1 className={`${iconClass} text-warning`} />;
  }
  return <Volume2 className={`${iconClass} text-destructive animate-pulse`} />;
}
