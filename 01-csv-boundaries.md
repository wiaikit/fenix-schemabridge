# A CSV cell is text until your import contract says otherwise

A CSV import can finish without throwing an exception and still change the meaning of its data. The text `false` becomes a truthy JavaScript value. An identifier loses its last digit when converted to a number. An empty field gets treated as a missing field, even though the sender deliberately supplied it.

These are separate decisions from finding the commas. A useful import boundary first parses the file into records, then applies explicit conversion rules. Keeping those steps separate makes both failures and successful transformations easier to explain.

This walkthrough uses the JavaScript ES module implementation in [SchemaBridge](https://github.com/wiaikit/fenix-schemabridge), a small CSV/JSON transformation project. Its contract is deliberately narrow: flat records, named field mappings, and no automatic type inference. The examples use synthetic data, not a customer incident.

Use Node.js 22 or newer and a local checkout of that repository. Save the following three JavaScript blocks, in order, as `csv-boundaries.mjs` at the repository root, then run `node csv-boundaries.mjs`. They import the transformation function directly; no packages, credentials, server, or network connection are required for execution.

The first example puts three tempting shortcuts into one record: a large numeric identifier, a description containing commas and quotes, and a boolean-looking string.

```javascript
import assert from 'node:assert/strict';
import { transform } from './src/transform.mjs';

const schema = [
  { source: 'id', target: 'id', type: 'string' },
  { source: 'description', target: 'description', type: 'string' },
  { source: 'active', target: 'active', type: 'boolean' },
];
const csv = 'id,description,active\r\n'
  + '9007199254740993,"First line, with ""quotes""\nSecond line",false\r\n';
const parsed = transform({ format: 'csv', data: csv, schema });
assert.deepEqual({ ...parsed.data[0] }, {
  id: '9007199254740993',
  description: 'First line, with "quotes"\nSecond line',
  active: false,
});
assert.equal(parsed.data.length, 1);
console.log('Parsed record:', JSON.stringify(parsed.data[0]));

assert.throws(() => transform({
  format: 'csv', data: 'id,description,active\nx,"closed"tail,false', schema,
}), error => error.code === 'INVALID_CSV');
```

Splitting on commas would break the description; splitting on line endings would turn one record into two. The parser tracks whether it is inside a quoted cell. In that state, commas and newlines are data, and doubled quotes produce one literal quote. After the closing quote, it accepts a delimiter, a record ending, or the end of input. The `tail` suffix is rejected rather than silently appended.

The final CRLF does not create another record. That is different from an additional blank record, which this parser preserves. It also requires consistent column counts and unique, non-empty headers. These choices matter when an upstream export changes: a malformed row should not quietly shift values into the wrong fields.

Parsing leaves the identifier as text. Only the mapping converts `active` to a boolean. That distinction is what protects the identifier while giving the flag its intended type.

JavaScript's general-purpose conversion functions do not express this contract. `Boolean('false')` returns `true`, because any non-empty string is truthy. SchemaBridge accepts actual booleans or the exact strings `true` and `false`. Whitespace removal is a separate, opt-in step.

```javascript
const convertOne = (value, type, options = {}) => transform({
  format: 'json', data: [{ value }],
  schema: [{ source: 'value', target: 'result', type, ...options }],
}).data[0].result;

assert.equal(Boolean('false'), true);
assert.equal(convertOne('false', 'boolean'), false);
for (const value of ['yes', 'TRUE', '1', ' false ']) {
  assert.throws(() => convertOne(value, 'boolean'),
    error => error.code === 'VALIDATION_FAILED');
}
assert.equal(convertOne(' false ', 'boolean', { trim: true }), false);

const id = '9007199254740993';
assert.equal(convertOne(id, 'string'), id);
assert.throws(() => convertOne(id, 'integer'),
  error => error.code === 'VALIDATION_FAILED');
const decoded = JSON.parse('{"id":9007199254740993}');
assert.equal(decoded.id, 9007199254740992);
assert.equal(convertOne(decoded.id, 'string'), '9007199254740992');
console.log('Identifier after numeric JSON parsing:', decoded.id);
```

The integer conversion checks `Number.isSafeInteger`. It also rejects strings such as `01` and `1e2`, even though JavaScript can turn them into numbers. An identifier is usually a better candidate for `string`: its spelling may matter, and arithmetic is not its purpose.

The JSON example exposes an earlier boundary. By the time the transformer receives a numeric JSON value, JavaScript may already have rounded it. Converting that value back to a string preserves the rounded value, not the original digits. Keep identifiers quoted throughout the pipeline. A validator cannot reconstruct information that disappeared during decoding.

Missing, null, and empty values need equally explicit treatment. In a JSON update, absence might mean “leave unchanged,” while `null` might mean “clear this value.” A CSV cell does not carry that distinction automatically. Both an unquoted empty cell and `""` become an empty string in this implementation.

```javascript
const noteSchema = [{
  source: 'note', target: 'note', type: 'string',
  required: false, nullable: true,
}];
const notes = transform({
  format: 'json', data: [{}, { note: null }, { note: '' }],
  schema: noteSchema,
});
assert.deepEqual(notes.data.map(row => ({ ...row })),
  [{}, { note: null }, { note: '' }]);
const emptyCells = transform({
  format: 'csv', data: 'key,note\nA,\nB,""', schema: noteSchema,
});
assert.deepEqual(emptyCells.data.map(row => ({ ...row })),
  [{ note: '' }, { note: '' }]);

assert.throws(() => transform({
  format: 'json', data: [{}],
  schema: [{ ...noteSchema[0], required: true }],
}), error => error.details.fields[0].code === 'MISSING_FIELD');
assert.throws(() => transform({
  format: 'json', data: [{ active: 'true' }, { active: 'yes' }],
  schema: [{ source: 'active', target: 'active', type: 'boolean' }],
}), error => error.status === 422
  && error.details.totalErrors === 1
  && error.details.fields[0].row === 1);
console.log('Missing, null and empty values preserved; mixed batch rejected.');
```

`required: false` permits absence; `nullable: true` permits an explicit null. Neither option makes an empty string disappear. Notice that allowing null does not excuse a missing required field. Downstream update semantics still belong to the consuming application: this transformer preserves distinctions but does not decide whether a database value should be cleared.

The final assertion also checks the batch boundary. One valid flag followed by one invalid flag causes the function to throw; it returns no partial result. Its HTTP wrapper represents that conversion failure as a 422 response. That is validation of one batch, not a transaction guarantee for a separate database or API.

Use the error's row index to identify a parsed record, not a physical line in the CSV file. The index is zero-based, and a quoted cell can contain several line endings. Adding two to that index is therefore not a reliable way to locate the original text. If your import UI needs line-level highlighting, retain source positions during parsing or show the parsed record in a review table. This implementation does not return source offsets.

All three examples were executed locally against the project implementation. They demonstrate specific parsing and conversion behavior; they are not a claim of compatibility with every CSV dialect. This parser supports comma-separated input and LF/CRLF record endings, not delimiter detection. It also caps records and cell lengths, so it is unsuitable for loading an arbitrarily large export unchanged.

When adding a new source system, decide its identifier, boolean, and empty-value rules before mapping its columns. Then keep a small fixture that would fail if any of those meanings changed. A useful import test checks the values the application will actually receive, including the values it must refuse.

Tested source revision: [18d0eac794d0075df3f763bd2a442370e03f02fd](https://github.com/wiaikit/fenix-schemabridge/tree/18d0eac794d0075df3f763bd2a442370e03f02fd). The executable examples were run with Node.js 24.16.0. These articles are independent portfolio samples, not previously commissioned client work.
