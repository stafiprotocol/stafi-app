import { getRTokenApi2Host } from "config/env";
import {
  ChainId,
  RequestStatus,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTokenStandard } from "./useTokenStandard";
import { useWalletAccount } from "./useWalletAccount";
import { Symbol } from "keyring/defaults";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { useAppSlice } from "./selector";
import { getTokenSymbol } from "utils/rToken";
import { DOT_SS58_FORMAT, KSM_SS58_FORMAT, PAGE_SIZE } from "utils/constants";
import numberUtil from "utils/numberUtil";
import keyring from "servers/keyring";
import { getRTokenUnbondRecords } from "utils/storage";
import dayjs from "dayjs";
import { estimateUnbondDays } from "config/unbond";
import { encodeAddress } from "@polkadot/util-crypto";

export interface UnbondModel {
  txHash?: string;
  receiveAddress?: string;
  tokenAmount?: string;
  // seconds
  lockTotalTime?: number;
  // seconds
  lockLeftTime?: number;
  hasReceived?: boolean;
  poolAddress?: string;
  rTokenType?: string;
  rTokenUnbondAmount?: string;

  receivedStatus?: number;

  formatTokenAmount?: string;
  formatRTokenAmount?: string;
  formatReceiveAddress?: string;
  lockTotalTimeInDays?: number | string;
  lockLeftTimeInDays?: number | string;
  formatLeftTime?: string;
  txTimestamp?: number;
}

export function useRTokenUnbond(tokenName: TokenName, page: number) {
  const tokenStandard = useTokenStandard(tokenName);

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [totalCount, setTotalCount] = useState(0);
  const [unbondList, setUnbondList] = useState<UnbondModel[] | undefined>(
    undefined
  );

  const { polkadotAccount, metaMaskAccount } = useWalletAccount();

  const { updateFlag15s, refreshDataFlag } = useAppSlice();

  const userAddress = useMemo(() => {
    if (tokenStandard === TokenStandard.ERC20) {
      return metaMaskAccount;
    } else if (tokenStandard === TokenStandard.Native) {
      if (!polkadotAccount) return "";
      const keyringInstance = keyring.init(Symbol.Fis);
      return u8aToHex(keyringInstance.decodeAddress(polkadotAccount as string));
    }
    return "";
  }, [tokenStandard, metaMaskAccount, polkadotAccount]);

  const fetchData = useCallback(async () => {
    const chainType =
      tokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : tokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : tokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : tokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1;

    if (!userAddress || chainType === -1 || !updateFlag15s) {
      setRequestStatus(RequestStatus.success);
      return;
    }

    setRequestStatus(RequestStatus.loading);
    try {
      const url = `${getRTokenApi2Host()}/stafi/webapi/rtoken/unbond`;
      const params = {
        userAddress,
        rTokenType:
          tokenName === TokenName.ETH ? -1 : getTokenSymbol(tokenName),
        pageIndex: page,
        pageCount: PAGE_SIZE,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const resJson = await res.json();

      const keyringInstance = keyring.initByTokenSymbol(
        getTokenSymbol(tokenName)
      );

      if (resJson.status === "80000" && resJson.data) {
        setRequestStatus(RequestStatus.success);
        const resUnbondList: UnbondModel[] = resJson.data.unbondList;
        const formatUnbondList: UnbondModel[] = resUnbondList.map(
          (item: UnbondModel) => {
            const formatTokenAmount = numberUtil
              .tokenAmountToHuman(
                item.tokenAmount,
                getTokenSymbol(tokenName) as TokenSymbol
              )
              .toString();
            const formatRTokenAmount = numberUtil
              .tokenAmountToHuman(
                item.rTokenUnbondAmount,
                getTokenSymbol(tokenName) as TokenSymbol
              )
              .toString();
            const lockTotalTimeInDays = numberUtil.handleAmountCeilToFixed(
              (item.lockTotalTime as any) / (60 * 60 * 24),
              0
            );
            let formatLeftTime: string = "";
            if (item.receivedStatus === 2) {
              // unstaking
              formatLeftTime = "Est. 1-8 Hours";
            } else if (item.receivedStatus === 3) {
              // unstaked
              formatLeftTime = "--";
            } else {
              // waiting
              const days = numberUtil.handleAmountCeilToFixed(
                (item.lockLeftTime as number) / (60 * 60 * 24),
                0
              );
              if (Number(days) > 0) {
                formatLeftTime = days + " D";
              } else {
                let hours = numberUtil.handleAmountCeilToFixed(
                  (item.lockLeftTime as number) / (60 * 60),
                  0
                );
                if (Number(hours) < 1) {
                  hours = "1";
                }
                formatLeftTime = hours + " Hours";
              }
            }

            const lockLeftTimeInDays = numberUtil.handleAmountCeilToFixed(
              (item.lockLeftTime as any) / (60 * 60 * 24),
              0
            );

            let formatReceiveAddress: string = "";
            if (tokenName === TokenName.MATIC || tokenName === TokenName.BNB) {
              formatReceiveAddress = item.receiveAddress as string;
            } else if (tokenName === TokenName.SOL) {
              formatReceiveAddress = keyringInstance.encodeAddress(
                item.receiveAddress as any
              );
            } else if (tokenName === TokenName.KSM) {
              formatReceiveAddress = encodeAddress(
                hexToU8a(item.receiveAddress),
                KSM_SS58_FORMAT
              );
            } else if (tokenName === TokenName.DOT) {
              formatReceiveAddress = encodeAddress(
                hexToU8a(item.receiveAddress),
                DOT_SS58_FORMAT
              );
            } else {
              formatReceiveAddress = keyringInstance.encodeAddress(
                hexToU8a(item.receiveAddress)
              );
            }

            return {
              ...item,
              formatReceiveAddress,
              formatTokenAmount,
              formatRTokenAmount,
              lockTotalTimeInDays,
              lockLeftTimeInDays,
              formatLeftTime,
            };
          }
        );

        // todo: local items
        const localRecords = getRTokenUnbondRecords(tokenName);
        const insertRecords: UnbondModel[] = [];
        localRecords.forEach((record: any) => {
          if (dayjs().valueOf() - record.timestamp < 1000 * 2 * 60) {
            const match = formatUnbondList.find((item: UnbondModel) => {
              return item.txHash === record.txHash;
            });
            if (!match) {
              insertRecords.push({
                lockTotalTimeInDays: estimateUnbondDays(tokenName),
                lockLeftTimeInDays: estimateUnbondDays(tokenName),
                formatReceiveAddress: record.recipient,
                formatTokenAmount: record.amount,
                txHash: record.txHash,
                formatRTokenAmount: record.rTokenAmount,
                formatLeftTime: "10 D",
                txTimestamp: record.txTimestamp,
                receivedStatus: 1,
                hasReceived: false,
              });
            }
          }
        });

        setUnbondList([...insertRecords, ...formatUnbondList]);
        setTotalCount(resJson.data.totalCount);
      } else if (resJson.status === "80003") {
        setRequestStatus(RequestStatus.success);
        setUnbondList([]);
        setTotalCount(0);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [tokenName, tokenStandard, page, userAddress, updateFlag15s]);

  useEffect(() => {
    fetchData();
  }, [fetchData, updateFlag15s, refreshDataFlag]);

  return {
    requestStatus,
    unbondList,
    totalCount,
  };
}
