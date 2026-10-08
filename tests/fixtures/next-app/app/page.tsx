import { ApiError, StealthBridgeClient } from "@stealthbridge/sdk";
import { ClientSdkCheck } from "./client-sdk";

export default function Home() {
  const client = new StealthBridgeClient({
    apiBaseUrl: "https://api.example",
    network: "testnet"
  });
  const error = new ApiError(418, "/server-component-check");

  return (
    <main>
      <p data-sdk-server>
        {`server-import-ok:${client.constructor.name}:${error.status}`}
      </p>
      <ClientSdkCheck />
    </main>
  );
}
