import { ApiError, LIMITS, transform } from './transform.mjs';
import { openapi } from './openapi.mjs';
import { homepageHtml, homepageCss, homepageJs } from './homepage.mjs';

const encoder = new TextEncoder();
const routes = new Map([
  ['/', 'GET'], ['/v1', 'GET'],
  ['/assets/app.css', 'GET'], ['/assets/app.js', 'GET'],
  ['/v1/transform', 'POST'], ['/health', 'GET'],
  ['/.well-known/xagent-verification.json', 'GET'], ['/openapi.json', 'GET'],
]);

function pageAsset(body, contentType) {
  return new Response(body, { headers: {
    'content-type': contentType,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  } });
}

function json(value, status = 200, headers = {}) {
  const body = JSON.stringify(value);
  if (encoder.encode(body).byteLength > LIMITS.outputBytes) {
    throw new ApiError(413, 'OUTPUT_LIMIT', 'Serialized response exceeds 64 KiB.');
  }
  return new Response(body, { status, headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers,
  } });
}

async function readJson(request) {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send an application/json envelope for both CSV and JSON data.');
  const encoding = request.headers.get('content-encoding');
  if (encoding && encoding.toLowerCase() !== 'identity') throw new ApiError(415, 'UNSUPPORTED_ENCODING', 'Compressed request bodies are not supported.');
  const declared = request.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > LIMITS.bodyBytes)) {
    throw new ApiError(413, 'BODY_LIMIT', 'Request body exceeds 32 KiB or has an invalid length.');
  }
  if (!request.body) throw new ApiError(400, 'INVALID_JSON', 'Request body is empty.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0, text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > LIMITS.bodyBytes) {
        await reader.cancel().catch(() => {});
        throw new ApiError(413, 'BODY_LIMIT', 'Request body exceeds 32 KiB.');
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch (error) {
    await reader.cancel().catch(() => {});
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, 'INVALID_BODY', 'Body must be a readable UTF-8 stream.');
  } finally { reader.releaseLock(); }
  try { return JSON.parse(text); }
  catch { throw new ApiError(400, 'INVALID_JSON', 'Body must contain valid JSON.'); }
}

function proofConfig(env, needsSlug) {
  const commit = env.REVIEW_COMMIT;
  if (typeof commit !== 'string' || !/^[a-fA-F0-9]{40}$/.test(commit) || /^0{40}$/.test(commit)) {
    throw new ApiError(503, 'DEPLOYMENT_UNVERIFIED', 'A real reviewed source commit has not been configured.');
  }
  const slug = env.PROJECT_SLUG;
  if (needsSlug && (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80)) {
    throw new ApiError(503, 'DEPLOYMENT_UNVERIFIED', 'A valid project slug has not been configured.');
  }
  return { commit, slug };
}

export default {
  async fetch(request, env = {}) {
    try {
      const path = new URL(request.url).pathname;
      const method = routes.get(path);
      if (!method) return json({ ok: false, error: { code: 'NOT_FOUND', message: 'Unknown API route.' } }, 404);
      if (request.method !== method) return json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Unsupported HTTP method.' } }, 405, { allow: method });
      if (path === '/') return pageAsset(homepageHtml, 'text/html; charset=utf-8');
      if (path === '/assets/app.css') return pageAsset(homepageCss, 'text/css; charset=utf-8');
      if (path === '/assets/app.js') return pageAsset(homepageJs, 'text/javascript; charset=utf-8');
      if (path === '/v1') {
        return json({ name: 'SchemaBridge', version: '0.1.0',
          description: 'Map small CSV or JSON record sets to explicit field names and types.',
          capability: { method: 'POST', path: '/v1/transform', contentType: 'application/json' },
          documentation: '/openapi.json', health: '/health',
          deploymentProof: '/.well-known/xagent-verification.json',
          limits: { requestBytes: LIMITS.bodyBytes, records: LIMITS.rows },
        });
      }
      if (path === '/health') {
        const { commit } = proofConfig(env, false);
        return json({ status: 'ok', commit });
      }
      if (path === '/.well-known/xagent-verification.json') {
        const { commit, slug } = proofConfig(env, true);
        return json({ schemaVersion: 1, slug, commit });
      }
      if (path === '/openapi.json') return json(openapi);
      return json(transform(await readJson(request)));
    } catch (error) {
      if (error instanceof ApiError) return json({ ok: false, error: {
        code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}),
      } }, error.status);
      return json({ ok: false, error: { code: 'INTERNAL_ERROR', message: 'Unexpected processing error.' } }, 500);
    }
  },
};
