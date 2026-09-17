# Make Batch API Errors Useful Without Returning Half an Import

A batch importer receives 60 records. One quantity contains `seven`; another is missing. Should the API return the valid records, reject everything, or stop at the first error? Each choice changes what the client must remember before retrying.

In my independent project [SchemaBridge](https://github.com/wiaikit/fenix-schemabridge), a small CSV/JSON transformation API, I chose to return either the complete transformed dataset or an error. That choice simplifies a particular boundary: callers never have to infer which records the transformation endpoint accepted. It also creates an obligation to explain failures precisely enough to repair the batch.

The interesting design problem is making those diagnostics useful while keeping their size and meaning predictable.

## Define the unit of success

SchemaBridge accepts a JSON envelope containing a format, input data, and explicit field mappings. CSV travels as a string inside that envelope. A request supports at most 100 records and 20 mappings, with a 32 KiB request budget and a 64 KiB response budget.

For field-conversion failures, the handler returns HTTP `422`, an error code, and locations. It returns no `data` property, including when earlier records were valid. On success, HTTP `200` contains every transformed record and a summary.

This is atomic **response behavior**, not a database transaction. The endpoint is stateless and performs no database import. A caller that subsequently writes the returned records must implement its own transaction, idempotency, or recovery policy. Receiving one complete dataset does not make a later series of writes atomic.

The following examples run directly against the handler. Save the combined JavaScript blocks as `examples.mjs` in a checkout of SchemaBridge, then run `node examples.mjs` with Node.js 22 or later. No server or network connection is needed:

```mjs
import assert from 'node:assert/strict';
import worker from './src/worker.mjs';

const schema = [
  { source: 'qty', target: 'quantity', type: 'integer' },
];

async function post(data) {
  const response = await worker.fetch(new Request(
    'http://localhost/v1/transform', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ format: 'json', data, schema }),
    },
  ));
  return { status: response.status, body: await response.json() };
}
```

## Return locations that support a repair

Consider a valid zero followed by an invalid quantity:

```mjs
const rejected = await post([{ qty: '0' }, { qty: 'seven' }]);
assert.equal(rejected.status, 422);
assert.equal(Object.hasOwn(rejected.body, 'data'), false);
assert.deepEqual(rejected.body.error.details.fields, [{
  row: 1, source: 'qty', target: 'quantity',
  expected: 'integer', code: 'TYPE_MISMATCH',
}]);

const repaired = await post([{ qty: '0' }, { qty: '7' }]);
assert.equal(repaired.status, 200);
assert.deepEqual(repaired.body.data, [{ quantity: 0 }, { quantity: 7 }]);
console.log('mixed batch:', rejected.status, 'repaired:', repaired.status);
```

The output is `mixed batch: 422 repaired: 200`. The location identifies the source field, destination field, expected type, and zero-based record index. A client can highlight a cell without parsing an English message. The index identifies a parsed record; it should not automatically become a CSV physical line number because quoted cells can contain newlines.

The conversion rules matter just as much as the error shape. An integer string must use the accepted decimal syntax and fit JavaScript's safe-integer range. Empty strings do not become zero, whitespace is trimmed only when requested, and missing fields are distinct from explicit nulls. JSON numeric literals are already parsed before validation, so exact original digits cannot be recovered afterward. Send strings when their exact spelling must be checked.

## Cap diagnostics without disguising the count

Returning every invalid cell can overwhelm both the response and the interface. SchemaBridge retains the first 40 field diagnostics while continuing to count conversion failures:

```mjs
const many = await post(Array.from({ length: 60 }, () => ({
  qty: 'unparsed-quantity',
})));
const details = many.body.error.details;
assert.equal(many.status, 422);
assert.equal(details.totalErrors, 60);
assert.equal(details.fields.length, 40);
assert.equal(details.truncated, true);
assert.equal(details.fields.at(-1).row, 39);
assert.equal(JSON.stringify(many.body).includes('unparsed-quantity'), false);
console.log('diagnostics:', details.totalErrors, details.fields.length,
  details.truncated);
```

This prints `diagnostics: 60 40 true`. Showing “40 errors” would understate the problem. Showing “60 conversion errors; first 40 displayed” tells the user what the response actually contains.

Diagnostics follow input-record order and then schema order. They are not a random sample or a list of the most important failures. A repetitive error near the beginning can therefore occupy every retained slot. That is a deliberate tradeoff: deterministic locations and bounded output are simpler than ranking or grouping errors. Clients can group the returned entries, but cannot infer the distribution of omitted errors.

The payload omits submitted cell values. Field names and positions remain visible, so this is not a claim that errors contain no potentially sensitive metadata. Nor does the diagnostic cap replace the separate body, record, field, cell-length, and serialized-output limits.

## Distinguish a repair report from an interrupted scan

The complete count applies only when processing reaches the field-error response. Structural checks and resource limits can end the scan sooner. An unmapped nested value is still invalid input, and can interrupt a batch after an earlier conversion failure:

```mjs
const interrupted = await post([
  { qty: 'seven' },
  { qty: '8', metadata: { label: 'example' } },
]);
assert.equal(interrupted.status, 400);
assert.equal(interrupted.body.error.code, 'NESTED_VALUE');
assert.deepEqual(interrupted.body.error.details, [{
  row: 1, source: 'metadata',
}]);
assert.equal(Object.hasOwn(interrupted.body, 'data'), false);
console.log('interrupted:', interrupted.status, interrupted.body.error.code);
```

The result is `interrupted: 400 NESTED_VALUE`, not a `422` report about `seven`. The traversal never reaches its final conversion-error response. A caller should fix the structural problem and validate again; another error may then become visible.

The statuses express different recovery steps: `400` covers malformed input or schema structure; `415` covers unsupported representation; `413` covers a resource limit; and `422` reports failed field mappings. Splitting a batch can address some size limits, but cannot repair an invalid cell. Repeating an unchanged rejected request cannot fix its data.

For an import interface, keep the original batch available, apply explicit corrections, and revalidate before committing downstream. If partial acceptance is required later, design stable record identifiers, per-record outcomes, and retry rules explicitly. The smaller contract here is useful precisely because its success boundary, diagnostic limits, and interrupted-scan behavior are all observable.

*Verification: all three examples were checked locally against the project handler on September 17, 2026. Implementation references: `src/worker.mjs`, `src/transform.mjs`, `src/openapi.mjs`, and `test/worker.test.mjs`. This is an original writing sample based on an independent public project.*

Tested source revision: [18d0eac794d0075df3f763bd2a442370e03f02fd](https://github.com/wiaikit/fenix-schemabridge/tree/18d0eac794d0075df3f763bd2a442370e03f02fd). The executable examples were run with Node.js 24.16.0. These articles are independent portfolio samples, not previously commissioned client work.
