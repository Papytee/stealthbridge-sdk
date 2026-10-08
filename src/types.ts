/** Public, non-sensitive API models. Confidential notes and witness data are intentionally excluded. */
export type Network = "testnet";
export type PrivacyRail = "confidential-token" | "private-payments";
export type SettlementState =
  | "draft" | "quoted" | "authorized" | "submitted"
  | "chain_finalized" | "payout_pending" | "payout_completed"
  | "expired" | "rejected" | "chain_failed" | "payout_failed"
  | "refund_pending" | "refunded" | "manual_review";
export interface Capabilities {
  payments_enabled: boolean;
  privacy_integration_verified: boolean;
  fiat_payouts_enabled: boolean;
}
export interface Corridor {
  id: string;
  from: string;
  to: string;
  settlement_asset: string;
  simulation: boolean;
}
export interface SettlementSummary {
  id: string;
  corridor_id: string;
  state: SettlementState;
  privacy_rail: PrivacyRail;
  chain_transaction_hash?: string;
  payout_reference?: string;
}
/** Do not represent unverified simulation quotes as executable commercial offers. */
export interface DemoQuote { corridor_id: string; send_amount_decimal: string; simulation: true; }
