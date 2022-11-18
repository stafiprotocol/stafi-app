import { Popover } from "@mui/material";
import classNames from "classnames";
import { getEtherScanUrl, getStafiScanUrl } from "config/explorer";
import {
  getMetamaskEthChainId,
  getMetamaskMaticChainId,
} from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { usePolkadotApi } from "hooks/usePolkadotApi";
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
import { useContext, useEffect, useMemo } from "react";
import { updateEthBalance } from "redux/reducers/EthSlice";
import { setChooseAccountVisible } from "redux/reducers/FisSlice";
import {
  connectPolkadotJs,
  updatePolkadotExtensionAccountsBalances,
  updateSelectedPolkadotAccountBalance,
  setPolkadotAccount,
  setPolkadotBalance,
} from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";
import styles from "styles/Navbar.module.scss";
import { openLink } from "utils/common";
import { formatNumber } from "utils/number";
import { getWalletIcon } from "utils/rToken";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { connectMetaMask } from "utils/web3Utils";
import { Icomoon } from "./icon/Icomoon";
import { MyLayoutContext } from "./layout/layout";

export const NavbarWallet = () => {
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const {
    walletType,
    isWrongNetwork,
    isWrongMetaMaskNetwork,
    targetMetaMaskChainId,
  } = useContext(MyLayoutContext);
  const dispatch = useAppDispatch();
  const { api } = usePolkadotApi();
  const {
    metaMaskAccount,
    polkadotAccount,
    polkadotBalance,
    polkadotExtensionAccounts,
  } = useWalletAccount();
  const { ethBalance, maticBalance } = useAppSelector((state: RootState) => {
    return {
      ethBalance: state.eth.balance,
      maticBalance: state.matic.balance,
    };
  });

  const { metaMaskConnected, polkadotConnected } = useMemo(() => {
    return {
      metaMaskConnected: !!metaMaskAccount,
      polkadotConnected: !!polkadotAccount,
    };
  }, [metaMaskAccount, polkadotAccount]);

  const accountsPopupState = usePopupState({
    variant: "popover",
    popupId: "accounts",
  });

  useEffect(() => {
    dispatch(updateEthBalance());
  }, [dispatch, metaMaskAccount, metaMaskChainId]);

  useEffect(() => {
    dispatch(updateSelectedPolkadotAccountBalance(api));
  }, [dispatch, api, polkadotAccount]);

  const polkadotExtensionAccountsKey = useMemo(() => {
    return polkadotExtensionAccounts.map((item) => item.address).join("-");
  }, [polkadotExtensionAccounts]);

  useEffect(() => {
    dispatch(updatePolkadotExtensionAccountsBalances(api));
  }, [dispatch, api, polkadotExtensionAccountsKey]);

  const clickAccountLeftArea = () => {
    if (isWrongMetaMaskNetwork) {
      connectMetaMask(targetMetaMaskChainId);
    }
  };

  const clickConnectWallet = (walletType: WalletType) => {
    if (walletType === WalletType.MetaMask) {
      connectMetaMask(targetMetaMaskChainId);
    }
    if (walletType === WalletType.Polkadot) {
      dispatch(connectPolkadotJs(true));
      // connectPolkadot()
      //   .then((accounts: FisAccount[]) => {
      //     if (accounts.length === 0) return;
      //     dispatch(setAccounts(accounts));
      //     dispatch(setFisAccount(accounts[0]));
      //     dispatch(setChooseAccountVisible(true));
      //     dispatch(setConnectWalletModalParams(undefined));
      //     dispatch(setPolkadotAccount(accounts[0].address));
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   });
    }
  };

  const displayMetaMaskBalance = useMemo(() => {
    if (isWrongMetaMaskNetwork) {
      return "--";
    }
    if (targetMetaMaskChainId === getMetamaskMaticChainId()) {
      return maticBalance;
    }
    return ethBalance;
  }, [targetMetaMaskChainId, isWrongMetaMaskNetwork, ethBalance, maticBalance]);

  const displayMetaMaskTokenName = useMemo(() => {
    if (targetMetaMaskChainId === getMetamaskMaticChainId()) {
      return "MATIC";
    }
    return "ETH";
  }, [targetMetaMaskChainId]);

  const displayBalanceList = useMemo(() => {
    const res: string[] = [];
    if (polkadotConnected) {
      res.push(`${formatNumber(polkadotBalance)} FIS`);
    }
    if (walletType === WalletType.MetaMask) {
      if (metaMaskConnected) {
        res.push(
          `${formatNumber(displayMetaMaskBalance)} ${displayMetaMaskTokenName}`
        );
      }
    }
    return res;
  }, [
    walletType,
    polkadotConnected,
    metaMaskConnected,
    polkadotBalance,
    displayMetaMaskTokenName,
    displayMetaMaskBalance,
  ]);

  return (
    <div>
      <div
        className={styles.account}
        style={{
          background: isWrongNetwork
            ? "rgba(255, 82, 196, 0.05)"
            : accountsPopupState.isOpen
            ? "linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)"
            : "rgba(25, 38, 52, 0.35)",
          border: isWrongNetwork
            ? "1px solid rgba(255, 82, 196, 0.2)"
            : accountsPopupState.isOpen
            ? "1px solid #26494E"
            : "1px solid #1a2835",
        }}
        {...bindTrigger(accountsPopupState)}
      >
        {polkadotConnected || metaMaskConnected ? (
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer"
              // onClick={clickAccountLeftArea}
            >
              {isWrongNetwork && (
                <div className="flex items-center">
                  <div className="bg-error w-[.12rem] h-[.12rem] rounded-full" />
                  <div className="ml-[.12rem] text-error text-[.24rem]">
                    Wrong Net
                  </div>
                  <div className="mx-[.12rem] w-[1px] h-[.25rem] bg-divider1" />
                </div>
              )}

              <div className="text-text1 flex items-center">
                {displayBalanceList.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={classNames({
                        "text-primary": item.endsWith("FIS"),
                      })}
                    >
                      {item}
                    </div>
                    {index !== displayBalanceList.length - 1 && (
                      <div className="w-[1px] h-[.25rem] mx-[.12rem] bg-[#2B3F52]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              className={styles["account-info-container"]}
              // {...bindTrigger(accountsPopupState)}
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
            // onClick={() => clickConnectWallet(walletType)}
            // {...bindTrigger(accountsPopupState)}
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
          "& .MuiPopover-paper": {
            background: "rgba(25, 38, 52, 0.35)",
            border: "1px solid #26494E",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".16rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <div className="w-[6.56rem] p-[.32rem]">
          <WalletAccountItem
            name="StaFi Chain"
            walletType={WalletType.Polkadot}
            connected={!!polkadotAccount}
            address={polkadotAccount || ""}
            balance={polkadotBalance}
            tokenName={"FIS"}
            onClickConnect={() => clickConnectWallet(WalletType.Polkadot)}
          />

          <div className="mt-[.08rem] mb-[.32rem] h-[1px] bg-[#26494E] opacity-30" />

          <WalletAccountItem
            name="Ethereum"
            walletType={WalletType.MetaMask}
            connected={!!metaMaskAccount}
            address={metaMaskAccount || ""}
            balance={
              targetMetaMaskChainId === getMetamaskMaticChainId()
                ? maticBalance
                : ethBalance
            }
            tokenName={
              targetMetaMaskChainId === getMetamaskMaticChainId()
                ? "MATIC"
                : "ETH"
            }
            onClickConnect={() => clickConnectWallet(WalletType.MetaMask)}
          />
        </div>
      </Popover>
    </div>
  );
};

interface WalletAccountItemProps {
  name: string;
  walletType: WalletType;
  connected: boolean;
  address: string;
  balance: string;
  tokenName: string;
  onClickConnect: () => void;
}

const WalletAccountItem = (props: WalletAccountItemProps) => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const { isWrongMetaMaskNetwork, targetMetaMaskChainId } =
    useContext(MyLayoutContext);

  const menuPopupState = usePopupState({
    variant: "popover",
    popupId: "menu",
  });

  return (
    <>
      <div
        className={classNames(
          "flex items-center justify-between h-[1.05rem] rounded-[.16rem] cursor-pointer mb-[.24rem]"
        )}
        style={{
          backdropFilter: "blue(.4rem)",
          background: !props.connected
            ? "rgba(26, 40, 53, 0.5)"
            : isWrongMetaMaskNetwork && props.walletType === WalletType.MetaMask
            ? "rgba(255, 82, 196, 0.1)"
            : "rgba(0, 243, 171, 0.1)",
          border: !props.connected
            ? "1px solid rgba(26, 40, 53, 0.5)"
            : isWrongMetaMaskNetwork && props.walletType === WalletType.MetaMask
            ? "1px solid rgba(249, 82, 255, 0.3)"
            : "1px solid rgba(0, 243, 171, 0.3)",
        }}
        {...(props.connected
          ? bindTrigger(menuPopupState)
          : {
              onClick: () => {
                props.onClickConnect();
              },
            })}
      >
        <div className="flex items-center">
          <div className="ml-[.24rem] w-[.3rem] h-[.3rem] relative">
            <Image
              src={getWalletIcon(props.walletType)}
              layout="fill"
              alt="icon"
            />
          </div>

          <div className="ml-[.14rem]">
            <div className="text-text1 text-[.24rem]">{props.name}</div>
            <div className="text-text1 text-[.16rem] mt-[.05rem]">
              {props.walletType}
            </div>
          </div>
        </div>

        <div className="mr-[.32rem] flex items-center">
          {!props.connected ? (
            <div className="text-white text-[.24rem] mr-[.2rem]">Connect</div>
          ) : isWrongMetaMaskNetwork &&
            props.walletType === WalletType.MetaMask ? (
            <div className="text-error text-[.24rem] mr-[.2rem]">
              Wrong Network
            </div>
          ) : (
            <div className="text-primary text-[.24rem] mr-[.2rem]">
              {targetMetaMaskChainId === undefined &&
              metaMaskChainId !== getMetamaskEthChainId()
                ? "--"
                : formatNumber(props.balance)}{" "}
              {props.tokenName}
            </div>
          )}

          <div className="-rotate-90 w-[.19rem] h-[0.1rem] relative">
            <Image src={downIcon} layout="fill" alt="down" />
          </div>
        </div>
      </div>

      <Popover
        {...bindPopover(menuPopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: ".1rem",
          "& .MuiPopover-paper": {
            background:
              "linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)",
            border: "1px solid #26494E",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".16rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <div className="w-[2.8rem] flex flex-col items-stretch text-text1 text-[.24rem]">
          {isWrongMetaMaskNetwork && props.walletType === WalletType.MetaMask && (
            <>
              <div
                className="text-center py-[.24rem] cursor-pointer active:text-primary"
                onClick={() => {
                  connectMetaMask(targetMetaMaskChainId);
                  menuPopupState.close();
                }}
              >
                Switch Network
              </div>
              <div className="bg-[#26494E] opacity-30 mx-[.24rem] h-[1px]" />
            </>
          )}
          <div
            className="text-center py-[.24rem] cursor-pointer active:text-primary"
            onClick={() => {
              navigator.clipboard.writeText(props.address).then(() => {
                snackbarUtil.success("Copied");
                menuPopupState.close();
              });
            }}
          >
            Copy Address
          </div>
          <div className="bg-[#26494E] opacity-30 mx-[.24rem] h-[1px]" />
          {props.walletType === WalletType.Polkadot && (
            <>
              <div
                className="text-center py-[.24rem] cursor-pointer active:text-primary"
                onClick={() => {
                  dispatch(setChooseAccountVisible(true));
                  menuPopupState.close();
                }}
              >
                Change Address
              </div>
              <div className="bg-[#26494E] opacity-30 mx-[.24rem] h-[1px]" />
            </>
          )}
          <div
            className="text-center py-[.24rem] cursor-pointer active:text-primary"
            onClick={() => {
              menuPopupState.close();
              if (props.walletType === WalletType.MetaMask) {
                openLink(getEtherScanUrl());
              } else if (props.walletType === WalletType.Polkadot) {
                openLink(getStafiScanUrl());
              }
            }}
          >
            Block Explorer
          </div>
          {props.walletType === WalletType.Polkadot && (
            <>
              <div className="bg-[#26494E] opacity-30 mx-[.24rem] h-[1px]" />
              <div
                className="text-center py-[.24rem] cursor-pointer active:text-primary"
                onClick={() => {
                  menuPopupState.close();
                  if (props.walletType === WalletType.Polkadot) {
                    dispatch(setPolkadotAccount(undefined));
                    dispatch(setPolkadotBalance("--"));
                  }
                }}
              >
                Disconnect
              </div>
            </>
          )}
        </div>
      </Popover>
    </>
  );
};
