<div align="center"><img src="assets/stealthbridge-logo.svg" alt="StealthBridge — Confidential payments. Without borders." width="760" /></div>

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

## Runtime and package compatibility

The only public package entry point is `@stealthbridge/sdk`. It is native ESM and exports the runtime values `StealthBridgeClient` and `ApiError`, plus the TypeScript types `ClientConfig`, `Network`, `PrivacyRail`, `SettlementState`, `Capabilities`, `NetworkStatus`, `Corridor`, `SettlementSummary`, and `TransactionObservation`. Internal `dist/*` paths are not public exports.

- Node.js: 22 or newer, ESM only. CommonJS `require()` is not supported.
- Browsers: ES2022 with built-in `fetch`, `Response`, and `URL`, using a bundler that understands package `exports`. CI verifies this with esbuild and a pinned Next.js 16.4 App Router production build.
- TypeScript: declarations are generated beside the ESM output and resolved through the `types` export condition.
- Network: Stellar Testnet only. Browser calls are still subject to the backend's CORS policy.

The package remains private and unpublished while licensing and release approval are pending. To inspect the exact local package consumers without publishing:

```sh
npm ci
npm run verify
```

`npm run verify` type-checks and builds the source, creates `artifacts/stealthbridge-sdk-0.2.0.tgz`, validates SHA-256 plus npm's SHA-1/SHA-512 integrity metadata and contents, then installs that tarball into isolated Node.js, TypeScript, esbuild, and Next.js fixtures. The Next.js fixture proves the installed `dist/index.js` entry resolves in both a Server Component and a `"use client"` Client Component. It does not need a backend, wallet, credentials, or deployment. The fixture's pinned dependencies require registry access on a cold cache.

The measured baseline is approximately 4.4 KB packed / 10.5 KB unpacked, with a 1,189 B full minified browser ESM bundle, a 233 B `ApiError`-only bundle, and 1,452 B across the Next.js client chunks containing SDK code. CI ceilings allow deliberate headroom: 12,000 B packed, 30,000 B unpacked, 3,000 B full browser, 1,000 B tree-shaken, and 25,000 B for SDK-bearing Next.js client chunks. The Next.js fixture adds about 12.4 seconds locally on a warm dependency cache (6.0 seconds install and 6.4 seconds build). A size change that exceeds a ceiling requires review and an explicit budget update with fresh measurements.

## Consumer errors

- The constructor throws `Error` for a network other than `"testnet"`, a non-HTTP(S) URL, or non-local plaintext HTTP.
- `transaction(hash)` throws `TypeError` before any request unless the hash is exactly 64 hexadecimal characters.
- A completed non-2xx response throws `ApiError`; inspect its numeric `status` and requested `path`. A transaction 404 can also mean the RPC node no longer retains that transaction.
- Native URL, fetch, CORS, DNS, and connection failures pass through unchanged. The client does not retry or replace unavailable data with examples.

## On-chain observation, without leaking contract events

```ts
const observed = await client.transaction(realTransactionHash); // exact 64-hex hash
console.log(observed.status, observed.ledger);
```

The result verifies **chain inclusion only**. It does not prove private-payment anonymity, bank payout or token redemption; older hashes may be unavailable from RPC retention. The SDK has offline tests for URL restrictions, malformed hashes, missing transactions and safe read-only behavior. See [the engineering roadmap](ROADMAP.md).
