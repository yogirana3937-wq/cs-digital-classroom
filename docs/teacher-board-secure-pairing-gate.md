# Teacher–Board secure pairing: implementation gate (draft)

Status: DESIGN ONLY. Not a security control. Do not claim classroom pairing is authenticated until implementation and tests pass.

## Current verified weakness
- Teacher uses a six-digit room code to advertise a predictable PeerJS ID.
- Teacher accepts the first incoming connection and sends lesson state without authenticated Board identity.
- The existing active-connection guard prevents takeover while a Board is connected, but not first-connection impersonation or takeover after disconnect.
- The short teacherSession string is generated with Math.random and is not an authentication secret.
- Board accepts incoming lesson-state data before authenticating the Teacher.

## Security requirements
1. Room code is a locator only, never a credential. PeerJS signaling and room discovery must be treated as untrusted.
2. Teacher explicitly approves the intended Board. Approval is bound to an ephemeral, per-connection cryptographic identity, not just a display name.
3. Use browser Web Crypto secure randomness and authenticated challenge-response (prefer ECDH-derived key + HKDF + HMAC or authenticated encryption, with strict protocol transcript binding). Do not use Math.random for security secrets.
4. Both endpoints authenticate each other before sending/accepting any lesson state, activity, component, model, or acknowledgment messages.
5. Each handshake uses fresh nonces and protocol version, room identifier, both endpoint public keys and roles in the authenticated transcript. Reject stale, duplicate, cross-room, role-swapped or out-of-order messages.
6. Deny by default on absent crypto APIs, malformed payload, verification failure, timeout, disconnect, or Teacher rejection. No legacy insecure fallback.
7. Reconnection must require a fresh authenticated handshake; a previous approval cannot silently authorize an unrelated key or peer.
8. Teacher approval UI must show a short authentication comparison code derived from the handshake, to be compared with the Board display over a trusted physical channel. The approval button alone cannot protect against active signaling MITM.
9. Limit pending requests and payload sizes; do not reveal lesson state before authentication. Rate-limit repeated failed attempts where feasible.
10. Avoid storing long-term keys, room secrets, or sensitive transcripts in logs, URL parameters or localStorage. Keep interface and nine-section lesson structure unchanged.

## Required automated security scenarios
- Unknown peer with correct six-digit room code receives no lesson data.
- First connection cannot receive state until explicit Teacher approval and successful cryptographic authentication.
- Rejected or timed-out request cannot obtain lesson data.
- Incorrect confirmation code, tampered challenge, wrong HMAC, wrong room or role fails closed.
- Replayed challenge/response, duplicated approval and stale session state fail closed.
- Disconnect and reconnect with changed peer key requires new Teacher approval.
- Board ignores unauthenticated forged state/component/model/activity messages.
- Teacher ignores unauthenticated forged requests and acknowledgments.
- Concurrent pairing requests cannot displace an approved Board.
- No Web Crypto / insecure context refuses pairing instead of falling back.
- Verify behavior on actual browsers and Globus touchscreen, including offline/no-network messaging.

## Delivery gate
Implement as a small isolated module shared by Teacher and Board, then wire the message gates and UI. Add behavioral tests to CI before claiming secure pairing. Review crypto design for active MITM and phishing limitations; do not merge into dev/main until reviewed and real browser tests pass.
