import { Popover } from "@mui/material";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useWalletAccount } from "hooks/useWalletAccount";
import { WalletType } from "interfaces/common";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import Image from "next/image";
import ethereumLogo from "public/eth_logo.png";
import downIcon from "public/icon_down.png";
import { useContext, useEffect } from "react";
import { updateEthBalance } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import styles from "styles/Navbar.module.scss";
import { formatNumber } from "utils/number";
import { getShortAddress } from "utils/string";
import { connectMetaMask } from "utils/web3Utils";
import { Icomoon } from "./icon/Icomoon";
import { MyLayoutContext } from "./layout/layout";
import metaMask from "public/wallet/metaMask.svg";

export const NavbarWallet = () => {
  const { walletType, isWrongMetaMaskNetwork, targetMetaMaskChainId } =
    useContext(MyLayoutContext);
  const dispatch = useAppDispatch();
  const { metaMaskAccount } = useWalletAccount();
  const { ethBalance } = useAppSelector((state: RootState) => {
    return {
      ethBalance: state.eth.balance,
    };
  });

  const accountsPopupState = usePopupState({
    variant: "popover",
    popupId: "accounts",
  });

  useEffect(() => {
    dispatch(updateEthBalance());
  }, [dispatch, metaMaskAccount]);

  const clickAccountLeftArea = () => {
    if (isWrongMetaMaskNetwork) {
      connectMetaMask(targetMetaMaskChainId);
    }
  };

  const clickConnectWallet = () => {
    if (walletType === WalletType.MetaMask) {
      connectMetaMask(targetMetaMaskChainId);
    }
  };

  return (
    <div>
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
              {isWrongMetaMaskNetwork && walletType === WalletType.MetaMask && (
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
              //   onClick={() => {
              //     navigator.clipboard.writeText(metaMaskAccount).then(() => {
              //       snackbarUtil.success("Copied");
              //     });
              //   }}
              {...bindTrigger(accountsPopupState)}
            >
              <div className="text-text2">
                {getShortAddress(metaMaskAccount, 5)}
              </div>
              <div className="bg-divider1 w-[1px] h-[.25rem] mx-[.24rem]" />
              <div className="flex items-center">
                <div className="w-[.28rem] h-[.28rem] relative">
                  <Image src={ethereumLogo} alt="logo" layout="fill" />
                </div>

                <div
                  className={classNames(
                    "ml-[.16rem] w-[.19rem] h-[.1rem] relative",
                    { "rotate-180": accountsPopupState.isOpen }
                  )}
                >
                  <Image src={downIcon} alt="down" layout="fill" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={styles["connect-wallet-container"]}
            onClick={clickConnectWallet}
          >
            <div>Connect Wallet</div>
            <div className="rotate-90 ml-[.2rem] hidden">
              <Icomoon icon="right" size=".2rem" color="#ffffff" />
            </div>
          </div>
        )}
      </div>

      <Popover
        {...bindPopover(accountsPopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: ".3rem",
          marginLeft: ".16rem",
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
        <div className="w-[6.56rem] p-[.32rem]">
          <WalletAccountItem connected={true} />
        </div>
      </Popover>
    </div>
  );
};

interface WalletAccountItemProps {
  connected: boolean;
}

const WalletAccountItem = (props: WalletAccountItemProps) => {
  return (
    <div
      className={classNames(
        "flex items-center justify-between h-[1.05rem] rounded-[.16rem]"
      )}
      style={{
        background: "rgba(26, 40, 53, 0.5)",
      }}
    >
      <div className="flex items-center">
        <div className="ml-[.24rem] w-[.3rem] h-[.3rem] relative">
          <Image src={metaMask} layout="fill" alt="icon" />
        </div>

        <div className="ml-[.14rem]">
          <div className="text-text1 text-[.24rem]">StaFi Chain</div>
          <div className="text-text1 text-[.16rem] mt-[.05rem]">Polkadot</div>
        </div>
      </div>

      <div className="mr-[.32rem] flex items-center">
        <div className="text-primary text-[.24rem] mr-[.2rem]">28 ETH</div>

        <div className="-rotate-90 w-[.19rem] h-[0.1rem] relative">
          <Image src={downIcon} layout="fill" alt="down" />
        </div>
      </div>
    </div>
  );
};
