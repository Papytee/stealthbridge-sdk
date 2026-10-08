import { ApiError } from "@stealthbridge/sdk";

export function isStealthBridgeApiError(value) {
  return value instanceof ApiError;
}
