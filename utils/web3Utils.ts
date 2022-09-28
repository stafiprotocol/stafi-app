import Web3 from "web3";

export function createWeb3() {
  var web3 = new Web3(Web3.givenProvider);
  return web3;
}
