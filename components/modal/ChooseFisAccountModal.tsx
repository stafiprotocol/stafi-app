import { Box, Card, Modal } from "@mui/material";
import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { usePolkadotApi } from "hooks/usePolkadotApi";
import { useWalletAccount } from "hooks/useWalletAccount";
import Image from "next/image";
import { useEffect } from "react";
import defaultAvatar from "public/default_avatar.svg";
import { setChooseAccountVisible, setRouteNextPage } from "redux/reducers/FisSlice";
import {
  setPolkadotAccount,
  updatePolkadotExtensionAccountsBalances,
} from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";
import commonStyles from "styles/Common.module.scss";
import { useRouter } from "next/router";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";

interface Props {}

export const ChooseFisAccountModal = (props: Props) => {
  const { api } = usePolkadotApi();
  const dispatch = useAppDispatch();

  const router = useRouter();

  const { chooseAccountVisible, routeNextPage } = useAppSelector((state: RootState) => {
    return {
      chooseAccountVisible: state.fis.chooseAccountVisible,
      routeNextPage: state.fis.routeNextPage,
    };
  });

  const { polkadotAccount, polkadotExtensionAccounts } = useWalletAccount();

  useEffect(() => {
    if (chooseAccountVisible) {
      dispatch(updatePolkadotExtensionAccountsBalances(api));
    }
  }, [chooseAccountVisible, dispatch, api]);

  const changeAccount = (address: string) => {
    // dispatch(setFisAccount(account));
    dispatch(setPolkadotAccount(address));
    dispatch(setChooseAccountVisible(false));
    if (routeNextPage) {
      dispatch(setConnectWalletModalParams(undefined));
      router.push(routeNextPage);
      dispatch(setRouteNextPage(undefined));
    }
  };

  return (
    <Modal
      open={chooseAccountVisible}
      onClose={() => dispatch(setChooseAccountVisible(false))}
    >
      <Box
        pt="0"
        sx={{
          border: "1px solid #1A2835",
          backgroundColor: "#0A131B",
          width: "6.04rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex flex-col items-stretch px-[.4rem] relative">
          <div
            className="absolute right-[.16rem] top-[.16rem] cursor-pointer"
            onClick={() => dispatch(setChooseAccountVisible(false))}
          >
            <Icomoon icon="close" size="0.24rem" color="#5B6872" />
          </div>

          <div className="text-center mt-[0.56rem] text-white font-[500] text-[.32rem]">
            Change Polkadot Address
          </div>

          <div
            className={classNames(
              "py-[.32rem] max-h-[5rem] overflow-auto",
              commonStyles["hide-scrollbar"]
            )}
          >
            {polkadotExtensionAccounts.map((account) => (
              <div key={account.address} className="flex items-center">
                <div className="w-[.24rem] min-w-[.24rem]">
                  {account.address === polkadotAccount ? (
                    <Icomoon icon="active" size=".24rem" />
                  ) : (
                    <div className="border-[1px] border-solid rounded-full border-white/50 w-[.24rem] h-[.24rem]" />
                  )}
                </div>

                <Card
                  onClick={() => changeAccount(account.address)}
                  sx={{
                    borderRadius: ".16rem",
                    border:
                      account.address === polkadotAccount
                        ? "1px solid rgba(0, 243, 171, 0.5)"
                        : "1px solid rgba(157, 175, 190, 0.2)",
                    margin: ".2rem 0 .2rem .24rem",
                    padding: ".24rem",
                    backgroundColor:
                      account.address === polkadotAccount
                        ? "rgba(0, 243, 171, 0.1)"
                        : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div
                      className={classNames(
                        "flex justify-between",
                        account.address === polkadotAccount
                          ? "text-primary"
                          : "text-white"
                      )}
                    >
                      <div className="flex items-center">
                        <div className="w-[.28rem] h-[.28rem] relative mr-[.16rem]">
                          <Image
                            src={defaultAvatar}
                            alt="avatar"
                            layout="fill"
                          />
                        </div>
                        <div className="text-[.28rem]">
                          {account.meta?.name}
                        </div>
                      </div>
                      <div className="text-[.22rem]">{account.balance}</div>
                    </div>
                    <div className="text-text2 text-[.16rem] break-all mt-[.2rem]">
                      {account.address}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-text2 text-[.16rem] leading-tight hidden">
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
