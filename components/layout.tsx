import { AppBar } from "@mui/material";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthStakeCheckInterval } from "hooks/useEthStakeCheckInterval";
import { useInit } from "hooks/useInit";
import { useEffect } from "react";
import { setEthStakeModalVisible } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { HideOnScroll } from "./HideOnScroll";
import { EthStakeLoadingModal } from "./modal/EthStakeLoadingModal";
import { EthStakeSidebar } from "./modal/EthStakeSidebar";
import { Navbar } from "./navbar";

type LayoutProps = React.PropsWithChildren<{}>;

export const Layout = (props: LayoutProps) => {
  useInit();
  useEthStakeCheckInterval();
  const dispatch = useAppDispatch();
  const { useAccount: useMetaMaskAccount } = hooks;
  const metaMaskAccount = useMetaMaskAccount();

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
    <div className="">
      <HideOnScroll>
        <AppBar position="fixed" color="darkBg">
          <Navbar />
        </AppBar>
      </HideOnScroll>

      <main className="flex flex-col items-center pt-[1.3rem]">
        <div className="w-[14.88rem] mb-[.3rem]">{props.children}</div>
      </main>

      <EthStakeLoadingModal
        visible={ethStakeModalVisible}
        onClose={() => dispatch(setEthStakeModalVisible(false))}
      />

      <EthStakeSidebar />
    </div>
  );
};
