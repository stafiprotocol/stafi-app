import classNames from "classnames";
import { Button } from "components/common/button";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { ConfirmModal } from "components/modal/ConfirmModal";
import { ValidatorKeyUpload } from "components/reth/upload";
import { isDev } from "config/env";
import { getMetamaskValidatorChainId } from "config/metaMask";
import { getEthValidatorWithdrawalCredentials } from "config/erc20Contract";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthPoolData } from "hooks/useEthPoolData";
import { useWalletAccount } from "hooks/useWalletAccount";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  handleEthValidatorStake,
  updateEthBalance,
} from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { connectMetaMask } from "utils/web3Utils";

export const StakeForm = () => {
  const { isWrongMetaMaskNetwork } = useContext(MyLayoutContext);
  const router = useRouter();
  const { depositType } = router.query;
  const dispatch = useAppDispatch();
  const [validatorKeys, setValidatorKeys] = useState<any[]>([]);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] =
    useState(false);
  const { unmatchedEth } = useEthPoolData();

  const { metaMaskAccount } = useWalletAccount();

  const { ethTxLoading } = useAppSelector((state: RootState) => {
    return {
      ethTxLoading: state.eth.txLoading,
    };
  });

  useEffect(() => {
    const { pubkeys, depositType } = router.query;
    if (
      !pubkeys ||
      (Array.isArray(pubkeys) && pubkeys.length === 0) ||
      (depositType !== "solo" && depositType !== "trusted")
    ) {
      router.push("/validator/reth/token-stake");
    }
  }, [router]);

  const stakePubkeys = useMemo(() => {
    const { pubkeys } = router.query;
    if (!Array.isArray(pubkeys)) {
      return [pubkeys];
    }
    return pubkeys;
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="mt-[.9rem] text-white font-[700] text-[.42rem]">
        Stake
      </div>

      <div className="mt-[.3rem] flex items-center text-text1 text-[.24rem]">
        Please follow the instruction and upload {stakePubkeys.length}{" "}
        {stakePubkeys.length <= 1 ? "Pubkey" : "Pubkeys"}
      </div>

      <ValidatorKeyUpload
        disabled={stakePubkeys.length === validatorKeys.length}
        mt="1rem"
        checkValidatorKey={(validatorKey) => {
          if (
            !validatorKey.deposit_data_root ||
            !validatorKey.signature ||
            !validatorKey.pubkey
          ) {
            throw new Error("Miss deposit_data_root or signature or pubkey");
          }
          if (
            depositType === "trusted" &&
            validatorKey.amount !== 31000000000
          ) {
            throw new Error("Please use trusted validator file to stake");
          } else if (
            depositType === "solo" &&
            validatorKey.amount !== 28000000000
          ) {
            throw new Error("Please use solo validator file to stake");
          }
          if (
            validatorKey.withdrawal_credentials !==
            getEthValidatorWithdrawalCredentials()
          ) {
            throw new Error(`Incorrect withdrawal_credentials value`);
          }
          const networkName = isDev() ? "goerli" : "mainnet";
          if (validatorKey.eth2_network_name !== networkName) {
            throw new Error(
              `Please use ${networkName} validator file to deposit`
            );
          }
        }}
        onSuccess={(newValidatorKeys) => {
          const oldValidatorKeys = [...validatorKeys];
          let hasUnmatched = false;
          newValidatorKeys.forEach((validatorKey) => {
            if (stakePubkeys.indexOf("0x" + validatorKey.pubkey) < 0) {
              hasUnmatched = true;
              return;
            }
            const exist = oldValidatorKeys.find(
              (item) => item.pubkey === validatorKey.pubkey
            );
            if (!exist) {
              oldValidatorKeys.push(validatorKey);
            }
          });

          setValidatorKeys([...oldValidatorKeys]);
          if (hasUnmatched) {
            snackbarUtil.error("Unmatched Pubkey");
          }
        }}
      >
        <div>
          <div
            className={classNames(
              "flex items-center justify-center rounded-[.16rem] bg-primary w-[3.64rem] h-[.84rem]",
              stakePubkeys.length === validatorKeys.length
                ? "bg-[#1A2835] cursor-default text-text2"
                : "bg-primary cursor-pointer text-[#1A2835]"
            )}
          >
            <Icomoon
              icon="save"
              size="0.24rem"
              color={
                stakePubkeys.length === validatorKeys.length
                  ? "#5B6872"
                  : "#1A2835"
              }
            />

            <div className="ml-[.17rem] text-[.28rem] font-[700]">
              Upload {stakePubkeys.length - validatorKeys.length}{" "}
              {stakePubkeys.length - validatorKeys.length <= 1
                ? "Pubkey"
                : "Pubkeys"}
            </div>
          </div>
        </div>
      </ValidatorKeyUpload>

      <div className="min-h-[2.7rem] max-h-[4.8rem] overflow-auto pt-[.2rem] pb-[.5rem]">
        <div
          className={classNames(
            { hidden: validatorKeys.length === 0 },
            "mt-[.56rem]"
          )}
          style={{ background: "rgba(26, 40, 53, 0.5)" }}
        >
          <div
            className="w-[9.3rem] h-[.84rem] pl-[.36rem] pr-[.56rem] rounded-[.12rem] flex items-center justify-between"
            style={{ background: "rgba(0, 243, 171, 0.1)" }}
          >
            <div className="text-primary font-[700] text-[.28rem]">
              {validatorKeys.length} Uploaded
            </div>

            <div
              className="cursor-pointer"
              onClick={() => {
                setDeleteConfirmModalVisible(true);
              }}
            >
              <Icomoon icon="delete" size=".32rem" />
            </div>
          </div>

          <div className="pt-[.36rem] pb-[.12rem] px-[.32rem]">
            {validatorKeys.map((item) => (
              <div
                key={item.pubkey}
                className="h-[.84rem] pl-[.24rem] pr-[.32rem] rounded-[.12rem] flex items-center justify-between bg-[#1A2835] mb-[.24rem]"
              >
                <div className="text-text1 text-[.28rem]">
                  0x{getShortAddress(item.pubkey, 20)}
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setValidatorKeys(
                      validatorKeys.filter(
                        (validatorKey) => validatorKey.pubkey !== item.pubkey
                      )
                    );
                  }}
                >
                  <Icomoon icon="delete" size=".32rem" color="#9DAFBE" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="self-stretch mx-[.75rem] mt-[.1rem]">
        <Button
          loading={ethTxLoading}
          disabled={
            !!metaMaskAccount && validatorKeys.length < stakePubkeys.length
          }
          height="1.3rem"
          onClick={() => {
            if (!metaMaskAccount || isWrongMetaMaskNetwork) {
              connectMetaMask(getMetamaskValidatorChainId());
              return;
            }
            if (
              depositType === "solo" &&
              Number(unmatchedEth) < validatorKeys.length * 28
            ) {
              snackbarUtil.error("Insufficient ETH in pool");
              return;
            }
            if (
              depositType === "trusted" &&
              Number(unmatchedEth) < validatorKeys.length * 31
            ) {
              snackbarUtil.error("Insufficient ETH in pool");
              return;
            }

            dispatch(
              handleEthValidatorStake(
                metaMaskAccount,
                validatorKeys,
                depositType as "solo" | "trusted",
                (success, result) => {
                  dispatch(updateEthBalance());
                  if (success) {
                    router.push("/validator/reth/token-stake");
                  }
                }
              )
            );
          }}
        >
          {!metaMaskAccount
            ? "Connect Wallet"
            : validatorKeys.length < stakePubkeys.length
            ? `Please Upload ${stakePubkeys.length} ${
                stakePubkeys.length <= 1 ? "Pubkey" : "Pubkeys"
              }`
            : `Stake (${validatorKeys.length} Uploaded)`}
        </Button>
      </div>

      <ConfirmModal
        visible={deleteConfirmModalVisible}
        content={`Sure want to delete all of those ${validatorKeys.length} ${
          validatorKeys.length <= 1 ? "Pubkey" : "Pubkeys"
        }`}
        confirmText="Yes, Delete"
        onClose={() => setDeleteConfirmModalVisible(false)}
        onConfirm={() => {
          setValidatorKeys([]);
          setDeleteConfirmModalVisible(false);
        }}
      />
    </div>
  );
};
