import { Box, Card, Modal } from "@mui/material";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { usePolkadotApi } from "hooks/usePolkadotApi";
import { useWalletAccount } from "hooks/useWalletAccount";
import { useEffect } from "react";
import { setChooseAccountVisible } from "redux/reducers/FisSlice";
import {
  setPolkadotAccount,
  updatePolkadotExtensionAccountsBalances,
} from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";

interface Props {}

export const ChooseFisAccountModal = (props: Props) => {
  const { api } = usePolkadotApi();
  const dispatch = useAppDispatch();

  const { chooseAccountVisible } = useAppSelector((state: RootState) => {
    return {
      chooseAccountVisible: state.fis.chooseAccountVisible,
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
            onClick={() => dispatch(setChooseAccountVisible(false))}
          >
            <Icomoon icon="close" size="0.24rem" color="#5B6872" />
          </div>

          <div className="text-center mt-[0.56rem] text-white font-[700] text-[.42rem]">
            Change Polkadot Address
          </div>

          <div className="text-center text-[.16rem] text-text1 mt-[.24rem]">
            Connect following wallets below to stake your tokens
          </div>

          <div className="py-[.32rem]">
            {polkadotExtensionAccounts.map((account) => (
              <Card
                key={account.address}
                onClick={() => changeAccount(account.address)}
                sx={{
                  border:
                    account.address === polkadotAccount
                      ? "1px solid #00F3AB"
                      : "1px solid #1A2835",
                  margin: ".2rem 0",
                  padding: ".16rem",
                  backgroundColor:
                    account.address === polkadotAccount ? "#163a3e" : "#0A131B",
                  height: "1rem",
                }}
              >
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between text-[.18rem] text-white">
                    <div>{account.meta?.name}</div>
                    <div>{account.balance}</div>
                  </div>
                  <div className="text-text1 text-[.16rem]">
                    {account.address}
                  </div>
                </div>
              </Card>
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
