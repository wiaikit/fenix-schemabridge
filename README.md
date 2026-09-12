# SchemaBridge

SchemaBridge turns small CSV or JSON record sets into a declared set of fields. You choose each source field, output name and type. If a field cannot be converted, the response explains where it failed and returns no partial records.

This folder is a local prototype for the X-Agent Open Innovation idea. It has not been deployed or submitted. It uses no runtime packages, external APIs, model calls, database, payment service or uploaded-file storage.

## Run locally

Node.js 22 or newer is required. No dependency installation is needed. From this directory:

```text
node --test
node tools/demo.mjs
node tools/serve.mjs
```

The demo calls the Worker handler in memory with the three fixture requests. The server command starts a small development HTTP adapter at `http://127.0.0.1:8787`. Stop it with Ctrl+C. The adapter binds only to loopback; it is not a public hosting setup. Set `PORT` if the default port is occupied. Equivalent npm scripts are provided as `test`, `demo` and `start`.

For example, in another PowerShell terminal in this directory:

```powershell
$sampleBody = Get-Content -LiteralPath 'fixtures/csv-request.json' -Raw
Invoke-RestMethod -Uri 'http://127.0.0.1:8787/v1/transform' -Method Post -ContentType 'application/json' -Body $sampleBody
```

The example returns two records. Tea has quantity `7` and availability `true`; coffee has quantity `0` and availability `false`. `fixtures/csv-expected.json` gives the complete expected response. `json-request.json` demonstrates explicit trimming, a nullable field and an omitted optional field. `invalid-request.json` produces HTTP 422 with two field errors.

## HTTP interface

| Method and path | Purpose |
|---|---|
| `POST /v1/transform` | Convert in-body records using the supplied schema. |
| `GET /health` | Report a configured reviewed source commit, or HTTP 503 when missing/invalid. |
| `GET /.well-known/xagent-verification.json` | Report the configured project slug and source commit, or HTTP 503. |
| `GET /openapi.json` | Read the minimal OpenAPI 3.1 description. |

The transformation endpoint always takes an `application/json` envelope, including for CSV:

```json
{
  "format": "json",
  "data": [{ "stock": "7", "active": "false" }],
  "schema": [
    { "source": "stock", "target": "quantity", "type": "integer" },
    { "source": "active", "target": "available", "type": "boolean" }
  ]
}
```

For CSV, set `format` to `"csv"` and provide the text as `data`. The first row is the header. The parser supports comma separators, LF/CRLF record endings, quoted cells, escaped double quotes and newlines inside quoted cells. A leading CSV BOM is accepted. Headers must be unique and non-empty. Blank records are not skipped. A final line ending does not create another record. Wrong column counts or broken quotes return an error; they are not repaired silently. Header-only CSV and an empty JSON array produce an empty result.

JSON input must be an array of flat objects. All cells, including unmapped cells, must be strings, finite numbers, booleans or null. Field names are literal top-level keys; dots do not address nested objects. Unmapped fields are left out of the output. The reserved names `__proto__`, `prototype` and `constructor` are rejected. Schema targets must be unique, though a source may be mapped to several targets.

### Field conversion

| Target type | Accepted values |
|---|---|
| `string` | String, finite number or boolean. Numbers and booleans are converted to text. |
| `integer` | A safe integer number, or its decimal string form. No fractions, exponents, leading plus or extra leading zeros. Values outside JavaScript's safe integer range are rejected. |
| `number` | A finite number, or a JSON-style decimal string, including an exponent. Hexadecimal and non-finite values are rejected. |
| `boolean` | A boolean, or exactly `"true"` or `"false"`. `1`, `"yes"` and `"TRUE"` are not accepted. |

Numbers use JavaScript's IEEE-754 representation. This is not a decimal accounting engine. Send identifiers or integers beyond the safe integer range as strings and keep the target type `string` if their exact digits matter.

Each mapping accepts three optional switches: `required` defaults to `true`, `nullable` to `false`, and `trim` to `false`. A missing optional field is omitted. `nullable: true` preserves an explicit null. Empty CSV cells are empty strings, not null. `trim: true` trims string input before conversion; it never runs automatically. Unknown envelope or schema options are rejected. There are no arbitrary expressions, user-defined code, URL imports or regex transformations.

The success summary counts input/output rows, mappings and cells whose value or type changed. Renaming a field alone is not a cell conversion. Missing optional fields and retained nulls do not increase that count.

### Limits and errors

| Limit | Value |
|---|---:|
| Request body, UTF-8 bytes | 32 KiB, enforced while reading |
| Records | 100 |
| Input fields per record / CSV columns | 20 |
| Schema mappings | 1–20 |
| Source or target name | 64 UTF-16 code units |
| String cell | 2,048 UTF-16 code units |
| Serialized response | 64 KiB maximum |
| Detailed field errors | 40, with a total error count |

