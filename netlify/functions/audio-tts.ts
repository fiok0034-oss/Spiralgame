import {
  classifyTtsError,
  generateHungarianTtsAudio,
  normalizePersona,
} from '../../server/ttsCore.ts';

const JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        error: 'A TTS végpont kizárólag POST metódussal hívható.',
        status: 405,
      },
      405
    );
  }

  let body: { text?: unknown; persona?: unknown; model?: unknown } | null = null;
  try {
    body = (await req.json()) as { text?: unknown; persona?: unknown; model?: unknown };
  } catch {
    return jsonResponse(
      {
        error: 'Érvénytelen JSON törzs érkezett a TTS kérésben.',
        status: 400,
      },
      400
    );
  }

  const rawText = typeof body?.text === 'string' ? body.text.trim() : '';
  const persona = normalizePersona(body?.persona);
  const modelOverride = typeof body?.model === 'string' ? body.model : undefined;

  if (!rawText || rawText.length > 1500) {
    return jsonResponse(
      {
        error:
          'Érvénytelen vagy túl hosszú szöveg érkezett a hanggeneráláshoz (1–1500 karakter engedélyezett).',
        status: 400,
      },
      400
    );
  }

  try {
    const result = await generateHungarianTtsAudio(rawText, persona, modelOverride);
    return jsonResponse(result as unknown as Record<string, unknown>, 200);
  } catch (error: unknown) {
    const classified = classifyTtsError(error);
    console.error('[netlify/audio-tts] Error:', classified.status);
    return jsonResponse(
      {
        error: classified.error,
        status: classified.status,
        endpoint: '/api/audio/tts',
      },
      classified.status
    );
  }
}
