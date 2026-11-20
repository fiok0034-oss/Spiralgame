import { getTtsHealthPayload } from '../../server/ttsCore.ts';

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'GET, OPTIONS',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: 'A health végpont kizárólag GET metódussal hívható.',
        status: 405,
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  return new Response(JSON.stringify(getTtsHealthPayload('netlify')), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
