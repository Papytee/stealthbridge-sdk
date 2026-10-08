# StealthBridge integration compatibility — v0.2

| Component | Interface | Status |
| --- | --- | --- |
| Backend | `/health`, `/v1/network`, `/v1/capabilities`, `/v1/corridors` | Rust implementation committed, deployment pending |
| Source network | Stellar Testnet RPC `getNetwork` + `getLatestLedger` | Live upstream API required |
| Corridors | Operator-configured PostgreSQL `corridors` | Empty until real configuration |
| SDK | Typed read-only `StealthBridgeClient` | Code committed |
| Frontend | Same-origin Next.js API proxy | Code committed, requires backend URL |
| Contracts | CorridorRegistry WASM | No deployment or confidential transfer |
| SPP | Alpha SDK | Not integrated or verified |
| Confidential Tokens | Developer preview | Not integrated or verified |

## Invariants
- Backend must fail closed if a configured RPC reports another network.
- Do not fabricate corridor records, asset identities, exchange rates, partner integrations, or transaction success.
- Testnet RPC is not a confidential payment protocol. Never claim a value transfer until an actual audited/verified solution supports it.
- SDK has no server-side signing or wallet secret handling.
- When backend schema changes, update types and consumer compatibility tests atomically.

## v0.3 transaction observation compatibility

The backend OpenAPI v0.3 defines `GET /v1/transactions/{hash}` for a user-supplied 64-character hex hash. The TypeScript client now exposes `transaction(hash)` returning `TransactionObservation` with status SUCCESS/FAILED, ledger and RPC source; 404 means not present in the node's retained history, **not** proof the transaction never existed. We intentionally omit raw envelope/result XDR, events and confidential payment data. Tests run offline with synthetic mocked fetch responses only.

The backend also includes a tenant-scoped internal intent journal (`src/store.rs`) but **there is no public authenticated mutation endpoint or SDK write method**. Preserve this boundary until wallet auth, proof verification, FX and payout reconciliation are independently implemented.
