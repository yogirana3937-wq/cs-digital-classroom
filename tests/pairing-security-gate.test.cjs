'use strict';
// Security acceptance tests: intentionally NOT in CI until pairing is wired.
// Run with: node tests/pairing-security-gate.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const teacher = fs.readFileSync(path.join(__dirname, '..', 'teacher.html'), 'utf8');
const board = fs.readFileSync(path.join(__dirname, '..', 'board.html'), 'utf8');
const failures = [];
function requirement(name, condition) { if (!condition) failures.push(name); }
requirement('Teacher must not send state to an unverified connection', /authenticated|pairingVerified/.test(teacher) && /if\s*\([^)]*(?:authenticated|pairingVerified)/.test(teacher));
requirement('Board must reject unverified state', /authenticated|pairingVerified/.test(board) && /if\s*\([^)]*(?:authenticated|pairingVerified)/.test(board));
requirement('Teacher must offer explicit approval', /approvePairing|approveBoard|pairingApprove/.test(teacher));
requirement('Both pages must load secure pairing module', teacher.includes('secure-pairing.js') && board.includes('secure-pairing.js'));
if (failures.length) {
 console.error('NOT SECURELY PAIRED: acceptance gates remain unmet:');
 for (const item of failures) console.error(' - ' + item);
 process.exitCode = 1;
} else {
 console.log('Source-level pairing gates present; manual and cryptographic behavioral review STILL REQUIRED.');
}
