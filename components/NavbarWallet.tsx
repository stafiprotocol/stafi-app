import { Popover } from "@mui/material";
import classNames from "classnames";
import {
  getEtherScanUrl,
  getKsmScanUrl,
  getPolkadotScanUrl,
  getSolanaScanUrl,
  getStafiScanUrl,
} from "config/explorer";
import { getMetamaskMaticChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useDotBalance } from "hooks/useDotBalance";
import { useKsmBalance } from "hooks/useKsmBalance";
import { usePolkadotApi } from "hooks/usePolkadotApi";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenStandard, WalletType } from "interfaces/common";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import downIcon from "public/icon_down.png";
import { useContext, useEffect, useMemo } from "react";
import { updateEthBalance } from "redux/reducers/EthSlice";
import {
  setChooseAccountVisible,
  setChooseAccountWalletType,
} from "redux/reducers/FisSlice";
import {
  connectMetaMask,
  connectPhantom,
  connectPolkadotJs,
  disconnectWallet,
  updatePolkadotExtensionAccountsBalances,
  updateSelectedPolkadotAccountBalance,
  updateSolanaBalance,
} from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";
import styles from "styles/Navbar.module.scss";
import { isEmptyValue, isPolkadotWallet, openLink } from "utils/common";
import { formatNumber } from "utils/number";
import { transformSs58Address } from "utils/polkadotUtils";
import { getWalletIcon } from "utils/rToken";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { BubblesLoading } from "./common/BubblesLoading";
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
    walletNotConnected,
  } = useContext(MyLayoutContext);
  const dispatch = useAppDispatch();
  const { api } = usePolkadotApi();
  const {
    metaMaskAccount,
    polkadotExtensionAccounts,
    polkadotAccount,
    polkadotBalance,
    ksmAccount,
    dotAccount,
    solanaAccount,
    solanaBalance,
  } = useWalletAccount();
  const ksmBalance = useKsmBalance();
  const dotBalance = useDotBalance();
  const { ethBalance, maticBalance } = useAppSelector((state: RootState) => {
    return {
      ethBalance: state.eth.balance,
      maticBalance: state.matic.balance,
    };
  });

  const router = useRouter();

  const {
    metaMaskConnected,
    polkadotConnected,
    ksmConnected,
    dotConnected,
    solanaConnected,
  } = useMemo(() => {
    return {
      metaMaskConnected: !!metaMaskAccount,
      polkadotConnected: !!polkadotAccount,
      ksmConnected: !!ksmAccount,
      dotConnected: !!dotAccount,
      solanaConnected: !!solanaAccount,
    };
  }, [metaMaskAccount, polkadotAccount, ksmAccount, dotAccount, solanaAccount]);

  const accountsPopupState = usePopupState({
    variant: "popover",
    popupId: "accounts",
  });

  useEffect(() => {
    dispatch(connectPhantom(true));
  }, [dispatch]);

  useEffect(() => {
    dispatch(updateSolanaBalance());
  }, [solanaAccount, dispatch]);

  useEffect(() => {
    dispatch(updateEthBalance());
  }, [dispatch, metaMaskAccount, metaMaskChainId]);

  useEffect(() => {
    dispatch(updateSelectedPolkadotAccountBalance());
  }, [dispatch, polkadotAccount]);

  const polkadotExtensionAccountsKey = useMemo(() => {
    return polkadotExtensionAccounts.map((item) => item.address).join("-");
  }, [polkadotExtensionAccounts]);

  useEffect(() => {
    dispatch(updatePolkadotExtensionAccountsBalances());
  }, [dispatch, polkadotExtensionAccountsKey]);

  const clickAccountLeftArea = () => {
    if (isWrongMetaMaskNetwork) {
      dispatch(connectMetaMask(targetMetaMaskChainId));
    }
  };

  const clickConnectWallet = (walletType: WalletType) => {
    if (walletType === WalletType.MetaMask) {
      dispatch(connectMetaMask(targetMetaMaskChainId));
    }
    if (isPolkadotWallet(walletType)) {
      dispatch(connectPolkadotJs(true, walletType));
    }
    if (walletType === WalletType.Phantom) {
      dispatch(connectPhantom(false));
    }
  };

  const displayMetaMaskBalance = useMemo(() => {
    if (isWrongMetaMaskNetwork) {
      return "--";
    }
    if (
      targetMetaMaskChainId === getMetamaskMaticChainId() &&
      router.pathname === "/rtoken/stake/MATIC"
    ) {
      return maticBalance;
    }
    return ethBalance;
  }, [
    targetMetaMaskChainId,
    isWrongMetaMaskNetwork,
    ethBalance,
    maticBalance,
    router.pathname,
  ]);

  const displayMetaMaskChainName = useMemo(() => {
    // if (
    //   targetMetaMaskChainId === getMetamaskMaticChainId() &&
    //   router.pathname === "/rtoken/stake/MATIC"
    // ) {
    //   return "Polygon";
    // }
    return "Ethereum";
  }, [targetMetaMaskChainId, router.pathname]);

  const displayMetaMaskTokenName = useMemo(() => {
    if (
      targetMetaMaskChainId === getMetamaskMaticChainId() &&
      router.pathname === "/rtoken/stake/MATIC"
    ) {
      return "MATIC";
    }
    return "ETH";
  }, [targetMetaMaskChainId, router.pathname]);

  const displayBalanceList = useMemo(() => {
    const res: { balance: string | undefined; tokenName: string }[] = [];
    if (polkadotConnected) {
      res.push({
        balance: polkadotBalance,
        tokenName: "FIS",
      });
    }
    if (walletType === WalletType.Polkadot_KSM) {
      if (ksmConnected) {
        res.push({
          balance: ksmBalance,
          tokenName: "KSM",
        });
      }
    } else if (walletType === WalletType.Polkadot_DOT) {
      if (dotConnected) {
        res.push({
          balance: dotBalance,
          tokenName: "DOT",
        });
      }
    } else if (walletType === WalletType.Phantom) {
      if (solanaConnected) {
        res.push({
          balance: solanaBalance,
          tokenName: "SOL",
        });
      }
    } else if (walletType === WalletType.MetaMask || !isWrongMetaMaskNetwork) {
      if (metaMaskConnected) {
        res.push({
          balance: displayMetaMaskBalance,
          tokenName: displayMetaMaskTokenName,
        });
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
    isWrongMetaMaskNetwork,
    ksmBalance,
    dotConnected,
    dotBalance,
    ksmConnected,
    solanaConnected,
    solanaBalance,
  ]);

  const [displayAddress, displayWalletType] = useMemo(() => {
    const tokenStandard = router.query.tokenStandard;
    if (
      isPolkadotWallet(walletType) ||
      tokenStandard === TokenStandard.Native
    ) {
      if (polkadotAccount) {
        return [polkadotAccount, WalletType.Polkadot];
      }
      if (metaMaskAccount) {
        return [metaMaskAccount, WalletType.MetaMask];
      }
    }
    if (walletType === WalletType.MetaMask) {
      if (metaMaskAccount) {
        return [metaMaskAccount, WalletType.MetaMask];
      }
      if (polkadotAccount) {
        return [polkadotAccount, WalletType.Polkadot];
      }
    }
    if (walletType === WalletType.Phantom) {
      if (solanaAccount) {
        return [solanaAccount, WalletType.Phantom];
      }
      if (polkadotAccount) {
        return [polkadotAccount, WalletType.Polkadot];
      }
    }

    return ["", undefined];
  }, [walletType, polkadotAccount, metaMaskAccount, router, solanaAccount]);

  const showConnectWallet = useMemo(() => {
    return !displayAddress;
  }, [displayAddress]);

  return (
    <div>
      <div
        className={styles.account}
        style={{
          background: accountsPopupState.isOpen
            ? "linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)"
            : showConnectWallet
            ? "rgba(25, 38, 52, 0.35)"
            : isWrongNetwork
            ? "rgba(255, 82, 196, 0.05)"
            : "rgba(25, 38, 52, 0.35)",
          border: accountsPopupState.isOpen
            ? "1px solid #26494E"
            : showConnectWallet
            ? "1px solid #1a2835"
            : isWrongNetwork
            ? "1px solid rgba(255, 82, 196, 0.2)"
            : "1px solid #1a2835",
        }}
        {...bindTrigger(accountsPopupState)}
      >
        {!showConnectWallet ? (
          <div className="flex items-center">
            <div className="flex items-center cursor-pointer">
              {isWrongNetwork && (
                <div
                  className="flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    clickAccountLeftArea();
                  }}
                >
                  <div className="bg-error w-[.12rem] h-[.12rem] rounded-full" />
                  <div className="ml-[.12rem] text-error text-[.24rem]">
                    {walletNotConnected ? "Unconnected" : "Wrong Net"}
                  </div>
                  <div className="mx-[.12rem] w-[1px] h-[.25rem] bg-divider1" />
                </div>
              )}

              <div className="text-text1 flex items-center">
                {displayBalanceList.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {!item.balance ? (
                      <BubblesLoading
                        color={item.tokenName === "FIS" ? "#00F3AB" : "#9DAFBE"}
                      />
                    ) : (
                      <div
                        className={classNames({
                          "text-primary": item.tokenName === "FIS",
                        })}
                      >
                        {formatNumber(item.balance)}
                      </div>
                    )}

                    <div
                      className={classNames("ml-[.06rem]", {
                        "text-primary": item.tokenName === "FIS",
                      })}
                    >
                      {item.tokenName}
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
                {getShortAddress(displayAddress, 5)}
              </div>
              <div className="bg-divider1 w-[1px] h-[.25rem] mx-[.24rem]" />
              <div className="flex items-center">
                <div className="w-[.28rem] h-[.28rem] relative">
                  <Image
                    src={getWalletIcon(displayWalletType)}
                    alt="logo"
                    layout="fill"
                  />
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
            background: "rgba(25, 38, 52, 0.3)",
            border: "1px solid #26494E",
            backdropFilter: "blur(2rem)",
            borderRadius: ".16rem",
            // boxShadow: "0 .02rem 0 rgba(25, 38, 52, 0.35)",
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
            connected={polkadotConnected}
            address={polkadotAccount || ""}
            balance={polkadotBalance}
            tokenName={"FIS"}
            onClickConnect={() => clickConnectWallet(WalletType.Polkadot)}
          />

          <div className="mt-[.08rem] mb-[.32rem] h-[1px] bg-[#26494E] opacity-30" />

          <WalletAccountItem
            name={displayMetaMaskChainName}
            walletType={WalletType.MetaMask}
            connected={metaMaskConnected}
            address={metaMaskAccount || ""}
            balance={
              targetMetaMaskChainId === getMetamaskMaticChainId() &&
              router.pathname === "/rtoken/stake/MATIC"
                ? maticBalance
                : ethBalance
            }
            tokenName={
              targetMetaMaskChainId === getMetamaskMaticChainId() &&
              router.pathname === "/rtoken/stake/MATIC"
                ? "MATIC"
                : "ETH"
            }
            onClickConnect={() => clickConnectWallet(WalletType.MetaMask)}
          />

          <WalletAccountItem
            name="Kusama"
            walletType={WalletType.Polkadot_KSM}
            connected={ksmConnected}
            address={ksmAccount || ""}
            balance={ksmBalance}
            tokenName={"KSM"}
            onClickConnect={() => clickConnectWallet(WalletType.Polkadot_KSM)}
          />

          <WalletAccountItem
            name="Polkadot"
            walletType={WalletType.Polkadot_DOT}
            connected={dotConnected}
            address={dotAccount || ""}
            balance={dotBalance}
            tokenName={"DOT"}
            onClickConnect={() => clickConnectWallet(WalletType.Polkadot_DOT)}
          />

          <WalletAccountItem
            name="Solana"
            walletType={WalletType.Phantom}
            connected={solanaConnected}
            address={solanaAccount || ""}
            balance={solanaBalance}
            tokenName={"SOL"}
            onClickConnect={() => clickConnectWallet(WalletType.Phantom)}
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
  balance: string | undefined;
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
              {isPolkadotWallet(props.walletType)
                ? "Polkadot.js"
                : props.walletType}
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
            <div className="text-primary text-[.24rem] mr-[.2rem] flex items-center">
              {isEmptyValue(props.balance) ? (
                <BubblesLoading color="#00F3AB" />
              ) : (
                formatNumber(props.balance)
              )}
              <div className="ml-[.06rem]">{props.tokenName}</div>
            </div>
          )}

          <div
            className={`-rotate-90 w-[.19rem] h-[0.1rem] relative ${
              props.connected && "opacity-30"
            }`}
          >
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
          {isWrongMetaMaskNetwork &&
            props.walletType === WalletType.MetaMask && (
              <>
                <div
                  className="text-center py-[.24rem] cursor-pointer active:text-primary"
                  onClick={() => {
                    dispatch(connectMetaMask(targetMetaMaskChainId));
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
              try {
                const address = isPolkadotWallet(props.walletType)
                  ? transformSs58Address(props.address, props.walletType)
                  : props.address;
                navigator.clipboard.writeText(address).then(() => {
                  snackbarUtil.success("Copied");
                  menuPopupState.close();
                });
              } catch (err: unknown) {}
            }}
          >
            Copy Address
          </div>
          <div className="bg-[#26494E] opacity-30 mx-[.24rem] h-[1px]" />
          {isPolkadotWallet(props.walletType) && (
            <>
              <div
                className="text-center py-[.24rem] cursor-pointer active:text-primary"
                onClick={() => {
                  dispatch(setChooseAccountWalletType(props.walletType));
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
              } else if (props.walletType === WalletType.Polkadot_KSM) {
                openLink(getKsmScanUrl());
              } else if (props.walletType === WalletType.Polkadot_DOT) {
                openLink(getPolkadotScanUrl());
              } else if (props.walletType === WalletType.Phantom) {
                openLink(getSolanaScanUrl());
              }
            }}
          >
            Block Explorer
          </div>
          {
            <>
              <div className="bg-[#26494E] opacity-30 mx-[.24rem] h-[1px]" />
              <div
                className="text-center py-[.24rem] cursor-pointer active:text-primary"
                onClick={() => {
                  menuPopupState.close();
                  dispatch(disconnectWallet(props.walletType));
                }}
              >
                Disconnect
              </div>
            </>
          }
        </div>
      </Popover>
    </>
  );
};
