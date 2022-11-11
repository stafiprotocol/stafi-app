declare const window: any;

export function isDev() {
  return process.env.NEXT_PUBLIC_ENV !== "production";
}

export function getStafiRpc() {
  if (isDev()) {
    return "wss://stafi-seiya-rewrite.stafi.io";
  }
  return "wss://mainnet-rpc.stafi.io";
}

export function getValidatorSiteHost() {
  if (isDev()) {
    return "https://test-rtoken-app.stafi.io/";
  }
  return "https://reth-validator.stafi.io/";
}

export function getApiHost() {
  if (isDev()) {
    return "https://test-drop-api.stafi.io";
  }
  return "https://drop-api.stafi.io";
}

export function getDropHost() {
  return "https://drop.stafi.io";
}

export function getRTokenApi2Host() {
  if (isDev()) {
    return "https://test-rtoken-api2.stafi.io";
  } else {
    return "https://rtoken-api2.stafi.io";
  }
}
