import { getRTokenApi2Host } from "config/env";
import { ChainId, RequestStatus, TokenName, TokenStandard, TokenSymbol } from "interfaces/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTokenStandard } from "./useTokenStandard";
import { useWalletAccount } from "./useWalletAccount";
import { Symbol } from "keyring/defaults";
import { hexToU8a, u8aToHex } from "@polkadot/util";
import { useAppSlice } from "./selector";
import { getTokenSymbol } from "utils/rToken";
import { PAGE_SIZE } from "utils/constants";
import numberUtil from "utils/numberUtil";
import keyring from 'servers/keyring';
import { getRTokenUnbondRecords } from "utils/storage";
import dayjs from "dayjs";
import { estimateUnbondDays } from "config/unbond";

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

  formatTokenAmount?: string;
  formatReceiveAddress?: string;
  lockTotalTimeInDays?: number | string;
  lockLeftTimeInDays?: number | string;
};

export function useRTokenUnbond(
  tokenName: TokenName,
  page: number,
) {
  const tokenStandard = useTokenStandard(tokenName);

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [totalCount, setTotalCount] = useState(0);
  const [unbondList, setUnbondList] = useState<UnbondModel[]>([]);

  const { polkadotAccount, metaMaskAccount } = useWalletAccount();

  const { updateFlag15s } = useAppSlice();

  const userAddress = useMemo(() => {
    if (tokenStandard === TokenStandard.ERC20) {
      return metaMaskAccount;
    } else if (tokenStandard === TokenStandard.Native) {
      if (!polkadotAccount) return '';
      const keyringInstance = keyring.init(Symbol.Fis);
      return u8aToHex(keyringInstance.decodeAddress(polkadotAccount as string));
    }
    return '';
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const resJson = await res.json();

      const keyringInstance = keyring.initByTokenSymbol(getTokenSymbol(tokenName));

      if (resJson.status === '80000' && resJson.data) {
        setRequestStatus(RequestStatus.success);
        const resUnbondList: UnbondModel[] = resJson.data.unbondList;
        const formatUnbondList: UnbondModel[] = resUnbondList.map((item: UnbondModel) => {
          const formatTokenAmount = numberUtil.tokenAmountToHuman(item.tokenAmount, getTokenSymbol(tokenName) as TokenSymbol).toString();
          const lockTotalTimeInDays = numberUtil.handleAmountCeilToFixed((item.lockTotalTime as any) / (60 * 60 * 24), 0);
          const lockLeftTimeInDays = numberUtil.handleAmountCeilToFixed((item.lockLeftTime as any) / (60 * 60 * 24), 0);

          let formatReceiveAddress: string = '';
          if (tokenName === TokenName.MATIC || tokenName === TokenName.BNB) {
            formatReceiveAddress = item.receiveAddress as string;
          } else if (tokenName === TokenName.SOL) {
            formatReceiveAddress = keyringInstance.encodeAddress((item.receiveAddress as any));
          } else {
            formatReceiveAddress = keyringInstance.encodeAddress(hexToU8a(item.receiveAddress));
          }

          return {
            ...item,
            formatReceiveAddress,
            formatTokenAmount,
            lockTotalTimeInDays,
            lockLeftTimeInDays,
          };
        });

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
              });
            }
          }
        });

        setUnbondList([...insertRecords, ...formatUnbondList]);
        setTotalCount(formatUnbondList.length);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [
    tokenName,
    tokenStandard,
    page,
    userAddress,
    updateFlag15s,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData, updateFlag15s]);

  return {
    requestStatus,
    unbondList,
    totalCount,
  }
}
