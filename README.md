<div align="center"><img src="assets/stealthbridge-logo.svg" alt="StealthBridge — Confidential payments. Without borders." width="540" /></div>

# StealthBridge SDK

**Engineering roadmap:** [View the repository-specific plan](ROADMAP.md).

An initial **read-only TypeScript SDK** for live StealthBridge network and corridor metadata.

```ts
import { StealthBridgeClient } from "@stealthbridge/sdk";
const client = new StealthBridgeClient({ apiBaseUrl: "https://your-api.example", network: "testnet" });
const chain = await client.network();    // real observed Stellar ledger from backend
const corridors = await client.corridors(); // real PostgreSQL records or explicit 503
```

The public functions return network metadata, capability flags and actual configured corridors. A data-unavailable response is an error, **never replaced with demo values**. The API rejects non-HTTPS remote URLs.

## Security and status

No payment submission, signing, wallet custody, encrypted note management, ZK proof generation, mainnet, or fiat integration. This SDK is not a confidential transfer implementation.

See [compatibility matrix](specs/COMPATIBILITY.md), the [backend API](https://github.com/stealthbridge-labs/stealthbridge-backend/blob/main/api/openapi.yaml), [frontend](https://github.com/stealthbridge-labs/stealthbridge-frontend), and [contracts](https://github.com/stealthbridge-labs/stealthbridge-contracts).

```sh
npm install
npm run typecheck
npm run build
```
