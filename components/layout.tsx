import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthStakeCheckInterval } from "hooks/useEthStakeCheckInterval";
import { useInit } from "hooks/useInit";
import { setEthStakeModalVisible } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { EthStakeLoadingModal } from "./modal/EthStakeLoadingModal";
import { EthStakeSidebar } from "./modal/EthStakeSidebar";
import { Navbar } from "./navbar";

type LayoutProps = React.PropsWithChildren<{}>;

export const Layout = (props: LayoutProps) => {
  useInit();
  useEthStakeCheckInterval();
  const dispatch = useAppDispatch();

  const { ethStakeModalVisible } = useAppSelector((state: RootState) => {
    return {
      ethStakeModalVisible: state.eth.ethStakeModalVisible,
    };
  });

  return (
    <div className="">
      <Navbar />
      <main className="flex flex-col items-center">
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
