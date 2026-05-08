import { NextRequest, NextResponse } from 'next/server';

const HF_URL =
  process.env.NEXT_PUBLIC_AI_INFERENCE_URL ||
  'https://faraz8-fyp-medical-image-ai-service.hf.space/v1/infer';

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizePredictions(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      const probability = toNumberOrNull(
        candidate.probability ?? candidate.score ?? candidate.confidence,
      );

      return {
        label:
          typeof candidate.label === 'string'
            ? candidate.label
            : typeof candidate.class === 'string'
              ? candidate.class
              : typeof candidate.finding === 'string'
                ? candidate.finding
                : 'Unknown',
        probability,
        severity:
          typeof candidate.severity === 'string' ? candidate.severity : null,
      };
    });
}

function filterInferenceResponse(raw: Record<string, unknown>) {
  const predictions = normalizePredictions(
    raw?.predictions ??
      (raw?.result as Record<string, unknown> | undefined)?.predictions ??
      (raw?.data as Record<string, unknown> | undefined)?.predictions,
  );

  const confidenceScore =
    toNumberOrNull(raw?.confidenceScore) ??
    toNumberOrNull(raw?.confidence_score) ??
    toNumberOrNull(
      (raw?.result as Record<string, unknown> | undefined)?.confidenceScore,
    ) ??
    toNumberOrNull(
      (raw?.result as Record<string, unknown> | undefined)?.confidence_score,
    ) ??
    (predictions.length > 0
      ? Math.max(...predictions.map((p) => toNumberOrNull(p.probability) ?? 0))
      : null);

  const summary =
    (typeof raw?.summary === 'string' && raw.summary) ||
    (typeof (raw?.result as Record<string, unknown> | undefined)?.summary ===
      'string' &&
      ((raw?.result as Record<string, unknown>).summary as string)) ||
    (predictions.length > 0 ? String(predictions[0].label) : 'No findings');

  return {
    status: typeof raw?.status === 'string' ? raw.status : 'success',
    predictions,
    confidenceScore,
    resultData: {
      summary,
      provider: 'huggingface-space',
      raw,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.formData();

    const modality = incoming.get('modality'); // xray | ct_scan | mri
    const imageUrl = incoming.get('imageUrl');

    if (!modality || !imageUrl) {
      return NextResponse.json(
        { status: 'error', message: 'modality and imageUrl are required' },
        { status: 400 },
      );
    }

    const imageResponse = await fetch(String(imageUrl));
    if (!imageResponse.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Unable to fetch image from imageUrl (HTTP ${imageResponse.status})`,
        },
        { status: 400 },
      );
    }

    const imageType = imageResponse.headers.get('content-type') || 'image/png';
    const imageBuffer = await imageResponse.arrayBuffer();

    // Forward as multipart/form-data to Hugging Face
    const form = new FormData();
    form.append('modality', String(modality));
    form.append('image_url', String(imageUrl));
    form.append(
      'image',
      new Blob([imageBuffer], { type: imageType }),
      'scan-image',
    );

    const hfRes = await fetch(HF_URL, {
      method: 'POST',
      body: form,
    });

    const raw = (await hfRes.json().catch(() => ({}))) as Record<string, unknown>;
    const filtered = filterInferenceResponse(raw);

    return NextResponse.json(filtered, { status: hfRes.status });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: 'error',
        message: err instanceof Error ? err.message : 'Inference failed',
      },
      { status: 500 },
    );
  }
}
