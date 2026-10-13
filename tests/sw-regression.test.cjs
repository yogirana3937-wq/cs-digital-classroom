'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

async function simulate({failAsset, offline = false, cached = false} = {}) {
  const listeners = {}, deleted = [], added = [];
  let skipWaiting = 0;
  const cache = {
    add: async asset => { added.push(asset); if (asset === failAsset) throw new Error('download failed'); },
    put: async () => {}
  };
  const caches = {
    open: async () => cache,
    keys: async () => ['other-app-v1', 'cs-classroom-v30', 'cs-classroom-v31'],
    delete: async key => { deleted.push(key); return true; },
    match: async () => cached ? {status: 200, fromCache: true} : undefined
  };
  const self = {
    location: {origin: 'https://example.test'},
    addEventListener: (name, listener) => { listeners[name] = listener; },
    skipWaiting: async () => { skipWaiting++; },
    clients: {claim: async () => {}}
  };
  const fetch = async () => { if (offline) throw new Error('offline'); return {ok: true, status: 200, clone() { return this; }}; };
  const Response = {error: () => ({type: 'error'})};
  vm.runInNewContext(source, {self, caches, fetch, Response, URL, console});
  async function dispatch(type, request) {
    let promise;
    const event = {request, waitUntil(p) { promise = p; }, respondWith(p) { promise = p; }};
    listeners[type](event);
    return promise;
  }
  return {dispatch, deleted, added, counts: () => ({skipWaiting})};
}

(async () => {
  const good = await simulate({offline: true, cached: true});
  await good.dispatch('install');
  assert.equal(good.counts().skipWaiting, 1, 'successful install activates');
  assert.equal(good.added.length, 39, 'all expected assets precached');
  await good.dispatch('activate');
  assert.deepEqual(good.deleted, ['cs-classroom-v30'], 'delete only old classroom caches');
  const cachedResponse = await good.dispatch('fetch', {method: 'GET', url: 'https://example.test/board.html'});
  assert.equal(cachedResponse.fromCache, true, 'offline fetch uses cached lesson');

  const bad = await simulate({failAsset: './board.html'});
  await assert.rejects(bad.dispatch('install'), /download failed/, 'essential precache failure rejects installation');
  assert.equal(bad.counts().skipWaiting, 0, 'failed install never skips waiting');

  const miss = await simulate({offline: true});
  const fallback = await miss.dispatch('fetch', {method: 'GET', url: 'https://example.test/board.html'});
  assert.equal(fallback.type, 'error', 'offline cache miss yields a response');
  console.log('PASS: service-worker isolated regression tests');
})().catch(err => {console.error(err); process.exitCode = 1;});
