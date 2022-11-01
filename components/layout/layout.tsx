import { AppBar } from "@mui/material";
import classNames from "classnames";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useInit } from "hooks/useInit";
import { NavigationItem } from "interfaces/common";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { setEthValiatorStakeModalVisible } from "redux/reducers/EthSlice";
import { setMetaMaskAccount } from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";
import { isServer } from "utils/common";
import { HideOnScroll } from "../common/HideOnScroll";
import { Icomoon } from "../icon/Icomoon";
import { EthValidatorStakeLoadingModal } from "../modal/EthValidatorStakeLoadingModal";
import { EthValidatorStakeSidebar } from "../modal/EthValidatorStakeSidebar";
import { Navbar } from "./navbar";

type LayoutProps = React.PropsWithChildren<{}>;

export type WalletType = "MetaMask" | "Polkadot" | "Phantom";

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
  targetMetaMaskChainId: number | undefined;
  setTargetMetaMaskChainId: any;
  isWrongMetaMaskNetwork: boolean;
  walletType: WalletType;
  setWalletType: any;
}>({
  navigation: undefined,
  setNavigation: undefined,
  targetMetaMaskChainId: undefined,
  setTargetMetaMaskChainId: undefined,
  isWrongMetaMaskNetwork: false,
  walletType: "MetaMask",
  setWalletType: undefined,
});

export const Layout = (props: LayoutProps) => {
  useInit();
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [targetMetaMaskChainId, setTargetMetaMaskChainId] = useState();
  const [walletType, setWalletType] = useState<WalletType>("MetaMask");

  const isWrongMetaMaskNetwork = useMemo(() => {
    return metaMaskChainId !== targetMetaMaskChainId;
  }, [metaMaskChainId, targetMetaMaskChainId]);

  if (isServer()) {
    return null;
  }

  return (
    <MyLayoutContext.Provider
      value={{
        navigation,
        setNavigation,
        targetMetaMaskChainId,
        setTargetMetaMaskChainId,
        isWrongMetaMaskNetwork,
        walletType,
        setWalletType,
      }}
    >
      <div className="">
        <Head>
          <title>StaFi rETH</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <HideOnScroll>
          <AppBar position="fixed" color="darkBg">
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

          <div className="w-[14.88rem] mb-[.3rem]">{props.children}</div>
        </main>

        <EthValidatorStakeLoadingModal />

        <EthValidatorStakeSidebar />
      </div>
    </MyLayoutContext.Provider>
  );
};
