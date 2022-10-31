import { Popover } from "@mui/material";
import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { NoticeList } from "components/notice/NoticeList";
import {
  getMetamaskEthChainId,
  getMetamaskValidatorChainId,
} from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch } from "hooks/common";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import Image from "next/image";
import ethereumLogo from "public/eth_logo.png";
import downIcon from "public/icon_down.png";
import notificationIcon from "public/icon_notification.svg";
import stafiLogo from "public/stafi_logo.svg";
import React, { useContext, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { connectMetaMask, MetaMaskConnectType } from "utils/web3Utils";
import styles from "styles/Navbar.module.scss";
import { updateEthBalance } from "redux/reducers/EthSlice";
import { MyLayoutContext } from "./layout";

export const Navbar = () => {
  const { isWrongMetaMaskNetwork, targetMetaMaskChainId } =
    useContext(MyLayoutContext);
  const dispatch = useAppDispatch();

  const {
    useAccount: useMetaMaskAccount,
    useChainId: useMetaMaskChainId,
    useProvider: useMetaMaskProvider,
  } = hooks;
  const metaMaskAccount = useMetaMaskAccount();
  const metaMaskChainId = useMetaMaskChainId();
  const metaMaskProvider = useMetaMaskProvider();

  useEffect(() => {
    dispatch(updateEthBalance(metaMaskProvider));
  }, [dispatch, metaMaskProvider]);

  const { unreadNoticeFlag, ethBalance } = useSelector((state: RootState) => {
    return {
      ethBalance: state.eth.balance,
      unreadNoticeFlag: state.app.unreadNoticeFlag,
    };
  });

  const noticePopupState = usePopupState({
    variant: "popover",
    popupId: "notice",
  });

  const clickAccountLeftArea = () => {
    if (isWrongMetaMaskNetwork) {
      connectMetaMask(targetMetaMaskChainId);
    }
  };

  return (
    <div className="bg-navbarBg h-[1.3rem] flex items-center justify-between">
      <div className="flex items-center pl-[.85rem]">
        <div className="w-[.28rem] h-[.28rem] relative">
          <Image src={stafiLogo} alt="logo" layout="fill" />
        </div>
        {/* <Link href="/rtoken"> */}
        <div className={classNames(styles["rtoken-button"], "text-white")}>
          rToken
        </div>
        {/* </Link> */}
      </div>

      <div className="flex items-center pr-[.85rem]">
        <div
          className={styles.account}
          style={{
            background:
              isWrongMetaMaskNetwork && metaMaskAccount
                ? "rgba(255, 82, 196, 0.05)"
                : "rgba(25, 38, 52, 0.35)",
            border:
              isWrongMetaMaskNetwork && metaMaskAccount
                ? "1px solid rgba(255, 82, 196, 0.2)"
                : "1px solid #1a2835",
          }}
        >
          {metaMaskAccount ? (
            <div className="flex items-center">
              <div
                className="flex items-center cursor-pointer"
                onClick={clickAccountLeftArea}
              >
                {isWrongMetaMaskNetwork && (
                  <div className="flex items-center">
                    <div className="bg-error w-[.12rem] h-[.12rem] rounded-full" />
                    <div className="ml-[.12rem] text-error text-[.24rem]">
                      Wrong Net
                    </div>
                    <div className="mx-[.12rem] w-[1px] h-[.25rem] bg-divider1" />
                  </div>
                )}

                <div className="text-text1">
                  {isWrongMetaMaskNetwork ? "--" : formatNumber(ethBalance)} ETH
                </div>
              </div>
              <div
                className={styles["account-info-container"]}
                onClick={() => {
                  navigator.clipboard.writeText(metaMaskAccount).then(() => {
                    snackbarUtil.success("Copied");
                  });
                }}
              >
                <div className="text-text2">
                  {getShortAddress(metaMaskAccount, 5)}
                </div>
                <div className="bg-divider1 w-[1px] h-[.25rem] mx-[.24rem]" />
                <div className="flex items-center">
                  <div className="w-[.28rem] h-[.28rem] relative">
                    <Image src={ethereumLogo} alt="logo" layout="fill" />
                  </div>

                  <div className="ml-[.16rem] w-[.19rem] h-[.1rem] relative hidden">
                    <Image src={downIcon} alt="down" layout="fill" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={styles["connect-wallet-container"]}
              onClick={() => {
                connectMetaMask(getMetamaskEthChainId());
              }}
            >
              <div>Connect Wallet</div>
              <div className="rotate-90 ml-[.2rem] hidden">
                <Icomoon icon="right" size=".2rem" color="#ffffff" />
              </div>
            </div>
          )}
        </div>

        <div
          className={styles.notification}
          {...bindTrigger(noticePopupState)}
          style={{
            background: noticePopupState.isOpen
              ? "linear-gradient(0deg,rgba(0, 243, 171, 0.3) 0%,rgba(26, 40, 53, 0.2) 30%),rgba(26, 40, 53, 0.2) 100%)"
              : "rgba(25, 38, 52, 0.35)",
            border: noticePopupState.isOpen
              ? "1px solid rgba(0, 243, 171, 0.2)"
              : "1px solid #1a2835",
          }}
        >
          {unreadNoticeFlag && (
            <div className="bg-primary rounded-full top-[.12rem] right-[.24rem] w-[.12rem] h-[.12rem] absolute" />
          )}
          <div className="w-[.26rem] h-[.3rem] relative">
            <Image src={notificationIcon} alt="logo" layout="fill" />
          </div>
        </div>
      </div>

      {/* Notice */}
      <Popover
        {...bindPopover(noticePopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: ".3rem",
          marginLeft: "55px",
          "& .MuiPopover-paper": {
            background: "rgba(25, 38, 52, 0.35)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".16rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <NoticeList
          isOpen={noticePopupState.isOpen}
          onClose={noticePopupState.close}
        />
      </Popover>
    </div>
  );
};
