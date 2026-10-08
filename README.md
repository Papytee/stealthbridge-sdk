# StealthBridge SDK

**Status: interface specifications only; no production SDK published.**

This repository will expose versioned client bindings for StealthBridge's public API, contract interfaces, deployment metadata and protocol-specific adapters.

## Packages
- `packages/typescript`: consumer/business TypeScript client (future)
- `packages/rust`: Rust integration library (future)
- `specs`: cross-repository interface and compatibility documents

## Compatibility
Every release must pin a backend API version, contracts ABI version and Stellar network passphrase. The SDK must not create, store, or transmit wallet secrets through a server API. Distinguish confidential-amount payments and relationship-private pool transfers; they are not equivalent protocols.

See https://github.com/stealthbridge-labs/stealthbridge-frontend and https://github.com/stealthbridge-labs/stealthbridge-backend.
