import { useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealtimeClock } from '@/components/RealtimeClock';
import { DecibelDisplay } from '@/components/DecibelDisplay';
import { HistoryChart } from '@/components/HistoryChart';
import { HistoryTable } from '@/components/HistoryTable';
import { useLatestReading, useHistory } from '@/hooks/useDecibelData';
import { toast } from 'sonner';
import { Activity, RefreshCw, Download } from 'lucide-react';

const Index = () => {
  const { data: latest } = useLatestReading();
  const { data: history, refetch } = useHistory();
  const prevStatus = useRef<string | null>(null);

  // Loud alert
  useEffect(() => {
    if (!latest) return;
    if (latest.status === 'Loud' && prevStatus.current !== 'Loud') {
      toast.warning(`⚠️ แจ้งเตือน: ระดับเสียงดังเกินไป (${Math.round(latest.db_level)} dB)`, {
        duration: 4000,
      });
    }
    prevStatus.current = latest.status;
  }, [latest]);

  const handleExport = () => {
    if (!history?.length) return;
    const csv = ['No.,dB Level,Status,Date & Time']
      .concat(history.map((r, i) =>
        `${i + 1},${Math.round(r.db_level)},${r.status},"${new Date(r.recorded_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}"`
      ))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decibel_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Decibel Monitor</h1>
          </div>
          <RealtimeClock />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardContent className="pt-8 pb-8 flex justify-center">
                {latest ? (
                  <DecibelDisplay dbLevel={latest.db_level} status={latest.status} />
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Activity className="w-12 h-12 mx-auto mb-3 animate-pulse text-primary/40" />
                    <p className="text-lg font-medium">กำลังรอข้อมูลจาก ESP32...</p>
                    <p className="text-sm">เชื่อมต่อเซนเซอร์แล้วข้อมูลจะแสดงที่นี่</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mini chart on dashboard */}
            {history && history.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">แนวโน้มระดับเสียง</CardTitle>
                </CardHeader>
                <CardContent>
                  <HistoryChart data={history.slice(0, 30)} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">📈 กราฟระดับเสียง</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className="w-4 h-4 mr-1" /> รีเฟรช
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-1" /> Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history && history.length > 0 ? (
                  <HistoryChart data={history} />
                ) : (
                  <p className="text-center text-muted-foreground py-8">ยังไม่มีข้อมูล</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📋 ตารางข้อมูลย้อนหลัง</CardTitle>
              </CardHeader>
              <CardContent>
                <HistoryTable data={history || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
