import { Button } from "components/button";
import { Icomoon } from "components/Icomoon";
import { ValidatorKeyUpload } from "components/reth/upload";
import { getMetamaskChainId } from "config/eth";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthPoolData } from "hooks/useEthPoolData";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import leftArrowIcon from "public/icon_arrow_left.png";
import closeIcon from "public/icon_close.svg";
import uploadIcon from "public/upload.svg";
import { useEffect, useState } from "react";
import { handleEthDeposit } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { connectMetaMask } from "utils/web3Utils";
import styles from "../../../styles/reth/TrustValidatorDeposit.module.scss";

export const TrustValidatorDepositForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { useAccount, useChainId } = hooks;
  const account = useAccount();
  const chainId = useChainId();
  const [validatorKeys, setValidatorKeys] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const { unmatchedEth } = useEthPoolData();

  const { ethTxLoading } = useAppSelector((state: RootState) => {
    return {
      ethTxLoading: state.eth.txLoading,
    };
  });

  useEffect(() => {
    // metaMask.connectEagerly();
  }, []);

  useEffect(() => {}, [account, chainId]);

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="mt-[.9rem] text-white font-[700] text-[.42rem]">
        Deposit
      </div>

      <div className="mt-[.3rem] flex items-center">
        <div className="text-primary font-[700] text-[.24rem]">
          {formatNumber(unmatchedEth)} ETH
        </div>
        <div className="ml-[.1rem] text-text1 text-[.24rem]">
          is waiting to be staked
        </div>

        <Link href="/reth/pool-data">
          <div className="flex items-center cursor-pointer">
            <div className="ml-[.16rem] text-primary text-[.24rem]">
              check pool status
            </div>

            <div className="ml-[.16rem] w-[.27rem] h-[.18rem] relative rotate-180">
              <Image src={leftArrowIcon} layout="fill" alt="back" />
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-[1.1rem] h-[2rem] self-stretch">
        {validatorKeys.length > 0 && fileName ? (
          <div className={styles["file-container"]}>
            <Icomoon icon="file" size="0.55rem" color="#00F3AB" />
            <div className="ml-[.6rem] text-text1 text-[.24rem]">
              File{" "}
              <span className="text-[#00F3AB]">
                {getShortAddress(fileName, 20)}
              </span>{" "}
              uploaded successfully!
            </div>

            <div
              className="absolute right-[.12rem] top-[.12rem] w-[.22rem] h-[.22rem] cursor-pointer"
              onClick={() => {
                setValidatorKeys([]);
                setFileName("");
              }}
            >
              <Image src={closeIcon} alt="close" layout="fill" />
            </div>
          </div>
        ) : (
          <ValidatorKeyUpload
            checkValidatorKey={(validatorKey) => {
              if (
                !validatorKey.deposit_data_root ||
                !validatorKey.signature ||
                !validatorKey.pubkey
              ) {
                throw new Error(
                  "Miss deposit_data_root or signature or pubkey"
                );
              }
              if (validatorKey.amount !== 1000000000) {
                throw new Error("Deposit amount must be 1");
              }
            }}
            onSuccess={(validatorKeys, fileName) => {
              setValidatorKeys(validatorKeys);
              setFileName(fileName);
            }}
          >
            <div>
              <div className="flex flex-col items-center">
                <div className="w-[1rem] h-[1.22rem] relative">
                  <Image src={uploadIcon} alt="upload" layout="fill" />
                </div>

                <div className="text-text2 text-[.24rem] mt-[.2rem]">
                  Drag and drop file
                </div>
              </div>
            </div>
          </ValidatorKeyUpload>
        )}
      </div>

      <div className="self-stretch mx-[.75rem] mt-[1rem]">
        <Button
          loading={ethTxLoading}
          disabled={!!account && validatorKeys.length === 0}
          height="1.3rem"
          onClick={() => {
            if (!account || chainId !== getMetamaskChainId()) {
              connectMetaMask(metaMask);
              return;
            }

            if (Number(unmatchedEth) < validatorKeys.length) {
              snackbarUtil.error("Insufficient ETH in pool");
              return;
            }

            dispatch(
              handleEthDeposit(
                account,
                validatorKeys,
                "trust",
                (success, result) => {
                  if (success) {
                    const pubkeys: string[] = [];

                    validatorKeys.forEach((validatorKey) => {
                      pubkeys.push("0x" + validatorKey.pubkey);
                    });

                    router.push(
                      {
                        pathname: "/reth/check-file",
                        query: {
                          pubkeys,
                          type: "trust",
                          txHash: result.transactionHash,
                        },
                      },
                      "/reth/check-file"
                    );
                  }
                }
              )
            );
          }}
        >
          {!account
            ? "Connect Wallet"
            : validatorKeys.length === 0
            ? "Please Upload 1 json file"
            : "Deposit"}
        </Button>
      </div>
    </div>
  );
};
