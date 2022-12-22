import { Box, Stack } from "@mui/material";
import classNames from "classnames";
import { EmptyContent } from "components/common/EmptyContent";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { TokenName, TokenStandard } from "interfaces/common";
import { useEffect, useState } from "react";
import {
  resetStakeLoadingParams,
  setUnreadNoticeFlag,
  updateNotice,
  updateStakeLoadingParams,
} from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import { openLink } from "utils/common";
import {
  getNoticeList,
  LocalNotice,
  NoticeEthDepositData,
  NoticeRTokenStakeData,
  NoticeType,
} from "utils/notice";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { removeStorage, STORAGE_KEY_UNREAD_NOTICE } from "utils/storage";
import { formatDate } from "utils/time";

export const NoticeList = (props: { isOpen: boolean; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const [noticeList, setNoticeList] = useState<LocalNotice[]>([]);

  const { stakeLoadingParams } = useAppSelector((state: RootState) => {
    return { stakeLoadingParams: state.app.stakeLoadingParams };
  });

  useEffect(() => {
    if (props.isOpen) {
      const noticeList = getNoticeList();
      setNoticeList(noticeList);

      dispatch(setUnreadNoticeFlag(false));
      removeStorage(STORAGE_KEY_UNREAD_NOTICE);

      noticeList?.forEach((notice) => {
        if (notice.type === "rToken Stake" && notice.status === "Pending") {
          if (dayjs().valueOf() - Number(notice.timestamp) > 3600000) {
            const noticeStakeLoadingParams = notice.stakeLoadingParams;
            if (!noticeStakeLoadingParams) {
              return;
            }
            if (
              noticeStakeLoadingParams.tokenStandard !== TokenStandard.Native
            ) {
              if (
                noticeStakeLoadingParams.progressDetail?.sending
                  ?.totalStatus === "success" &&
                noticeStakeLoadingParams.progressDetail?.staking
                  ?.totalStatus === "success" &&
                noticeStakeLoadingParams.progressDetail?.minting
                  ?.totalStatus === "success" &&
                noticeStakeLoadingParams.progressDetail?.swapping
                  ?.totalStatus === "loading"
              ) {
                dispatch(
                  updateNotice(notice.id, {
                    status: "Confirmed",
                    stakeLoadingParams: {
                      ...noticeStakeLoadingParams,
                      status: "success",
                      progressDetail: {
                        ...noticeStakeLoadingParams.progressDetail,
                        swapping: {
                          totalStatus: "success",
                        },
                      },
                    },
                  })
                );

                if (
                  stakeLoadingParams &&
                  stakeLoadingParams.noticeUuid === notice.id
                ) {
                  dispatch(
                    updateStakeLoadingParams({
                      status: "success",
                      progressDetail: {
                        swapping: {
                          totalStatus: "success",
                        },
                      },
                    })
                  );
                }
                setTimeout(() => {
                  updateNoticeList();
                }, 500);
              }
            }
          }
        }
      });
    }
  }, [dispatch, props.isOpen, stakeLoadingParams]);

  const updateNoticeList = () => {
    const noticeList = getNoticeList();
    setNoticeList(noticeList);
  };

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
      if (notice.type === "rToken Unstake") {
        data = notice.data as NoticeRTokenStakeData;
        return `Unstake ${data.amount} r${
          data.tokenName
        } from StaFi Pool Contract to your wallet, and receive ${formatNumber(
          data.willReceiveAmount
        )} ${data.tokenName}.`;
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

  const openStakeLoadingModal = (notice: LocalNotice) => {
    if (notice.stakeLoadingParams) {
      if (stakeLoadingParams) {
        if (
          notice.stakeLoadingParams.noticeUuid === stakeLoadingParams.noticeUuid
        ) {
          dispatch(
            updateStakeLoadingParams({
              modalVisible: true,
            })
          );
        } else {
          snackbarUtil.warning(
            "A stake process is going on, please wait a moment."
          );
        }
      } else {
        dispatch(
          resetStakeLoadingParams({
            ...notice.stakeLoadingParams,
            modalVisible: true,
          })
        );
      }
    } else {
      snackbarUtil.error("Missing data");
    }
  };

  const clickStatus = (notice: LocalNotice) => {
    props.onClose();
    if (notice.type === "rToken Stake") {
      if (notice.status !== "Confirmed") {
        openStakeLoadingModal(notice);
      } else {
        const noticeData = notice.data as NoticeRTokenStakeData;
        if (noticeData.tokenName === TokenName.ETH) {
          openLink(getNoticeUrl(notice));
        } else {
          openStakeLoadingModal(notice);
        }
      }
    } else {
      openLink(getNoticeUrl(notice));
    }
  };

  return (
    <Box width="5rem" px=".24rem" py=".1rem">
      <Box
        minHeight="5rem"
        maxHeight="5rem"
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
              <div className="text-text2 text-[.16rem] leading-normal">
                {getNoticeContent(notice)}
              </div>
            </div>

            <Stack direction="row" justifyContent="space-between" mt=".15rem">
              <div className="text-text1 text-[.16rem]">
                {formatDate(notice.timestamp || 0)}
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
                style={{
                  textDecorationColor:
                    notice.status === "Confirmed"
                      ? "#00F3AB60"
                      : notice.status === "Pending"
                      ? "#9DAFBE60"
                      : "#FF52C460",
                }}
                onClick={() => clickStatus(notice)}
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
          </Stack>
        )}
      </Box>
    </Box>
  );
};
