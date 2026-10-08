# StealthBridge SDK

The shared integration layer for **StealthBridge Business** and **StealthBridge Send**.

> **Status:** early read-only TypeScript testnet client. No fund transfers, ZK proof generation, wallet signing, or privileged relayer capability are implemented.

## Features present
- Strict testnet-only client construction.
- HTTPS required for non-local API connections.
- Read-only service health, capability flags and demonstration corridors.
- Initial types for privacy rails and the full settlement lifecycle.
- Compatibility matrix with backend OpenAPI and Soroban interfaces.

## Example
\`\`\`ts
import {StealthBridgeClient} from "@stealthbridge/sdk";
const client = new StealthBridgeClient({
  apiBaseUrl: "http://localhost:8080",
  network: "testnet",
});
const capabilities = await client.capabilities();
console.log(capabilities.payments_enabled); // false
\`\`\`

## Development
Node.js 22+ and TypeScript 7 preferred:
\`\`\`bash
npm install
npm run typecheck
npm run build
\`\`\`
Dependency installation and tests were not executed as part of the initial GitHub commit.

## Roadmap
- OpenAPI-generated clients when backend spec is finalized.
- Stellar contract binding generation from verified contract WASM and deployed manifest.
- Browser wallet adapters with account/network mismatch handling.
- Separate Confidential Tokens and SPP privacy interfaces with no false common assumptions.
- Stablecoin issuer-control metadata only if requirements justify it.

## Repositories
[Contracts](https://github.com/stealthbridge-labs/stealthbridge-contracts) · [Backend](https://github.com/stealthbridge-labs/stealthbridge-backend) · [Frontend](https://github.com/stealthbridge-labs/stealthbridge-frontend)

## Security
Never handle mnemonic/seed keys in application logs or remote service requests. The client is read-only until the team verifies real Stellar SDK compatibility and proof boundaries.
