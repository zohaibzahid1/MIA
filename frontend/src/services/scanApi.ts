import { graphQLApi } from './graphQlBaseApi';
import { Scan, AIResult, CreateScanInput, PresignedUploadResponse } from '@/types/scan.types';

// ── Queries ────────────────────────────────────────────────

export async function fetchScansByPatient(patientId: string): Promise<Scan[]> {
  const query = `
    query ScansByPatient($patientId: ID!) {
      scansByPatient(patientId: $patientId) {
        id
        patientId
        scanType
        s3Key
        s3Url
        status
        notes
        originalFileName
        fileSize
        mimeType
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.query<{ scansByPatient: Scan[] }>(query, { patientId });
  return response.scansByPatient;
}

export async function fetchScanById(id: string): Promise<Scan> {
  const query = `
    query Scan($id: ID!) {
      scan(id: $id) {
        id
        patientId
        scanType
        s3Key
        s3Url
        status
        notes
        originalFileName
        fileSize
        mimeType
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.query<{ scan: Scan }>(query, { id });
  return response.scan;
}

export async function fetchScanViewUrl(scanId: string): Promise<string> {
  const query = `
    query ScanViewUrl($scanId: ID!) {
      scanViewUrl(scanId: $scanId)
    }
  `;

  const response = await graphQLApi.query<{ scanViewUrl: string }>(query, { scanId });
  return response.scanViewUrl;
}

export async function fetchAIResultsByScan(scanId: string): Promise<AIResult[]> {
  const query = `
    query AIResultsByScan($scanId: ID!) {
      aiResultsByScan(scanId: $scanId) {
        id
        scanId
        modelName
        modelVersion
        status
        predictions
        confidenceScore
        resultData
        processedAt
        processingDurationMs
        createdAt
        updatedAt
      }
    }
  `;

  const response = await graphQLApi.query<{ aiResultsByScan: AIResult[] }>(query, { scanId });
  return response.aiResultsByScan;
}

// ── Mutations ──────────────────────────────────────────────

export async function initiateScanUpload(
  input: CreateScanInput
): Promise<PresignedUploadResponse> {
  const mutation = `
    mutation InitiateScanUpload($input: CreateScanInput!) {
      initiateScanUpload(input: $input) {
        scanId
        uploadUrl
        s3Key
        expiresAt
      }
    }
  `;

  const response = await graphQLApi.mutation<{
    initiateScanUpload: PresignedUploadResponse;
  }>(mutation, { input });
  return response.initiateScanUpload;
}

export async function confirmScanUpload(
  scanId: string,
  s3Key: string
): Promise<Scan> {
  const mutation = `
    mutation ConfirmScanUpload($input: ConfirmUploadInput!) {
      confirmScanUpload(input: $input) {
        id
        patientId
        scanType
        s3Key
        s3Url
        status
        notes
        originalFileName
        fileSize
        mimeType
        createdAt
        updatedAt
        deletedAt
      }
    }
  `;

  const response = await graphQLApi.mutation<{ confirmScanUpload: Scan }>(
    mutation,
    { input: { scanId, s3Key } }
  );
  return response.confirmScanUpload;
}

// ── Direct S3 Upload ───────────────────────────────────────

/**
 * Upload a file directly to S3 using the pre-signed PUT URL.
 * This bypasses GraphQL — it's a direct HTTP PUT to AWS S3.
 */
export async function uploadFileToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = new URL(presignedUrl);
    const signedHeaderQuery = url.searchParams.get('X-Amz-SignedHeaders') || 'unknown';

    console.info('[S3 Upload] Starting upload', {
      method: 'PUT',
      host: url.host,
      path: url.pathname,
      signedHeaders: signedHeaderQuery,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
    });

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.info('[S3 Upload] Upload succeeded', {
          status: xhr.status,
          statusText: xhr.statusText,
          etag: xhr.getResponseHeader('ETag'),
        });
        resolve();
      } else {
        const responseText = xhr.responseText?.slice(0, 1500) || '';
        const responseHeaders = xhr.getAllResponseHeaders();

        console.error('[S3 Upload] Upload failed', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseHeaders,
          responseText,
          hint: 'If this is OPTIONS 403, configure S3 bucket CORS for your frontend origin and PUT/OPTIONS methods.',
        });

        reject(new Error(`S3 upload failed with status ${xhr.status}. ${responseText || 'No response body from S3.'}`));
      }
    });

    xhr.addEventListener('error', () => {
      console.error('[S3 Upload] Network error', {
        readyState: xhr.readyState,
        status: xhr.status,
        statusText: xhr.statusText,
      });
      reject(new Error('S3 upload failed - network error'));
    });

    xhr.addEventListener('abort', () => {
      console.warn('[S3 Upload] Upload aborted by client');
      reject(new Error('S3 upload was aborted'));
    });

    xhr.addEventListener('timeout', () => {
      console.error('[S3 Upload] Upload timed out');
      reject(new Error('S3 upload timed out'));
    });

    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.timeout = 120000;
    xhr.send(file);
  });
}
