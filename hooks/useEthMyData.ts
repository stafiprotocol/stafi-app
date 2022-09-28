import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { RequestStatus } from "interfaces";
import { useCallback, useState } from "react";
import { useEffect } from "react";
import Web3 from "web3";

export function useEthMyData() {
  const { useAccount } = hooks;
  const account = useAccount();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );

  const [pubkeyList, setPubkeyList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selfDepositedEth, setSelfDepositedEth] = useState("");
  const [selfDepositedEthValue, setSelfDepositedEthValue] = useState("");
  const [totalManagedEth, setTotalManagedEth] = useState("");
  const [totalManagedEthValue, setTotalManagedEthValue] = useState("");
  const [selfRewardEth, setSelfRewardEth] = useState("");
  const [selfRewardEthValue, setSelfRewardEthValue] = useState("");

  const updateMyData = useCallback(async () => {
    if (!account) {
      return;
    }
    try {
      const params = {
        nodeAddress: account,
        status: 0,
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
        setPubkeyList(resJson.data.pubkeyList);
        setTotalCount(resJson.data.totalCount);

        const selfDepositedEth = Web3.utils.fromWei(
          resJson.data.selfDepositedEth
        );
        const selfRewardEth = Web3.utils.fromWei(resJson.data.selfRewardEth);
        const totalManagedEth = Web3.utils.fromWei(
          resJson.data.totalManagedEth
        );

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
  }, [account]);

  useEffect(() => {
    updateMyData();
  }, [updateMyData]);

  return {
    requestStatus,
    pubkeyList,
    totalCount,
    selfDepositedEth,
    selfDepositedEthValue,
    selfRewardEth,
    selfRewardEthValue,
    totalManagedEth,
    totalManagedEthValue,
  };
}
