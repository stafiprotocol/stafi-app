import { AppBar } from "@mui/material";
import classNames from "classnames";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthStakeCheckInterval } from "hooks/useEthStakeCheckInterval";
import { useInit } from "hooks/useInit";
import { NavigationItem } from "interfaces";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  setEthStakeModalVisible,
  updateEthBalance,
} from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { HideOnScroll } from "./HideOnScroll";
import { Icomoon } from "./Icomoon";
import { EthStakeLoadingModal } from "./modal/EthStakeLoadingModal";
import { EthStakeSidebar } from "./modal/EthStakeSidebar";
import { Navbar } from "./navbar";

type LayoutProps = React.PropsWithChildren<{}>;

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
  updateEthBalance: () => void;
}>({
  navigation: undefined,
  setNavigation: undefined,
  updateEthBalance: () => {},
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
        <HideOnScroll>
          <AppBar position="fixed" color="darkBg">
            <Navbar />
          </AppBar>
        </HideOnScroll>

        <main className="flex flex-col items-center pt-[1.3rem]">
          <div className="w-[14.88rem] flex items-center py-[.56rem]">
            {navigation?.map((item, index) => (
              <div
                key={item.name}
                className={classNames(
                  "flex items-center text-text2 text-[.24rem]"
                )}
              >
                <div className="rotate-[180deg]">
                  <Icomoon icon="right" size=".16rem" />
                </div>

                <div className="mx-[.2rem]">
                  {!!item.path ? (
                    <Link href={item.path}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                </div>
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
