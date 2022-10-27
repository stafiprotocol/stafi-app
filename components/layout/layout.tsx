import { AppBar } from "@mui/material";
import classNames from "classnames";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthStakeCheckInterval } from "hooks/useEthStakeCheckInterval";
import { useInit } from "hooks/useInit";
import { NavigationItem } from "interfaces";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  setEthStakeModalVisible,
  updateEthBalance,
} from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { isServer } from "utils/common";
import { HideOnScroll } from "../common/HideOnScroll";
import { Icomoon } from "../icon/Icomoon";
import { EthStakeLoadingModal } from "../modal/EthStakeLoadingModal";
import { EthStakeSidebar } from "../modal/EthStakeSidebar";
import { Navbar } from "./navbar";

type LayoutProps = React.PropsWithChildren<{}>;

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
  updateEthBalance: () => void;
}>({
  navigation: undefined,
  setNavigation: undefined,
  updateEthBalance: () => { },
});

export const Layout = (props: LayoutProps) => {
  useInit();
  useEthStakeCheckInterval();
  const dispatch = useAppDispatch();
  const { useAccount: useMetaMaskAccount, useProvider: useMetaMaskProvider } =
    hooks;
  const metaMaskAccount = useMetaMaskAccount();
  const metaMaskProvider = useMetaMaskProvider();
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);

  const { ethStakeModalVisible } = useAppSelector((state: RootState) => {
    return {
      ethStakeModalVisible: state.eth.ethStakeModalVisible,
    };
  });

  useEffect(() => {
    if (!metaMaskAccount) {
      metaMask.connectEagerly();
    }
  }, [metaMaskAccount]);

  if (isServer()) {
    return null;
  }

  return (
    <MyLayoutContext.Provider
      value={{
        navigation,
        setNavigation,
        updateEthBalance: () => {
          dispatch(updateEthBalance(metaMaskProvider, metaMaskAccount));
        },
      }}
    >
      <div className="">
        <Head>
          <title>StaFi rETH</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
                <div>
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

        <EthStakeLoadingModal
          visible={ethStakeModalVisible}
          onClose={() => dispatch(setEthStakeModalVisible(false))}
        />

        <EthStakeSidebar />
      </div>
    </MyLayoutContext.Provider>
  );
};
