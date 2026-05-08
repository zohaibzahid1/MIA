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
  ArrowLeft,
  Activity,
  FileImage,
  FileJson,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  HardDrive,
  FileType,
  Braces,
} from 'lucide-react';
import { AIResultStatus, ScanStatus } from '@/types/scan.types';

/* ───────────── Status badge helper ───────────── */
const statusConfig: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'; label: string }
> = {
  [ScanStatus.PENDING]: { variant: 'secondary', label: 'Pending' },
  [ScanStatus.UPLOADING]: { variant: 'warning', label: 'Uploading' },
  [ScanStatus.UPLOADED]: { variant: 'secondary', label: 'Uploaded' },
  [ScanStatus.PROCESSING]: { variant: 'warning', label: 'Processing' },
  [ScanStatus.PROCESSED]: { variant: 'success', label: 'Processed' },
  [ScanStatus.FAILED]: { variant: 'destructive', label: 'Failed' },
};

const aiStatusConfig: Record<
  string,
  { variant: 'secondary' | 'success' | 'destructive'; label: string }
> = {
  [AIResultStatus.PENDING]: { variant: 'secondary', label: 'AI Pending' },
  [AIResultStatus.COMPLETED]: { variant: 'success', label: 'AI Complete' },
  [AIResultStatus.FAILED]: { variant: 'destructive', label: 'AI Failed' },
};

/* ───────────── JSON Viewer ───────────── */
const JsonViewer = ({ data, label }: { data: unknown; label: string }) => {
  if (!data) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="relative rounded-lg bg-muted/50 border border-border/50 overflow-hidden">
        <pre className="p-4 text-xs leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto text-foreground/80 font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

/* ───────────── Page Component ───────────── */
const ScanResultPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { scanResultStore } = useStore();
  const patientId = params.id as string;
  const scanId = params.scanId as string;

  useEffect(() => {
    scanResultStore.loadAll(scanId);
    return () => scanResultStore.reset();
  }, [scanId, scanResultStore]);

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  /* ─── Loading ─── */
  if (scanResultStore.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (scanResultStore.error) {
    return (
      <div className="space-y-6">
        <ErrorAlert
          error={scanResultStore.error}
          onDismiss={() => scanResultStore.clearError()}
        />
        <Button variant="outline" onClick={() => router.push(`/dashboard/patients/${patientId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patient
        </Button>
      </div>
    );
  }

  const scan = scanResultStore.scan;
  const scanViewUrl = scanResultStore.scanViewUrl;
  const status = scan?.status || ScanStatus.PENDING;
  const config = statusConfig[status] || statusConfig[ScanStatus.PENDING];
  const aiResult = scanResultStore.primaryResult;
  const aiStatus = aiResult?.status;
  const aiStatusMeta = aiStatus ? aiStatusConfig[aiStatus] : null;

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/patients/${patientId}`)}
            className="shrink-0"
            id="btn-back-patient-timeline"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Scan Result
                </h1>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {scan?.originalFileName || 'Unknown file'}
                {scan?.scanType && ` · ${scan.scanType}`}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => scanResultStore.refresh(scanId)}
          disabled={scanResultStore.isLoading}
          id="btn-refresh-results"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* ── PENDING / PROCESSING view ────────────────── */}
      {scanResultStore.isPending && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-primary/20">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {scanResultStore.statusLabel}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                Your scan has been uploaded and is awaiting AI analysis.
                This page will automatically update when results are available.
              </p>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Checking for updates every 5 seconds
              </div>

              {aiStatusMeta && (
                <Badge variant={aiStatusMeta.variant} className="mt-4">
                  {aiStatusMeta.label}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── FAILED view ──────────────────────────────── */}
      {scanResultStore.isFailed && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Processing Failed
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
                Something went wrong during AI analysis. You can try uploading the scan again
                from the patient detail page.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => router.push(`/dashboard/patients/${patientId}/diagnose`)}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── PROCESSED view ───────────────────────────── */}
      {scanResultStore.isProcessed && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Scan Image ── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileImage className="h-4 w-4 text-primary" />
                  Scan Image
                </CardTitle>
                <CardDescription>
                  Uploaded medical image
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanViewUrl ? (
                  <div className="rounded-lg overflow-hidden border border-border bg-black/5 dark:bg-white/5 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scanViewUrl}
                      alt={scan.originalFileName || 'Scan image'}
                      className="max-w-full max-h-[400px] mx-auto object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `
                          <div class="flex flex-col items-center justify-center py-16 text-center">
                            <p class="text-sm text-muted-foreground">Image could not be loaded.</p>
                            <p class="text-xs text-muted-foreground/60 mt-1">The secure URL may have expired. Click Refresh to request a new one.</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
                    <FileImage className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No secure image URL available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── AI Analysis Summary ── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileJson className="h-4 w-4 text-primary" />
                      AI Analysis
                    </CardTitle>
                    <CardDescription>
                      Diagnostic predictions and confidence scores
                    </CardDescription>
                  </div>
                  {aiResult && aiStatusMeta && (
                    <Badge variant={aiStatusMeta.variant} className="gap-1">
                      {aiResult.status === AIResultStatus.COMPLETED && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {aiStatusMeta.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {aiResult ? (
                  <div className="space-y-4">
                    {/* Model info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Model
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {aiResult.modelName}
                        </p>
                      </div>
                      {aiResult.modelVersion && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Version
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {aiResult.modelVersion}
                          </p>
                        </div>
                      )}
                      {aiResult.confidenceScore !== null && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Confidence
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {(aiResult.confidenceScore * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {aiResult.processingDurationMs !== null && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Processing Time
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {aiResult.processingDurationMs}ms
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Predictions */}
                    <JsonViewer data={aiResult.predictions} label="Predictions" />

                    {/* Result Data */}
                    <JsonViewer data={aiResult.resultData} label="Result Data" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
                    <Braces className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No AI results available yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ── Scan Metadata (always visible when scan loaded) ── */}
      {scan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scan Details</CardTitle>
            <CardDescription>
              Metadata and processing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <FileType className="h-3 w-3" />
                  Scan Type
                </div>
                <p className="text-sm font-medium text-foreground">
                  {scan.scanType}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <HardDrive className="h-3 w-3" />
                  File Size
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatFileSize(scan.fileSize)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />
                  Uploaded
                </div>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(scan.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <FileType className="h-3 w-3" />
                  MIME Type
                </div>
                <p className="text-sm font-medium text-foreground">
                  {scan.mimeType || '—'}
                </p>
              </div>
            </div>

            {scan.notes && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {scan.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default observer(ScanResultPage);
