# Verification

Verified on **12 September 2026**, on Windows with **Node.js v24.16.0**. The application has no external runtime dependencies.

| Check | Result |
|---|---|
| `node --test` | 28 passed; 0 failed, skipped or cancelled |
| `node tools/demo.mjs` | CSV and JSON fixtures: HTTP 200; invalid fixture: 422; unconfigured health: 503 |
| Official Wrangler 4.131.1, bundled local workerd | 29 HTTP smoke checks passed; 0 failed |

## Behavior coverage

The Node suite covers all four conversion types, safe integer handling, null/missing/trim behavior, CSV quoting and line endings, malformed input, unknown options, record/field/string/body/output limits, streaming UTF-8 handling, bounded error details, request independence, methods and proof responses. It includes actual loopback HTTP through the development adapter.

The workerd checks used Wrangler's local runtime and bundling, with remote bindings disabled. They verified fixture results, unconfigured health/proof refusal, all four OpenAPI paths, quoted and malformed CSV, exact 32 KiB and oversized bodies, chunked requests, UTF-8 split across individual bytes, JSON/CSV limit boundaries, output amplification and HTTP errors. No core implementation change was needed for that runtime.

Health/proof responses with configured values were tested in the Node suite using explicitly synthetic test values. The local workerd run used no commit configuration and correctly returned 503. No real public commit or deployed proof has been verified.

## Reproduce

Run the first two commands from the project directory:

```text
node --test
node tools/demo.mjs
```

Start **Wrangler 4.131.1** using the loopback-only command in [README.md](README.md#test-in-the-local-workers-runtime), then run:

```text
node tools/workerd-smoke.mjs http://127.0.0.1:8789
```

The checked runtime used HTTP port 8789 and inspector port 9234. It was stopped after testing, and both ports were confirmed closed. [Official Wrangler package](https://www.npmjs.com/package/wrangler/v/4.131.1), [command reference](https://developers.cloudflare.com/workers/wrangler/commands/).

## Remaining checks

Local timings do not establish compliance with Cloudflare Free's **10 ms cloud CPU limit**. Public hosting, real source/deployment provenance, sustained availability and cloud CPU usage remain unverified. The OpenAPI document was served and its path inventory checked; it has not been validated with an external OpenAPI validator.

No X-Agent submission, acceptance, award or payment is established by these tests. Account setup, public deployment and the event's eligibility and rights requirements remain separate steps. No account, repository, source commit, PR or public deployment was created during this local verification.
