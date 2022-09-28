export function isDev() {
  return true;
}

export function getApiHost() {
  if (isDev()) {
    return "https://test-drop-api.stafi.io";
  }
  return "https://test-drop-api.stafi.io";
}

export function getrTokenApiHost() {
  if (isDev()) {
    return "https://rtoken-api.stafi.io";
  }
  return "https://rtoken-api.stafi.io";
}
