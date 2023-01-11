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

export function getKsmRpc() {
  if (isDev()) {
    return "wss://kusama-test-rpc.stafi.io";
  } else {
    return "wss://kusama-rpc.polkadot.io";
  }
}

export function getPolkadotRpc() {
  if (isDev()) {
    return "wss://polkadot-test-rpc.stafi.io";
  } else {
    return "wss://rpc.polkadot.io";
  }
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

export function getSolanaRestRpc() {
  if (isDev()) {
    return "https://solana-dev-rpc.stafi.io";
  } else {
    return "https://mainnet-rpc.wetez.io/solana/v1/c06bde6963933337ce7cf260c8aa16a5";
  }
}

export function getSolanaWsRpc() {
  if (isDev()) {
    return "wss://solana-dev-wss.stafi.io";
  } else {
    return "wss://mainnet-rpc.wetez.io/ws/solana/v1/c06bde6963933337ce7cf260c8aa16a5";
  }
}
