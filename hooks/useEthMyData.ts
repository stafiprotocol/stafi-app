import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { RequestStatus } from "interfaces/common";
import { useCallback, useState } from "react";
import { useEffect } from "react";
import Web3 from "web3";
import { useAppSlice } from "./selector";

export function useEthMyData() {
  const { useAccount } = hooks;
  const account = useAccount();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );

  const [totalCount, setTotalCount] = useState(0);
  const [slashCount, setSlashCount] = useState(undefined);
  const [selfDepositedEth, setSelfDepositedEth] = useState("");
  const [selfDepositedEthValue, setSelfDepositedEthValue] = useState("");
  const [totalManagedEth, setTotalManagedEth] = useState("");
  const [totalManagedEthValue, setTotalManagedEthValue] = useState("");
  const [selfRewardEth, setSelfRewardEth] = useState("");
  const [selfRewardEthValue, setSelfRewardEthValue] = useState("");

  const { updateFlag15s } = useAppSlice();

  const updateMyData = useCallback(async () => {
    if (!account || !updateFlag15s) {
      return;
    }
    try {
      const params = {
        // nodeAddress: "0x9EA0fe988BC7A57DEabD3EfaE79DEC6Af10E5210",
        nodeAddress: account,
        status: 0,
        pageIndex: 0,
        pageCount: 1,
      };
      const response = await fetch(`${getApiHost()}/reth/v1/nodeInfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        setRequestStatus(RequestStatus.success);

        const selfDepositedEth = Web3.utils.fromWei(
          resJson.data.selfDepositedEth
        );
        const selfRewardEth = Web3.utils.fromWei(resJson.data.selfRewardEth);
        const totalManagedEth = Web3.utils.fromWei(
          resJson.data.totalManagedEth
        );

        setTotalCount(resJson.data.totalCount);
        setSlashCount(resJson.data.slashCount);
        setSelfDepositedEth(selfDepositedEth);
        setSelfDepositedEthValue(
          Number(selfDepositedEth) * Number(resJson.data.ethPrice) + ""
        );
        setSelfRewardEth(selfRewardEth);
        setSelfRewardEthValue(
          Number(selfRewardEth) * Number(resJson.data.ethPrice) + ""
        );
        setTotalManagedEth(totalManagedEth);
        setTotalManagedEthValue(
          Number(totalManagedEth) * Number(resJson.data.ethPrice) + ""
        );
      } else {
        throw Error(resJson.message);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [account, updateFlag15s]);

  useEffect(() => {
    updateMyData();
  }, [updateMyData]);

  return {
    requestStatus,
    totalCount,
    slashCount,
    selfDepositedEth,
    selfDepositedEthValue,
    selfRewardEth,
    selfRewardEthValue,
    totalManagedEth,
    totalManagedEthValue,
  };
}
