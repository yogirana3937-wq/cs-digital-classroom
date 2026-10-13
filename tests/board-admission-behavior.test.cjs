'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'teacher.html'), 'utf8');
const start = source.indexOf("peer.on('connection',c=>");
const end = source.indexOf(");peer.on('disconnected'", start);
assert.ok(start >= 0 && end > start, 'Teacher connection handler must exist');
const expression = source.slice(start, end + 2);
function setup(existing) {
  const events = {};
  const peer = {on: (name, fn) => {events[name] = fn;}};
  const state = {textContent: ''};
  const context = {peer, conn: existing, state, teacherSession: 'ABCDEF', send: () => {}, i: 0, stateVersion: 1};
  vm.runInNewContext(expression, context);
  function candidate() {
    const handlers = {};
    return {open: true, closed: 0, on(name, fn) {handlers[name] = fn;}, close() {this.closed++;}, handlers};
  }
  return {events, context, candidate};
}
const active = {open: true, closed: 0, close() {this.closed++;}};
const protectedRoom = setup(active);
const intruder = protectedRoom.candidate();
protectedRoom.events.connection(intruder);
assert.equal(active.closed, 0, 'active Board must remain connected');
assert.equal(protectedRoom.context.conn, active, 'active Board must retain ownership');
assert.ok(intruder.closed >= 1, 'incoming connection must be closed');
const emptyRoom = setup(null);
const first = emptyRoom.candidate();
emptyRoom.events.connection(first);
assert.equal(emptyRoom.context.conn, first, 'empty classroom can accept a connection');
console.log('PASS: Teacher Board admission behavioral regression');
