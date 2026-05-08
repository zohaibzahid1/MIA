"use client";

import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { UploadCloud, FileSpreadsheet, Trash2, CheckCircle2, Loader2, Download } from "lucide-react";
import { allUserStore } from "@/stores/allUserStore";

const MAX_SIZE_MB = 5;

const CsvUpload = observer(() => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const validate = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) return "Only .csv files are allowed.";
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large. Max ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const onPick = (f: File | null) => {
    if (!f) return;
    const v = validate(f);
    if (v) {
      setError(v);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onPick(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    onPick(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const success = await allUserStore.uploadEmployeesCSV(file);
      if (success) {
        await allUserStore.fetchUsers();
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("CSV upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = useCallback(() => {
    const sample = [
      "email,name,role",
      "jane.smith@company.com,Jane Smith,employee",
      "ali.khan@company.com,Ali Khan,manager",
    ].join("\n");

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees_sample.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl tracking-tight text-[#8E51FF]">Upload Employees CSV</CardTitle>
            <CardDescription className="mt-1">
              Import employees in bulk. Accepted format: <span className="font-medium">.csv</span>
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full">Max {MAX_SIZE_MB} MB</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drop area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={[
            "rounded-xl border border-dashed p-6 transition",
            isDragging ? "border-[#8E51FF] bg-[#8E51FF]/5" : "border-zinc-300 hover:bg-zinc-50",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-8 w-8 opacity-70" />
              <div className="text-sm text-zinc-700">
                <div className="font-medium">Drag & drop</div>
                <div className="text-xs text-zinc-500">…or choose a CSV from your device</div>
              </div>
            </div>

            {/* Button asChild → label triggers file input (shadcn pattern) */}
            <Button asChild variant="outline" className="rounded-lg">
              <label className="cursor-pointer">
                Browse
                <Input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5" />
              <div className="leading-tight">
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-zinc-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • CSV
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <Badge variant="outline" className="gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading…
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready
                </Badge>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={reset}
                    disabled={loading}
                    className="hover:bg-red-50"
                    aria-label="Remove selected file"
                    title="Remove selected file"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear selection</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500">
            Tip: Use the sample to match required columns.
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={downloadSample} className="rounded-lg">
              <Download className="mr-2 h-4 w-4" />
              Sample CSV
            </Button>

            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="rounded-lg bg-[#8E51FF] hover:bg-[#733acc] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Upload CSV"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default CsvUpload;