The transform also reserves 256 bytes for its success envelope when checking accumulated output. It can therefore reject amplified output slightly below 64 KiB. The Worker handler does not log request bodies or cell values; the offline demo prints only its synthetic fixture results. Errors can include schema names and zero-based row indexes, but do not echo cell values or return a stack trace. Example:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields could not be converted. No records were returned.",
    "details": {
      "totalErrors": 1,
      "truncated": false,
      "fields": [{ "row": 0, "source": "stock", "target": "quantity", "expected": "integer", "code": "TYPE_MISMATCH" }]
    }
  }
}
```

Invalid structure or CSV uses HTTP 400; size limits use 413; unsupported content type or compression uses 415; failed field conversions use 422. Unsupported methods return 405 with `Allow`; unknown routes return 404. Unexpected handler errors return a generic 500. Responses are JSON and carry `Cache-Control: no-store`. The Worker has no mutable request state and does not persist records. The local HTTP adapter has its own bounded transport buffer; it is only a development aid.

## Commit evidence and deployment boundary

The [official X-Agent README](https://github.com/xagentAI/xagt-plugin) was checked on 12 September 2026. It requires a public health response with `status` and the reviewed commit, plus a same-origin `/.well-known/xagent-verification.json` response containing `schemaVersion: 1`, `slug` and that commit. These routes implement those shapes.

The deployment operator must supply `REVIEW_COMMIT` as the actual full 40-character hexadecimal source SHA. The proof route additionally requires `PROJECT_SLUG`, such as `fenix-schemabridge`. Missing, malformed or all-zero commits return HTTP 503, with no invented SHA or successful proof. Neither variable is set in `wrangler.jsonc`. Read the real source SHA from Git when preparing a deployment; test values in the test file are explicitly synthetic.

The handler cannot verify GitHub or deployment provenance without an external request, and deliberately does not make one. A syntactically valid supplied SHA is reported as supplied. Before any submission, the operator must independently match that SHA to the public source and deployed version, then test the real public endpoints. Local health should currently return 503; that is expected.

### Before deployment and entry

Use this sequence when preparing a release. A local source commit does not establish a public deployment or contest entry.

1. **Review the source.** Confirm the intended project files, fixtures and tests. Exclude local environment files, `.wrangler`, dependency caches and credentials. Resolve any review findings before recording the deployment version.
2. **Record a real commit.** Commit that reviewed source in its intended repository. Confirm the checkout is clean with `git status --porcelain`, then read the full SHA using `git rev-parse --verify 'HEAD^{commit}'`. Make the same commit publicly reviewable before entering the event. Do not use a test SHA or commit only an unrelated wrapper.
3. **Configure and deploy that checkout.** Set `REVIEW_COMMIT` to the recorded SHA and `PROJECT_SLUG` to the agreed entry slug in the deployment variables. Keep the SHA outside the source it identifies. Deploy exactly that checkout and retain the resulting deployment/version reference. If the source changes, use its new commit and repeat verification.
4. **Verify the public service.** Without dashboard authentication, check that `/health` returns HTTP 200 with `status: "ok"` and the recorded commit. The same origin's `/.well-known/xagent-verification.json` must return HTTP 200 with `schemaVersion: 1`, the agreed slug and exactly the same commit. Check the CSV fixture against `csv-expected.json`, the JSON fixture and the expected 422 error fixture. Record the URLs and results alongside the source and deployment version. The local smoke script is restricted to loopback and is not a public-deployment verifier.
5. **Prepare the entry from verified evidence.** Follow the official submission templates for `SUBMISSION.md`, `submission.json`, `RIGHTS.md`, complete `source/`, and `verification/README.md` under one `submissions/mcp-hackathon/<project-slug>/` directory. Use the real URLs, source SHA and documented calls; complete registration and the applicable rights declaration before submission. Keep the service reachable for the announced review window and any agreed acceptance checks. Successful HTTP checks alone do not establish eligibility, an award or payment.

The required health/proof shapes and source package above follow the [official submission instructions](https://github.com/xagentAI/xagt-plugin). This checklist does not authenticate, publish or create a commit, and no deployment script is needed to generate a SHA: Git must supply it from the reviewed source.

## Test in the local Workers runtime

`wrangler.jsonc` is a configuration starting point for Cloudflare Workers. The runtime entry uses standard Worker Request/Response APIs; the Node-only files under `tools/` and `test/` are not imported by it. On 12 September, the official Wrangler **4.131.1** ran this entry in local workerd and passed **29 HTTP smoke checks**. No runtime compatibility fix was needed. Cloudflare Free's **10 ms CPU limit**, public accessibility, account setup, continuous availability, contest eligibility and any payout remain unverified. Local request timings do not measure Workers CPU time. [Cloudflare limits](https://developers.cloudflare.com/workers/platform/limits/).

To repeat the local workerd check, start the pinned CLI in one terminal, then run the smoke script in another. These commands use the local runtime with remote bindings disabled; no login or public deployment is needed. The first command may download the official npm package to the npm cache. Confirm the two selected ports are free before starting.

```powershell
$env:WRANGLER_SEND_METRICS = 'false'
npm.cmd exec --yes --package=wrangler@4.131.1 -- wrangler dev --local --ip 127.0.0.1 --port 8789 --inspector-ip 127.0.0.1 --inspector-port 9234 --show-interactive-dev-session=false
```

```text
node tools/workerd-smoke.mjs http://127.0.0.1:8789
```

The smoke script only permits an HTTP origin on `127.0.0.1` and expects unconfigured health/proof routes. Stop Wrangler with Ctrl+C after testing. Generated `.wrangler` files, local environment files and dependency directories are excluded by `.gitignore`; they are not submission source.

## File guide

- `src/transform.mjs`: schema checks, CSV parser and conversion logic.
- `src/worker.mjs`: bounded HTTP body reading, route handling and commit responses.
- `src/openapi.mjs`: the API description served by the Worker.
- `fixtures/`: synthetic requests and expected CSV result.
- `tools/`: offline demo and loopback development adapter.
- `tools/workerd-smoke.mjs`: real HTTP checks against a separately started local Wrangler server.
- `test/worker.test.mjs`: behavior and boundary checks, including real loopback HTTP.
- `VERIFICATION.md`: what was actually run and what remains unverified.

No license or event rights declaration is granted by this prototype. Publishing, accepting program terms and submitting a rights declaration are separate later steps.
