import { AppBar } from "@mui/material";
import classNames from "classnames";
import { ChooseFisAccountModal } from "components/modal/ChooseFisAccountModal";
import { ConnectWalletModal } from "components/modal/ConnectWalletModal";
import { RTokenStakeLoadingModal } from "components/modal/RTokenStakeLoadingModal";
import { hooks } from "connectors/metaMask";
import { useAppDispatch } from "hooks/common";
import { useInit } from "hooks/useInit";
import { useWalletAccount } from "hooks/useWalletAccount";
import { NavigationItem, WalletType } from "interfaces/common";
import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { HideOnScroll } from "../common/HideOnScroll";
import { Icomoon } from "../icon/Icomoon";
import { EthValidatorStakeLoadingModal } from "../modal/EthValidatorStakeLoadingModal";
import { EthValidatorStakeSidebar } from "../modal/EthValidatorStakeSidebar";
import { Navbar } from "./navbar";

type LayoutProps = React.PropsWithChildren<{}>;

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
  targetMetaMaskChainId: number | undefined;
  setTargetMetaMaskChainId: any;
  walletType: WalletType;
  setWalletType: any;
  // MetaMask wrong network flag.
  isWrongMetaMaskNetwork: boolean;
  // All wallet wrong network flag, including MetaMask, Phantom, Keplr, etc.
  isWrongNetwork: boolean;
  // Will change through pages, depending on which wallet to connect.
  walletNotConnected: boolean;
}>({
  navigation: undefined,
  setNavigation: undefined,
  targetMetaMaskChainId: undefined,
  setTargetMetaMaskChainId: undefined,
  walletType: WalletType.MetaMask,
  setWalletType: undefined,
  isWrongMetaMaskNetwork: false,
  isWrongNetwork: false,
  walletNotConnected: false,
});

export const Layout = (props: LayoutProps) => {
  useInit();
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [targetMetaMaskChainId, setTargetMetaMaskChainId] = useState();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.MetaMask);

  const { metaMaskAccount } = useWalletAccount();

  const isWrongMetaMaskNetwork = useMemo(() => {
    return metaMaskChainId !== targetMetaMaskChainId;
  }, [metaMaskChainId, targetMetaMaskChainId]);

  const isWrongNetwork = useMemo(() => {
    if (walletType === WalletType.MetaMask) {
      return isWrongMetaMaskNetwork;
    }
    return false;
  }, [walletType, isWrongMetaMaskNetwork]);

  const walletNotConnected = useMemo(() => {
    if (walletType === WalletType.MetaMask) {
      return !metaMaskAccount;
    }
    return false;
  }, [walletType, metaMaskAccount]);

  // if (isServer()) {
  //   return null;
  // }

  return (
    <MyLayoutContext.Provider
      value={{
        navigation,
        setNavigation,
        targetMetaMaskChainId,
        setTargetMetaMaskChainId,
        walletType,
        setWalletType,
        isWrongMetaMaskNetwork,
        isWrongNetwork,
        walletNotConnected,
      }}
    >
      <div className="">
        <Head>
          <title>StaFi rToken APP</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <HideOnScroll>
          <AppBar position="fixed" color="transparent">
            <Navbar />
          </AppBar>
        </HideOnScroll>

        <main className="flex flex-col items-center pt-[1.3rem]">
          <div
            className={classNames(
              "w-[14.88rem] flex items-center py-[.56rem]",
              {
                invisible: !navigation || navigation.length <= 1,
              }
            )}
          >
            {navigation?.map((item, index) => (
              <div
                key={item.name}
                className={classNames(
                  "flex items-center text-text2 text-[.24rem]"
                )}
              >
                <div className="cursor-default">
                  {!!item.path ? (
                    <Link href={item.path}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                </div>
                {index !== navigation.length - 1 && (
                  <div className="mx-[.2rem] rotate-[180deg]">
                    <Icomoon icon="right" size=".16rem" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="w-[14.88rem] mb-[1rem]">{props.children}</div>
        </main>

        <EthValidatorStakeLoadingModal />

        <EthValidatorStakeSidebar />

        <RTokenStakeLoadingModal />

        <ConnectWalletModal />

				<ChooseFisAccountModal />
      </div>
    </MyLayoutContext.Provider>
  );
};
