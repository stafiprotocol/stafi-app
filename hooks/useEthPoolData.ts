import { getApiHost } from "config/env";
import { RequestStatus } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import { useAppSlice } from "./selector";

export function useEthPoolData() {
  const { updateFlag15s } = useAppSlice();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [depositedEth, setDepositedEth] = useState("");
  const [depositedEthValue, setDepositedEthValue] = useState("");
  const [mintedREth, setMintedREth] = useState("");
  const [mintedREthValue, setMintedREthValue] = useState("");
  const [stakedEth, setStakedEth] = useState("");
  const [stakedEthValue, setStakedEthValue] = useState("");
  const [allEth, setAllEth] = useState("");
  const [allEthValue, setAllEthValue] = useState("");
  const [poolEth, setPoolEth] = useState("");
  const [unmatchedEth, setUnmatchedEth] = useState("");
  const [matchedValidators, setMatchedValidators] = useState("");
  const [stakeApr, setStakeApr] = useState(undefined);
  const [validatorApr, setValidatorApr] = useState("");

  const udpatePoolData = useCallback(async () => {
    if (!updateFlag15s) {
      return;
    }
    try {
      const response = await fetch(`${getApiHost()}/reth/v1/poolData`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        setRequestStatus(RequestStatus.success);
        const depositedEth = Web3.utils.fromWei(resJson.data.depositedEth);
        const mintedREth = Web3.utils.fromWei(resJson.data.mintedREth);
        const stakedEth = Web3.utils.fromWei(resJson.data.stakedEth);
        const allEth = Web3.utils.fromWei(resJson.data.allEth);

        setDepositedEth(depositedEth);
        setDepositedEthValue(
          Number(depositedEth) * Number(resJson.data.ethPrice) + ""
        );
        setMintedREth(mintedREth);
        setMintedREthValue(
          Number(mintedREth) * Number(resJson.data.ethPrice) + ""
        );
        setStakedEth(stakedEth);
        setStakedEthValue(
          Number(stakedEth) * Number(resJson.data.ethPrice) + ""
        );
        setAllEth(allEth);
        setAllEthValue(Number(allEth) * Number(resJson.data.ethPrice) + "");

        setPoolEth(Web3.utils.fromWei(resJson.data.poolEth));
        setUnmatchedEth(Web3.utils.fromWei(resJson.data.unmatchedEth));
        setMatchedValidators(resJson.data.matchedValidators);

        setStakeApr(resJson.data.stakeApr);
        setValidatorApr(resJson.data.validatorApr);
      } else {
        throw new Error(resJson.message);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [updateFlag15s]);

  useEffect(() => {
    udpatePoolData();
  }, [udpatePoolData]);

  return {
    requestStatus,
    depositedEth,
    depositedEthValue,
    mintedREth,
    mintedREthValue,
    stakedEth,
    stakedEthValue,
    allEth,
    allEthValue,
    poolEth,
    unmatchedEth,
    matchedValidators,
    stakeApr,
    validatorApr,
  };
}
