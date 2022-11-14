import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUnreadNoticeFlag } from "redux/reducers/AppSlice";
import {
  LocalNotice,
  NoticeEthDepositData,
  NoticeRTokenStakeData,
} from "utils/notice";
import { openLink } from "utils/common";
import { getNoticeList } from "utils/notice";
import { removeStorage, STORAGE_KEY_UNREAD_NOTICE } from "utils/storage";
import { formatDate } from "utils/time";
import { EmptyContent } from "components/common/EmptyContent";
import classNames from "classnames";
import { formatNumber } from "utils/number";

export const NoticeList = (props: { isOpen: boolean; onClose: () => void }) => {
  const dispatch = useDispatch();
  const [noticeList, setNoticeList] = useState<LocalNotice[]>([]);

  useEffect(() => {
    if (props.isOpen) {
      setNoticeList(getNoticeList());

      dispatch(setUnreadNoticeFlag(false));
      removeStorage(STORAGE_KEY_UNREAD_NOTICE);
    }
  }, [dispatch, props.isOpen]);

  const getNoticeTitle = (notice: LocalNotice): string => {
    return notice.type;
  };

  const getNoticeContent = (notice: LocalNotice): string => {
    try {
      let data;
      if (notice.type === "rToken Stake") {
        data = notice.data as NoticeRTokenStakeData;
        return `Stake ${data.amount} ${
          data.tokenName
        } from your Wallet to StaFi Pool Contract, and receive ${formatNumber(
          data.willReceiveAmount
        )} r${data.tokenName}.`;
      }
      if (notice.type === "ETH Deposit") {
        data = notice.data as NoticeEthDepositData;
        return `Deposit ${data.amount} ETH as ${data.type} validator, with ${
          data.pubkeys.length
        } ${data.pubkeys.length === 1 ? "public key" : "public keys"}.`;
      }
      if (notice.type === "ETH Stake") {
        data = notice.data as NoticeEthDepositData;
        return `Stake ${data.amount} ETH as ${data.type} validator, with ${
          data.pubkeys.length
        } ${data.pubkeys.length === 1 ? "public key" : "public keys"}.`;
      }
    } catch (err: unknown) {}

    return "";
  };

  const getNoticeUrl = (notice: LocalNotice): string | undefined => {
    try {
      return notice.scanUrl;
      // let data;
      // if (notice.type === "Fee Station") {
      //   data = notice.data as NoticeFeeStationData;
      //   if (data.payTxHash) {
      //     return `${notice.explorerUrl}/tx/${data.payTxHash}`;
      //   }
      //   return `${notice.explorerUrl}/account/${notice.txDetail.address}`;
      // } else {
      //   return `${notice.explorerUrl}/tx/${notice.txDetail.transactionHash}`;
      // }
    } catch (err: unknown) {}

    return "";
  };

  return (
    <Box width="5rem" px=".24rem" py=".1rem">
      <Box
        minHeight="4.8rem"
        maxHeight="4.8rem"
        sx={{
          overflow: "auto",
        }}
      >
        {noticeList.map((notice, index) => (
          <div key={notice.id}>
            <div className="mt-[.24rem]">
              <div className="font-[700] text-text1 text-[.24rem]">
                {getNoticeTitle(notice)}
              </div>
            </div>

            <div className="mt-[.11rem]">
              <div className="text-text2 text-[.16rem]">
                {getNoticeContent(notice)}
              </div>
            </div>

            <Stack direction="row" justifyContent="space-between" mt=".15rem">
              <div className="text-text1 text-[.16rem]">
                {formatDate(notice.timestamp)}
              </div>

              <div
                className={classNames(
                  "text-[.16rem] cursor-pointer underline",
                  notice.status === "Confirmed"
                    ? "text-primary"
                    : notice.status === "Pending"
                    ? "text-text1"
                    : "text-error"
                )}
                onClick={() => {
                  props.onClose();
                  openLink(getNoticeUrl(notice));
                }}
              >
                {notice.status}
              </div>
            </Stack>

            {index < noticeList.length - 1 && (
              <Box
                mt=".24rem"
                height="1px"
                sx={{
                  backgroundColor: "#26494E",
                  opacity: 0.3,
                }}
              />
            )}
          </div>
        ))}

        {noticeList.length === 0 && (
          <Stack mt="30px" alignItems="center">
            <EmptyContent mt="1rem" size=".7rem" />
            <div className="mt-[.2rem] text-[.16rem] text-text2">
              Ops, there is nothing here
            </div>
          </Stack>
        )}
      </Box>
    </Box>
  );
};
