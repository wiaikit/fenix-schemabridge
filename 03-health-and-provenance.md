# What a Commit in a Health Response Actually Proves

You deploy a service, request `/health`, and receive an `ok` status beside a commit identifier. That is useful operational information. Whether it identifies the code serving the request depends on how that identifier reached the response.

My independent project [SchemaBridge](https://github.com/wiaikit/fenix-schemabridge) exposes two small metadata endpoints. Its implementation makes this distinction unusually easy to inspect: the handler reads values supplied by the deployment operator, validates their format, and returns them. It does not calculate a source hash or inspect a deployed artifact.

Understanding that boundary lets you write useful tests without turning a passing test into a stronger claim than the implementation supports.

## A configuration gate with a narrow meaning

SchemaBridge's `proofConfig` function reads `REVIEW_COMMIT`. It requires a string containing exactly 40 hexadecimal characters and rejects an all-zero value. Missing or malformed configuration causes HTTP `503` with `DEPLOYMENT_UNVERIFIED`.

That behavior catches configuration mistakes before a status page displays a successful response. It does not establish that the supplied identifier exists in Git, that someone reviewed it, or that the deployment contains its code. Those facts require evidence outside this function.

The following three blocks form one runnable `examples.mjs` file in a SchemaBridge checkout. They use Node.js 22 or later and invoke the handler directly. The URL constructs a request object; nothing listens on localhost and no network request is sent.

```mjs
import assert from 'node:assert/strict';
import worker from './src/worker.mjs';

async function inspect(path, env = {}) {
  const response = await worker.fetch(
    new Request(`http://localhost${path}`), env,
  );
  return { status: response.status, body: await response.json() };
}

const missing = await inspect('/health');
assert.equal(missing.status, 503);
assert.equal(missing.body.error.code, 'DEPLOYMENT_UNVERIFIED');
assert.equal(Object.hasOwn(missing.body, 'commit'), false);
console.log('missing configuration:', missing.status);
```

The result is `missing configuration: 503`. This tests the local failure contract. It does not mean the deployment is unavailable, because no deployment was contacted. Conversely, this endpoint's success does not test every application feature or external dependency. Its implemented check is the configuration gate.

## Test the value's origin, not just its shape

For a positive unit test, use an explicitly synthetic value. Here, 40 repeated `1` characters are a local fixture, not a calculated hash or an asserted repository revision. This fixture must never be published as deployment verification.

```mjs
// Synthetic local fixture only; not a source or artifact hash.
const syntheticCommit = '1'.repeat(40);
const fixtureEnv = { REVIEW_COMMIT: syntheticCommit };
const configured = await inspect('/health', fixtureEnv);
assert.equal(configured.status, 200);
assert.deepEqual(configured.body, { status: 'ok', commit: syntheticCommit });
console.log('synthetic local configuration:', configured.status);
```

The output is `synthetic local configuration: 200`. The important assertion is that the response preserves the supplied value. The handler accepts its syntax; it does not derive the value from executable bytes.

An honest test name might be “returns the configured commit identifier.” Calling it “verifies the deployed commit” would hide the central limitation. The OpenAPI description likewise identifies this as an operator-supplied value. The word `reviewed` in a variable name or error message cannot independently establish that review occurred.

Configuration metadata still earns its place. When populated accurately, it helps operators correlate an instance with release records, identify stale configuration, and compare environments. Its usefulness comes from the surrounding release process maintaining that relationship.

## A project binding adds validation, not attestation

The second endpoint, `/.well-known/xagent-verification.json`, also requires `PROJECT_SLUG`. A valid slug contains lowercase letters or digits, optionally separated by single hyphens, and is at most 80 characters long. The successful response contains `schemaVersion`, `slug`, and `commit`.

```mjs
const proofPath = '/.well-known/xagent-verification.json';
const absentSlug = await inspect(proofPath, fixtureEnv);
const invalidSlug = await inspect(proofPath, {
  ...fixtureEnv, PROJECT_SLUG: 'local_fixture',
});
assert.equal(absentSlug.status, 503);
assert.equal(invalidSlug.status, 503);

const localProof = await inspect(proofPath, {
  ...fixtureEnv, PROJECT_SLUG: 'local-fixture',
});
assert.equal(localProof.status, 200);
assert.deepEqual(localProof.body, {
  schemaVersion: 1, slug: 'local-fixture', commit: syntheticCommit,
});
console.log('local slug checks:', absentSlug.status,
  invalidSlug.status, localProof.status);
```

This prints `local slug checks: 503 503 200`. Notice that `/health` succeeded without a slug, while the binding endpoint rejected its absence. A monitor checking only `/health` would miss that specific configuration defect.

The binding is useful for associating a claimed revision with a project name. Neither the well-known path nor the response schema adds a signature, an artifact digest, or an independent verifier. SchemaBridge's OpenAPI explicitly describes the binding as something other than independent build provenance.

## Keep evidence attached to the claim it supports

A local handler test establishes behavior under supplied inputs. A successful live HTTPS request would add evidence that the contacted endpoint responded through that connection. It would still not identify the deployed artifact merely because the body contained a plausible commit string. TLS and a source-to-artifact relationship answer different questions.

For stronger release evidence, distinguish three relationships: the reviewed source revision, the build artifact produced from that source and its declared inputs, and the artifact selected by the deployment process. Build records or attestations can document the second relationship; deployment records can document the third. Their value depends on who produced them, what they cover, and how they are verified. A source identifier alone does not capture build tools, dependency resolution, or configuration.

None of those additional mechanisms is implemented or validated by these examples. The local checks do not exercise Cloudflare production, certificate validation, deployment settings, or the identity of a served artifact.

Report the observations separately: “local configuration checks passed,” “the live endpoint returned this value,” and “release evidence binds this artifact to this revision.” Keeping those statements separate makes missing evidence visible and avoids asking a green health indicator to carry more meaning than it has.

*Verification: the three JavaScript blocks were executed locally on September 17, 2026. References: `src/worker.mjs`, `src/openapi.mjs`, and the proof-route cases in `test/worker.test.mjs`. This is an original writing sample based on an independent public project; all identifiers used in the executable examples are synthetic local fixtures.*

Tested source revision: [18d0eac794d0075df3f763bd2a442370e03f02fd](https://github.com/wiaikit/fenix-schemabridge/tree/18d0eac794d0075df3f763bd2a442370e03f02fd). The executable examples were run with Node.js 24.16.0. These articles are independent portfolio samples, not previously commissioned client work.
