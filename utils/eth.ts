export const getEthPubkeyStatusText = (status: string) => {
  if (status === "2") {
    return "Deposited";
  }
  if (status === "3") {
    return "Staked";
  }
  if (status === "4") {
    return "Failed";
  }
  if (status === "8") {
    return "Waiting";
  }
  if (status === "9") {
    return "Active";
  }
  if (status === "10") {
    return "Exit";
  }
  return "Unmatched";
};
