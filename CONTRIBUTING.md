# Contributing to StealthBridge SDK

Please start with a scoped [issue](https://github.com/stealthbridge-labs/stealthbridge-sdk/issues) and submit a focused PR. The SDK is read-only; no wallet key handling, signing, confidential note transport or real fund movement is allowed without maintainer-reviewed threat model and protocol verification.

Run `npm run typecheck` and `npm run build`, align types to the backend OpenAPI schema, and include tests for network mismatch and error responses. No hardcoded contract IDs, currency rates, corridors or private witness values in runtime. Licensing decisions are still pending before Drips and open-source releases.
