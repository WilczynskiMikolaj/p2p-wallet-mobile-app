import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { Buffer } from 'node:buffer';

const source = (await readFile(new URL('../src/hooks/useAsyncResource.js', import.meta.url), 'utf8'))
  .replace("from 'react'", `from '${import.meta.resolve('react')}'`)
  .replace("from '../utils/errors'", `from '${new URL('../src/utils/errors.js', import.meta.url)}'`);

const { useAsyncResource } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function harness(key = 'A', keepData = false, strict = false) {
  const calls = [];
  let current;
  const load = (id) => { const task = deferred(); calls.push({ id, ...task }); return task.promise; };
  function Probe({ id }) { current = useAsyncResource(id, load, keepData); return null; }
  const element = (id) => strict ? React.createElement(React.StrictMode, null, React.createElement(Probe, { id })) : React.createElement(Probe, { id });
  let root;
  await act(async () => { root = create(element(key)); });
  return {
    calls,
    get value() { return current; },
    update: async (id) => { await act(async () => { root.update(element(id)); }); },
    finish: async (index, data) => { await act(async () => { calls[index].resolve(data); }); },
    fail: async (index) => { await act(async () => { calls[index].reject(new Error('network')); }); },
    unmount: async () => { await act(async () => { root.unmount(); }); },
  };
}

test('initial loading, success, refresh and awaitable completion', async () => {
  const h = await harness();
  assert.equal(h.value.loading, true);
  await h.finish(0, ['first']);
  assert.deepEqual(h.value.data, ['first']);
  let pending;
  await act(async () => { pending = h.value.reload(); });
  assert.equal(h.value.loading, true);
  assert.equal(h.value.data, null);
  await h.finish(1, ['second']);
  await pending;
  assert.deepEqual(h.value.data, ['second']);
  assert.equal(h.value.loading, false);
  await h.unmount();
});

test('key change hides old data and ignores late success and failure', async () => {
  const h = await harness();
  await h.finish(0, ['A']);
  await act(async () => { void h.value.reload(); });
  await h.update('B');
  assert.equal(h.value.data, null);
  assert.equal(h.value.loading, true);
  await h.finish(2, ['B']);
  await h.fail(1);
  assert.deepEqual(h.value.data, ['B']);
  assert.equal(h.value.error, '');
  await h.update('A');
  assert.equal(h.value.data, null);
  assert.equal(h.value.loading, true);
  await h.finish(3, ['new A']);
  assert.deepEqual(h.value.data, ['new A']);
  await h.unmount();
});

test('latest overlapping reload wins', async () => {
  const h = await harness();
  await act(async () => { void h.value.reload(); void h.value.reload(); });
  await h.finish(2, ['newest']);
  await h.finish(1, ['older']);
  await h.finish(0, ['initial']);
  assert.deepEqual(h.value.data, ['newest']);
  await h.unmount();
});

test('errors stop loading; retry clears error and succeeds', async () => {
  const h = await harness();
  await h.fail(0);
  assert.equal(h.value.loading, false);
  assert.ok(h.value.error);
  await act(async () => { void h.value.reload(); });
  assert.equal(h.value.error, '');
  assert.equal(h.value.loading, true);
  await h.finish(1, []);
  assert.deepEqual(h.value.data, []);
  await h.unmount();
});

test('disabled key makes no request; logout hides data and ignores pending response', async () => {
  const h = await harness(null, true);
  assert.equal(h.calls.length, 0);
  assert.equal(h.value.loading, false);
  await h.update('A');
  await h.finish(0, { role: 'admin' });
  await act(async () => { void h.value.reload(); });
  assert.deepEqual(h.value.data, { role: 'admin' });
  await h.update(null);
  assert.equal(h.value.data, null);
  await h.finish(1, { role: 'admin' });
  assert.equal(h.value.data, null);
  assert.equal(h.value.loading, false);
  await h.unmount();
});

test('Strict Mode cleanup invalidates first request; unmount invalidates refresh', async () => {
  const h = await harness('A', false, true);
  assert.equal(h.calls.length, 2);
  await h.finish(1, ['current']);
  await h.finish(0, ['discarded']);
  assert.deepEqual(h.value.data, ['current']);
  await act(async () => { void h.value.reload(); });
  await h.unmount();
  await h.finish(2, ['after unmount']);
  assert.equal(h.value.loading, true);
});
