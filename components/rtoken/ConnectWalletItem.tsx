import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { hooks } from "connectors/metaMask";
import { useWalletAccount } from "hooks/useWalletAccount";
import { WalletType } from "interfaces/common";
import Image from "next/image";
import metaMask from "public/wallet/metaMask.svg";
import { useMemo, useState } from "react";
import { connectMetaMask } from "utils/web3Utils";

interface ConnectWalletItemProps {
  walletType: WalletType;
  targetMetaMaskChainId?: number | undefined;
}

export const ConnectWalletItem = (props: ConnectWalletItemProps) => {
  const { walletType, targetMetaMaskChainId } = props;
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const { metaMaskAccount } = useWalletAccount();
  const [showDetail, setShowDetail] = useState(false);

  const userAddress = useMemo(() => {
    if (walletType === WalletType.MetaMask) {
      return metaMaskAccount;
    }
    return "";
  }, [metaMaskAccount, walletType]);

  const getIcon = () => {
    if (walletType === WalletType.MetaMask) {
      return metaMask;
    }
    return undefined;
  };

  const showWrongNetwork =
    walletType === WalletType.MetaMask &&
    targetMetaMaskChainId !== metaMaskChainId;

  return (
    <div>
      {!!userAddress ? (
        <div>
          <div className="h-[.75rem] flex items-center">
            <div className="w-[.3rem] h-[.3rem] relative">
              <Image src={getIcon()} layout="fill" alt="icon" />
            </div>

            <div className="text-white text-[.2rem] ml-[.16rem]">
              {walletType}
            </div>

            {showWrongNetwork ? (
              <div
                className={classNames(
                  "ml-[.16rem] px-[.16rem] rounded-[.05rem] h-[.31rem] flex items-center justify-center cursor-pointer border-solid border-[1px]",
                  showDetail ? "bg-error/10 border-error/10" : "border-error/50"
                )}
                style={{
                  backdropFilter: "blur(.4rem)",
                }}
                onClick={() => setShowDetail(!showDetail)}
              >
                <div className="text-error text-[.16rem]">Wrong Network</div>
                <div
                  className={classNames(
                    "ml-[.13rem]",
                    showDetail ? "-rotate-90" : "rotate-90"
                  )}
                >
                  <Icomoon icon="right" size="0.13rem" color={"#FF52C4"} />
                </div>
              </div>
            ) : (
              <div
                className={classNames(
                  "ml-[.16rem] px-[.16rem] rounded-[.05rem] h-[.31rem] flex items-center justify-center cursor-pointer border-solid border-[1px]",
                  showDetail
                    ? "bg-primary/10 border-primary/10"
                    : "border-primary/50"
                )}
                style={{
                  backdropFilter: "blur(.4rem)",
                }}
                onClick={() => setShowDetail(!showDetail)}
              >
                <div className="text-primary text-[.16rem]">Connected</div>
                <div
                  className={classNames(
                    "ml-[.13rem]",
                    showDetail ? "-rotate-90" : "rotate-90"
                  )}
                >
                  <Icomoon icon="right" size="0.13rem" color={"#00F3AB"} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="h-[.75rem] flex items-center justify-center rounded-[.16rem] text-white cursor-pointer border-solid border-[1px] bg-primary/5 border-[#9DAF5A]/20 hover:bg-primary/40 active:bg-primary active:text-[#1A2835]"
          style={{
            backdropFilter: "blur(.4rem)",
          }}
          onClick={() => {
            if (walletType === WalletType.MetaMask) {
              connectMetaMask(targetMetaMaskChainId);
            }
          }}
        >
          <div className="w-[.3rem] h-[.3rem] relative">
            <Image src={getIcon()} layout="fill" alt="icon" />
          </div>

          <div className="text-[.2rem] ml-[.16rem]">
            Connect to {walletType}
          </div>
        </div>
      )}

      {showDetail && !!userAddress && (
        <div
          className="rounded-[.32rem] p-[.25rem]"
          style={{
            background: "rgba(9, 15, 23, 0.25)",
            border: "1px solid rgba(38, 73, 78, 0.5)",
            backdropFilter: "blur(.4rem)",
          }}
        >
          <div className="flex items-start leading-tight">
            <div className="text-text1 text-[.16rem] w-[1rem] min-w-[1rem] text-end">
              Address:
            </div>
            <div className="ml-[.16rem] text-text2 text-[.16rem] break-all">
              {userAddress}
            </div>
          </div>

          <div className="mt-[.16rem] flex items-center justify-between leading-tight">
            <div className="flex items-center">
              <div className="text-text1 text-[.16rem] w-[1rem] text-end">
                Status:
              </div>

              <div
                className={classNames(
                  "rounded-full min-w-[.1rem] min-h-[.1rem] w-[.1rem] h-[.1rem] ml-[.14rem]",
                  showWrongNetwork ? "bg-error" : "bg-primary"
                )}
              />

              <div className="text-text1 text-[.16rem] ml-[.12rem]">
                {showWrongNetwork ? "Wrong Network" : "Connected"}
              </div>
            </div>

            {showWrongNetwork && (
              <div
                className="text-[.16rem] text-primary underline cursor-pointer"
                onClick={() => {
                  if (walletType === WalletType.MetaMask) {
                    connectMetaMask(targetMetaMaskChainId);
                  }
                }}
              >
                Switch Network
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
