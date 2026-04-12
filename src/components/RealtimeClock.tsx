import { useEffect, useState } from 'react';

export function RealtimeClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'Asia/Bangkok',
  });
  const timeStr = now.toLocaleTimeString('th-TH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Bangkok',
  });

  return (
    <div className="text-right">
      <p className="text-sm text-muted-foreground">{dateStr}</p>
      <p className="text-lg font-semibold tabular-nums tracking-tight">{timeStr}</p>
    </div>
  );
}
