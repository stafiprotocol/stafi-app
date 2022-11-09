import { Box, Modal } from "@mui/material";
import { Icomoon } from "components/icon/Icomoon";
import { ConnectWalletItem } from "components/rtoken/ConnectWalletItem";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import metaMask from "public/wallet/metaMask.svg";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import { connectMetaMask } from "utils/web3Utils";

interface ConnectWalletModalProps {}

export const ConnectWalletModal = (props: ConnectWalletModalProps) => {
  const dispatch = useAppDispatch();
  const { connectWalletModalParams } = useAppSelector((state: RootState) => {
    return {
      connectWalletModalParams: state.app.connectWalletModalParams,
    };
  });

  if (!connectWalletModalParams) {
    return null;
  }

  return (
    <Modal
      open={connectWalletModalParams.visible}
      onClose={() => dispatch(setConnectWalletModalParams(undefined))}
    >
      <Box
        pt="0"
        sx={{
          border: "1px solid #1A2835",
          backgroundColor: "#0A131B",
          width: "6rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex flex-col items-stretch px-[.56rem] pb-[.6rem] relative">
          <div
            className="absolute right-[.16rem] top-[.16rem] cursor-pointer"
            onClick={() => dispatch(setConnectWalletModalParams(undefined))}
          >
            <Icomoon icon="close" size="0.24rem" color="#5B6872" />
          </div>

          <div className="text-center mt-[0.56rem] text-white font-[700] text-[.42rem]">
            {connectWalletModalParams.walletList.length === 1
              ? "Connect Wallet"
              : `Connect ${connectWalletModalParams.walletList.length} Wallets`}
          </div>

          <div className="text-center text-[.16rem] text-text1 mt-[.24rem]">
            Connect following wallets below to stake your tokens
          </div>

          <div className="py-[.32rem]">
            {connectWalletModalParams.walletList.map((item) => (
              <ConnectWalletItem
                key={item}
                walletType={item}
                targetMetaMaskChainId={
                  connectWalletModalParams.targetMetaMaskChainId
                }
              />
            ))}
          </div>

          <div className="text-text2 text-[.16rem] leading-tight invisible">
            Need a Native StaFi Wallet? Create a new wallet or import your
            existing wallet by following our{" "}
            <a
              className="text-primary underline cursor-pointer"
              href="https://www.google.com"
              target="_blank"
              rel="noreferrer"
            >
              guide
            </a>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
