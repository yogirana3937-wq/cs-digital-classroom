'use strict';
// Source-level regression: guards against accidental removal of practical approval gates.
// This is NOT a browser, PeerJS, or adversarial security test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const teacher=fs.readFileSync(path.join(__dirname,'..','teacher.html'),'utf8');
const board=fs.readFileSync(path.join(__dirname,'..','board.html'),'utf8');
function has(text,pattern,label){assert.match(text,pattern,label)}
has(teacher,/let approvedBoard=null;/,'Teacher approval starts unset');
has(teacher,/conn=null;approvedBoard=null;roomCode=code/,'Starting a new room clears approval');
has(teacher,/function send\(changed=true\)\{[^}]*if\(conn&&conn\.open&&approvedBoard===conn\)/,'Teacher send is gated by approved connection');
has(teacher,/if\(approvedBoard!==c\)\{if\(d\.type!=='request'\|\|asked\)return/,'Teacher refuses non-request messages before approval');
has(teacher,/window\.confirm\('A Board wants to connect/,'Teacher must explicitly approve');
has(teacher,/if\(!allow\)\{[^}]*c\.close\(\)/,'Teacher rejection closes connection');
has(teacher,/approvedBoard=c;clearTimeout\(approvalTimer\);c\.send\(\{type:'approved',room:roomCode\}\)/,'Teacher sends approval only after Allow');
has(teacher,/setTimeout\(\(\)=>\{if\(conn===c&&approvedBoard!==c\)/,'Teacher approval times out');
has(teacher,/c\.on\('close',\(\)=>\{clearTimeout\(approvalTimer\);if\(conn===c\)\{approvedBoard=null;conn=null/,'Teacher revokes approval on disconnect');
has(board,/let approved=false;candidate\.send\(\{type:'request'\}\)/,'Board begins unapproved');
has(board,/if\(!approved\)\{if\(d\.type==='approved'&&d\.room===code\)\{approved=true/,'Board only accepts matching-room approval before lesson data');
has(board,/if\(!approved&&now-opened>=30000\)/,'Board timeout while waiting for approval');
has(board,/if\(attempt!==attemptNumber\|\|code!==activeCode\|\|conn!==candidate/,'Board ignores stale connection messages');
console.log('PASS: practical approval source regression; browser and threat-model tests remain required');
