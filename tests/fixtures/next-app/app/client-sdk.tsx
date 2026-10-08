"use client";

import { useState } from "react";
import { ApiError, StealthBridgeClient } from "@stealthbridge/sdk";

export function ClientSdkCheck() {
  const [result] = useState(
    () => `client-import-ok:${ApiError.name}:${StealthBridgeClient.name}`
  );

  return <p data-sdk-client>{result}</p>;
}
