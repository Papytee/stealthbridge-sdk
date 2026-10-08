import type { Capabilities, Corridor, Network } from "./types.js";

export interface ClientConfig {
  apiBaseUrl: string;
  network: Network;
  fetchImpl?: typeof fetch;
}

export class StealthBridgeClient {
  private readonly base: string;
  private readonly transport: typeof fetch;
  constructor(config: ClientConfig) {
    if (config.network !== "testnet") throw new Error("Only Stellar testnet is supported in this preview");
    const url = new URL(config.apiBaseUrl);
    if (!["https:","http:"].includes(url.protocol)) throw new Error("Unsupported API URL protocol");
    if (url.protocol !== "https:" && !["localhost","127.0.0.1"].includes(url.hostname))
      throw new Error("Non-local API connections must use HTTPS");
    this.base = url.toString().replace(/\/$/, "");
    this.transport = config.fetchImpl ?? fetch;
  }
  private async read<T>(path: string): Promise<T> {
    const response = await this.transport(this.base + path, {method:"GET",headers:{accept:"application/json"}});
    if (!response.ok) throw new Error("StealthBridge API returned HTTP " + response.status);
    return response.json() as Promise<T>;
  }
  health(): Promise<{service:string;status:string;network:Network}> {return this.read("/health");}
  capabilities(): Promise<Capabilities> {return this.read("/v1/capabilities");}
  corridors(): Promise<Corridor[]> {return this.read("/v1/corridors");}
  /** No write methods until authenticated wallet/proof integration is validated. */
}
