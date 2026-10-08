# Integration contract and compatibility v0.1

| Interface | Source of truth | Current |
| --- | --- | --- |
| Backend HTTP | stealthbridge-backend/api/openapi.yaml | v0.1.0 draft, read-only |
| Stellar Soroban contract interface | stealthbridge-contracts/Cargo.toml and emitted contract spec | one registry prototype; no deploy |
| Client models | sdk/src/types.ts | draft with no confidential witness fields |
| Testnet deployment metadata | stealthbridge-contracts/deployments/testnet/manifest.json | empty / unverified |
| Frontend consumers | stealthbridge-frontend | marketing and demo views, not yet wired |

## Version policy
Maintain compatibility matrix for every deploy. Generate SDKs from OpenAPI and contract ABI in a future milestone, after contracts/endpoint semantics stabilize; currently types are hand-written draft examples. Never fabricate a contract ID in client source.

## Credential and privacy policy
- Browser wallets sign transactions; never request wallet seeds or private keys via StealthBridge API.
- Client does not log raw payment witnesses, decrypted notes or user KYC.
- Do not return confidential amount data in chain explorer links.
- No backend/admin transaction signing enabled in this SDK.
- Only \`testnet\` network exposed until formal audit and approved mainnet decision.
