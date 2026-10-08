# Contributing to StealthBridge SDK

Please start with a scoped [issue](https://github.com/stealthbridge-labs/stealthbridge-sdk/issues) and submit a focused PR. The SDK is read-only; no wallet key handling, signing, confidential note transport or real fund movement is allowed without maintainer-reviewed threat model and protocol verification.

Run `npm ci` and `npm run verify`, align types to the backend OpenAPI schema, and include tests for network mismatch and error responses. The verification command builds and packs locally, then exercises the packed artifact in isolated consumers; it never publishes. No hardcoded contract IDs, currency rates, corridors or private witness values belong in runtime code.

## Version and release workflow

1. Put user-visible changes in the `Unreleased` section of `CHANGELOG.md` and classify compatibility impact using SemVer.
2. Keep the root package export backward compatible within a major version. Update SDK types, docs, fixtures, and package-size baselines together when the public contract intentionally changes.
3. Run `npm ci` followed by `npm run verify`, and review the exact tarball contents and measured sizes in the test output.
4. A maintainer may set the release version, date the changelog, and create release provenance only after licensing and publication are explicitly approved.
5. Removing `"private": true`, authenticating to npm, publishing, tagging, pushing, or deploying are separate release actions and are not authorized by ordinary SDK changes.

Production readiness must not be inferred from passing package compatibility checks. Licensing decisions are still pending before open development and open-source releases.
