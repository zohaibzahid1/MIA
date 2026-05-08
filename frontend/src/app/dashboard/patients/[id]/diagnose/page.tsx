'use client';
import React, { useEffect, useCallback } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import {
  ArrowLeft,
  Upload,
  Stethoscope,
  X,
  FileImage,
  CheckCircle2,
  Loader2,
  CloudUpload,
} from 'lucide-react';
import { ScanType } from '@/types/scan.types';

const ACCEPTED_EXTENSIONS = '.png,.jpeg,.jpg';

const DiagnosePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { scanUploadStore } = useStore();
  const patientId = params.id as string;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  useEffect(() => {
    return () => scanUploadStore.reset();
  }, [scanUploadStore]);

  // ── Drag & Drop handlers ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        scanUploadStore.selectFile(files[0]);
      }
    },
    [scanUploadStore]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      scanUploadStore.selectFile(files[0]);
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    const success = await scanUploadStore.uploadScan(patientId);
    if (success) {
      // Wait a moment to show success state, then navigate back
      setTimeout(() => {
        router.push(`/dashboard/patients/${patientId}`);
      }, 1500);
    }
  };

  const scanTypeLabels: Record<ScanType, string> = {
    [ScanType.XRAY]: 'X-Ray',
    [ScanType.CT]: 'CT Scan',
    [ScanType.MRI]: 'MRI',
  };

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
            id="btn-back-patient-detail"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Upload Scan
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload a medical image for AI-powered analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {scanUploadStore.error && (
        <ErrorAlert
          error={scanUploadStore.error}
          onDismiss={() => scanUploadStore.clearError()}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Upload Area (spans 2 cols) ──────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-primary" />
                Medical Image
              </CardTitle>
              <CardDescription>
                Drag and drop or browse to select a scan image (PNG, JPEG)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
                className="hidden"
                id="scan-file-input"
              />

              {scanUploadStore.uploadStep === 'done' ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upload Complete!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Redirecting to patient timeline…
                  </p>
                </div>
              ) : !scanUploadStore.selectedFile ? (
                /* ── Drop zone ── */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative flex flex-col items-center justify-center py-16 px-6
                    rounded-xl border-2 border-dashed cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isDragOver
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-muted-foreground/20 bg-muted/20 hover:border-primary/40 hover:bg-muted/40'
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center w-16 h-16 rounded-2xl mb-4
                      transition-all duration-200
                      ${isDragOver ? 'bg-primary/10' : 'bg-muted/50'}
                    `}
                  >
                    <CloudUpload
                      className={`h-8 w-8 transition-colors ${isDragOver
                          ? 'text-primary'
                          : 'text-muted-foreground/40'
                        }`}
                    />
                  </div>

                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    {isDragOver ? 'Drop your file here' : 'Drag & drop your scan image'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    or{' '}
                    <span className="text-primary font-medium underline underline-offset-2">
                      browse files
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className="text-xs">PNG</Badge>
                    <Badge variant="secondary" className="text-xs">JPEG</Badge>
                    <Badge variant="secondary" className="text-xs">JPG</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    Maximum file size: 50 MB
                  </p>
                </div>
              ) : (
                /* ── File preview ── */
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20">
                    {/* Preview image */}
                    {scanUploadStore.filePreviewUrl && (
                      <div className="flex items-center justify-center p-4 bg-black/5 dark:bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={scanUploadStore.filePreviewUrl}
                          alt="Scan preview"
                          className="max-h-64 max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* File info bar */}
                    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-background border-t border-border">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                          <FileImage className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {scanUploadStore.selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(scanUploadStore.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            {' · '}
                            {scanUploadStore.selectedFile.type}
                          </p>
                        </div>
                      </div>

                      {!scanUploadStore.isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => scanUploadStore.removeFile()}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Upload progress */}
                  {scanUploadStore.isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {scanUploadStore.uploadStepLabel}
                        </span>
                        {scanUploadStore.uploadStep === 'uploading' && (
                          <span className="text-foreground font-medium">
                            {scanUploadStore.uploadProgress}%
                          </span>
                        )}
                      </div>
                      <Progress
                        value={
                          scanUploadStore.uploadStep === 'uploading'
                            ? scanUploadStore.uploadProgress
                            : scanUploadStore.uploadStep === 'confirming'
                              ? 100
                              : 30
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Validation error */}
              {scanUploadStore.validationError && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">
                    {scanUploadStore.validationError}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Scan Settings ──────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scan Settings</CardTitle>
              <CardDescription>
                Configure scan type and add notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Scan Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Scan Type
                </label>
                <Select
                  value={scanUploadStore.scanType}
                  onValueChange={(val) => scanUploadStore.setScanType(val as ScanType)}
                  disabled={scanUploadStore.isUploading}
                >
                  <SelectTrigger id="select-scan-type">
                    <SelectValue placeholder="Select scan type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ScanType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {scanTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notes <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  value={scanUploadStore.notes}
                  onChange={(e) => scanUploadStore.setNotes(e.target.value)}
                  placeholder="Add clinical notes about this scan…"
                  className="min-h-[100px] resize-none"
                  disabled={scanUploadStore.isUploading}
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!scanUploadStore.canUpload}
                className="w-full"
                size="lg"
                id="btn-upload-scan"
              >
                {scanUploadStore.isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Scan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Upload Flow Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  Select or drag a medical image
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  Choose scan type and add notes
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  Upload securely to cloud storage
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    4
                  </span>
                  AI analysis processes automatically
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default observer(DiagnosePage);
