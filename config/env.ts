declare const window: any;

export function isDev() {
  return process.env.environment !== "production";
}

export function getApiHost() {
  if (isDev()) {
    return "https://test-drop-api.stafi.io";
  }
  return "https://drop-api.stafi.io";
}

export function getrTokenApiHost() {
  if (isDev()) {
    return "https://rtoken-api.stafi.io";
  }
  return "https://rtoken-api.stafi.io";
}
