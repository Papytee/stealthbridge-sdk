import type { Capabilities, Corridor, Network, NetworkStatus, TransactionObservation } from "./types.js";
export interface ClientConfig {
  apiBaseUrl: string;
  network: Network;
  fetchImpl?: typeof fetch;
}
export class ApiError extends Error {
  constructor(public readonly status: number, public readonly path: string) {
    super(`StealthBridge API returned HTTP ${status} for ${path}`);
    this.name = "ApiError";
  }
}
export class StealthBridgeClient {
  private readonly base: string;
  private readonly transport: typeof fetch;
  constructor(config: ClientConfig) {
    if (config.network !== "testnet") throw new Error("Only Stellar testnet is supported");
    const url = new URL(config.apiBaseUrl);
    if (!["https:", "http:"].includes(url.protocol)) throw new Error("Unsupported API URL protocol");
    if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) {
      throw new Error("Non-local API connections must use HTTPS");
    }
    this.base = url.toString().replace(/\/$/, "");
    this.transport = config.fetchImpl ?? fetch;
  }
  private async read<T>(path: string): Promise<T> {
    const response = await this.transport(this.base + path, {
      method: "GET", headers: {accept: "application/json"}, cache:"no-store",
    });
    if (!response.ok) throw new ApiError(response.status, path);
    return await response.json() as T;
  }
  health(): Promise<{service:string;status:string}> {return this.read("/health");}
  network(): Promise<NetworkStatus> {return this.read("/v1/network");}
  capabilities(): Promise<Capabilities> {return this.read("/v1/capabilities");}
  corridors(): Promise<Corridor[]> {return this.read("/v1/corridors");}
  /**
   * Inspect public ledger inclusion by an exact 64-character hex hash.
   * NOT_FOUND is an API 404, including for transactions outside RPC retention.
   * Never returns raw XDR, sender/receiver or confidential witnesses.
   */
  transaction(hash: string): Promise<TransactionObservation> {
    if (!/^[a-f0-9]{64}$/i.test(hash)) throw new TypeError("Transaction hash must be exactly 64 hexadecimal characters");
    return this.read("/v1/transactions/" + hash.toLowerCase());
  }
  /** No signing, quote, payment, or other mutation methods until independently verified. */
}
