/* Secure pairing primitives v1. Not connected to Teacher/Board yet. */
(function(root){
'use strict';
const encoder=new TextEncoder();
const VERSION='cs-pair-v1';
function api(){if(root.isSecureContext===false||!root.crypto||!root.crypto.subtle||!root.crypto.getRandomValues)throw new Error('Secure Web Crypto required');return root.crypto}
function bytes(x){return encoder.encode(x)}
function hex(b){return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function validRoom(room){if(typeof room!=='string'||!/^\\d{6}$/.test(room))throw new Error('Invalid room')}
function validRole(role){if(role!=='teacher'&&role!=='board')throw new Error('Invalid role')}
function validNonce(n){if(typeof n!=='string'||! /^[a-f0-9]{64}$/.test(n))throw new Error('Invalid nonce')}
function validPublicKey(k){if(!k||typeof k!=='object'||k.kty!=='EC'||k.crv!=='P-256'||typeof k.x!=='string'||typeof k.y!=='string'||k.x.length!==43||k.y.length!==43)throw new Error('Invalid key')}
async function identity(role){validRole(role);const c=api();const keys=await c.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);const nonce=hex(c.getRandomValues(new Uint8Array(32)));return {role,nonce,publicKey:await c.subtle.exportKey('jwk',keys.publicKey),privateKey:keys.privateKey}}
function transcript(room,teacher,board){validRoom(room);if(teacher.role!=='teacher'||board.role!=='board')throw new Error('Role mismatch');for(const p of [teacher,board]){validNonce(p.nonce);validPublicKey(p.publicKey)}if(teacher.nonce===board.nonce)throw new Error('Nonce reuse');return JSON.stringify([VERSION,room,'teacher',teacher.nonce,teacher.publicKey.x,teacher.publicKey.y,'board',board.nonce,board.publicKey.x,board.publicKey.y])}
async function session(room,own,remote){const c=api();if(!own||!own.privateKey||!remote||own.role===remote.role)throw new Error('Invalid participants');const teacher=own.role==='teacher'?own:remote,board=own.role==='board'?own:remote;const context=transcript(room,teacher,board);const pub=await c.subtle.importKey('jwk',remote.publicKey,{name:'ECDH',namedCurve:'P-256'},false,[]);const secret=await c.subtle.deriveBits({name:'ECDH',public:pub},own.privateKey,256);const ikm=await c.subtle.importKey('raw',secret,'HKDF',false,['deriveKey']);const digest=await c.subtle.digest('SHA-256',bytes(context));const key=await c.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:digest,info:bytes('cs-board-auth-v1')},ikm,{name:'HMAC',hash:'SHA-256',length:256},false,['sign','verify']);return {key,context}}
async function proof(session,role){validRole(role);return hex(await api().subtle.sign('HMAC',session.key,bytes('proof:'+role+':'+session.context)))}
async function verify(session,role,signature){validRole(role);if(typeof signature!=='string'||! /^[a-f0-9]{64}$/.test(signature))return false;const b=Uint8Array.from(signature.match(/../g),x=>parseInt(x,16));return api().subtle.verify('HMAC',session.key,b,bytes('proof:'+role+':'+session.context))}
async function comparisonCode(session){const raw=await api().subtle.sign('HMAC',session.key,bytes('display-code:'+session.context));const n=new DataView(raw).getUint32(0,false)%1000000;return String(n).padStart(6,'0')}
const exported=Object.freeze({identity,session,proof,verify,comparisonCode});if(typeof module!=='undefined'&&module.exports)module.exports=exported;else root.ClassroomPairing=exported;
})(globalThis);
