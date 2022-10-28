import { EthPubkeyStatus } from "interfaces/common";

export const getEthPubkeyStatusText = (status: string | number) => {
  if (Number(status) === EthPubkeyStatus.deposited) {
    return "Deposited";
  }
  if (Number(status) === EthPubkeyStatus.staked) {
    return "Staked";
  }
  if (Number(status) === EthPubkeyStatus.unmatch) {
    return "Failed";
  }
  if (Number(status) === EthPubkeyStatus.waiting) {
    return "Waiting";
  }
  if (Number(status) === EthPubkeyStatus.active) {
    return "Active";
  }
  if (Number(status) === EthPubkeyStatus.exited) {
    return "Exit";
  }
  return "Unmatched";
};
