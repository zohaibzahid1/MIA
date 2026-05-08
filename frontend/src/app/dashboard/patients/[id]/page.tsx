'use client';
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/storeContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  User,
  Stethoscope,
  Calendar,
  FileText,
  Activity,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { ScanStatus } from '@/types/scan.types';
import { updatePatient } from '@/services/patientApi';

/* ───────────── Chart config ───────────── */
const chartConfig: ChartConfig = {
  scans: {
    label: 'Scans',
    color: 'var(--color-chart-1)',
  },
};

/* ───────────── Status helpers ───────────── */
const statusVariant = (status: string) => {
  switch (status) {
    case ScanStatus.PROCESSED:
      return 'success' as const;
    case ScanStatus.PROCESSING:
    case ScanStatus.UPLOADING:
      return 'warning' as const;
    case ScanStatus.FAILED:
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
};

const statusLabel = (status: string) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

/* ───────────── Custom Tooltip ───────────── */
interface TooltipPayloadItem {
  payload: {
    scanType: string;
    status: string;
    formattedDate: string;
    formattedTime: string;
    scanId: string;
  };
}

const ScanTooltipContent = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2.5 shadow-xl backdrop-blur-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-chart-1" />
          <span className="text-sm font-semibold text-foreground">
            {data.scanType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge
            variant={statusVariant(data.status)}
            className="text-[10px] px-1.5 py-0"
          >
            {statusLabel(data.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {data.formattedDate} · {data.formattedTime}
        </div>

        <div className="pt-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground/70">
            Click to view results →
          </span>
        </div>
      </div>
    </div>
  );
};

/* ───────────── Custom Dot ───────────── */
interface DotProps {
  cx?: number;
  cy?: number;
  payload?: {
    status: string;
    scanId: string;
  };
}

const ClickableDot = ({ cx, cy, payload }: DotProps) => {
  if (cx === undefined || cy === undefined || !payload) return null;

  const isProcessed = payload.status === ScanStatus.PROCESSED;

  return (
    <g>
      {/* Glow ring */}
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill="var(--color-chart-1)"
        opacity={0.15}
        className="animate-pulse"
      />
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={isProcessed ? 'var(--color-chart-1)' : 'var(--color-chart-5)'}
        stroke="var(--color-background)"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
};

/* ───────────── Page Component ───────────── */
const PatientDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { patientDetailStore } = useStore();
  const patientId = params.id as string;

  // ── Notes modal state ──
  const [isNotesModalOpen, setIsNotesModalOpen] = React.useState(false);
  const [editedNotes, setEditedNotes] = React.useState('');
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);

  useEffect(() => {
    patientDetailStore.loadAll(patientId);
    return () => patientDetailStore.reset();
  }, [patientId, patientDetailStore]);

  const handleDiagnoseClick = () => {
    router.push(`/dashboard/patients/${patientId}/diagnose`);
  };

  const handleChartClick = (data: { activePayload?: Array<{ payload: { scanId: string } }> }) => {
    if (data?.activePayload?.[0]?.payload?.scanId) {
      const scanId = data.activePayload[0].payload.scanId;
      router.push(`/dashboard/patients/${patientId}/scans/${scanId}`);
    }
  };

  const handleNotesClick = () => {
    setEditedNotes(patientDetailStore.patient?.notes || '');
    setIsNotesModalOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!patientDetailStore.patient) return;
    setIsSavingNotes(true);
    try {
      await updatePatient(patientDetailStore.patient.id, { notes: editedNotes });
      // Reload patient to get fresh data
      await patientDetailStore.loadPatient(patientId);
      setIsNotesModalOpen(false);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  /* ─── Loading ─── */
  if (patientDetailStore.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-56" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Error ─── */
  if (patientDetailStore.error) {
    return (
      <div className="space-y-6">
        <ErrorAlert
          error={patientDetailStore.error}
          onDismiss={() => patientDetailStore.clearError()}
        />
        <Button variant="outline" onClick={() => router.push('/dashboard/patients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </div>
    );
  }

  const patient = patientDetailStore.patient;
  const timelineData = patientDetailStore.timelineData;

  return (
    <div className="space-y-6">
      {/* ── 1. Patient Detail Header ──────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/patients')}
            className="shrink-0"
            id="btn-back-patients"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {patientDetailStore.patientFullName || 'Unknown Patient'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                MRN: {patient?.medicalRecordNumber ?? '—'}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDiagnoseClick}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
          id="btn-diagnose"
        >
          <Stethoscope className="h-4 w-4" />
          Diagnose
        </Button>
      </div>

      {/* ── Patient Info Summary ─────────────────────────── */}
      {patient && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date of Birth
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(patient.dateOfBirth)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Gender
                </p>
                <p className="text-sm font-medium text-foreground">
                  {patient.gender
                    ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase()
                    : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(patient.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Scans
                </p>
                <p className="text-sm font-medium text-foreground">
                  {patientDetailStore.scans.length}
                </p>
              </div>
            </div>

            {/* ── Notes row with clickable "........" ── */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Notes
                </p>
                <span
                  onClick={handleNotesClick}
                  className="text-primary hover:text-primary/80 underline decoration-dotted underline-offset-4 cursor-pointer font-bold tracking-widest text-sm"
                  title={patient.notes || 'No notes — click to add'}
                >
                  ........
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 2. Scans Timeline Chart ──────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Scans Timeline
              </CardTitle>
              <CardDescription className="mt-1">
                Chronological view of all uploaded scans. Click a point to view results.
              </CardDescription>
            </div>
            {timelineData.length > 0 && (
              <Badge variant="secondary" className="shrink-0">
                {timelineData.length} scan{timelineData.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {timelineData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                <Activity className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No scans yet
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Start by uploading a scan for this patient using the Diagnose button above.
              </p>
              <Button variant="outline" className="mt-6" onClick={handleDiagnoseClick}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Upload First Scan
              </Button>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <LineChart
                data={timelineData}
                margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                onClick={handleChartClick}
                style={{ cursor: 'pointer' }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  dataKey="value"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  label={{
                    value: 'Scan #',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12, fill: 'var(--color-muted-foreground)' },
                  }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={<ScanTooltipContent />}
                  cursor={{
                    stroke: 'var(--color-primary)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={<ClickableDot />}
                  activeDot={{
                    r: 8,
                    fill: 'var(--color-chart-1)',
                    stroke: 'var(--color-background)',
                    strokeWidth: 3,
                    className: 'cursor-pointer drop-shadow-md',
                  }}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Notes Modal ────────────────────────────────────── */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Patient Notes — {patient?.firstName} {patient?.lastName}
            </DialogTitle>
            <DialogDescription>
              View and edit patient notes below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Enter patient notes..."
              className="min-h-[200px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNotesModalOpen(false)}
              disabled={isSavingNotes}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={isSavingNotes}>
              {isSavingNotes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default observer(PatientDetailPage);
