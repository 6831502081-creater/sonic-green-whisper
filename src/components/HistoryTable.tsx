import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { DecibelReading } from '@/hooks/useDecibelData';

interface Props {
  data: DecibelReading[];
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  Quiet: 'secondary',
  Normal: 'default',
  Loud: 'destructive',
};

export function HistoryTable({ data }: Props) {
  return (
    <div className="rounded-lg border overflow-auto max-h-[400px]">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="w-16">No.</TableHead>
            <TableHead>dB Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r, i) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-sm">{i + 1}</TableCell>
              <TableCell className="font-semibold">{Math.round(r.db_level)} dB</TableCell>
              <TableCell>
                <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(r.recorded_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                ยังไม่มีข้อมูล — รอ ESP32 ส่งค่าเข้ามา
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
