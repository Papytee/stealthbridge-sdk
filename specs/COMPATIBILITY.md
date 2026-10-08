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
