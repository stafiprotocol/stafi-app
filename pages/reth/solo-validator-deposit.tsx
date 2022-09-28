import classNames from "classnames";
import { Button } from "components/button";
import { Card } from "components/card";
import { Icomoon } from "components/Icomoon";
import { RethLayout } from "components/layout_reth";
import { ValidatorKeyUpload } from "components/reth/upload";
import { getMetamaskChainId } from "config/eth";
import { hooks, metaMask } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import { useRouter } from "next/router";
import ethToken from "public/eth_token.svg";
import leftArrowIcon from "public/icon_arrow_left.png";
import closeIcon from "public/icon_close.svg";
import downIcon from "public/icon_down.png";
import warningIcon from "public/icon_warning.svg";
import rectangle from "public/rectangle1.svg";
import uploadIcon from "public/upload.svg";
import { ReactElement, useState } from "react";
import { handleEthDeposit } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { getShortAddress } from "utils/string";
import styles from "../../styles/reth/SoloValidatorDeposit.module.scss";

const SoloValidatorDeposit = () => {
  const router = useRouter();
  const { useAccount, useChainId } = hooks;
  const account = useAccount();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const [validatorKeys, setValidatorKeys] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const { ethTxLoading } = useAppSelector((state: RootState) => {
    return {
      ethTxLoading: state.eth.txLoading,
    };
  });

  return (
    <div className="pt-[.56rem]">
      <div
        className="inline-flex items-center cursor-pointer"
        onClick={() => {
          router.push("/rtoken");
        }}
      >
        <div className="w-[.27rem] h-[.18rem] relative">
          <Image src={leftArrowIcon} layout="fill" alt="back" />
        </div>

        <div className="ml-[.16rem] text-link text-[.32rem]">rToken List</div>
      </div>

      <Card mt=".56rem">
        <div className="flex flex-col items-stretch px-[.56rem]">
          <div className="self-center relative w-[2.4rem] h-[.9rem]">
            <Image src={rectangle} layout="fill" alt="rectangle" />
          </div>

          <div className="text-center mt-[.3rem] text-white font-[700] text-[.42rem]">
            Deposit
          </div>

          <div className="mt-[.3rem] flex items-center justify-center">
            <div className="text-primary font-[700] text-[.24rem]">
              23.344 ETH
            </div>
            <div className="ml-[.1rem] text-text1 text-[.24rem]">
              is waiting to be staked
            </div>
            <div className="ml-[.16rem] text-primary text-[.24rem]">
              check pool status
            </div>

            <div className="ml-[.16rem] w-[.27rem] h-[.18rem] relative rotate-180">
              <Image src={leftArrowIcon} layout="fill" alt="back" />
            </div>
          </div>

          <Card mt=".56rem" backgroundColor="#1A283532">
            <div className="p-[.56rem]">
              <div className="text-white text-[.32rem]">Deposit ETH</div>

              <div className="mt-[.67rem] text-text1 text-[.24rem]">
                Choose Deposit Amount for each contract
              </div>

              <div
                className={classNames(styles["row-container"], "mt-[.35rem]")}
              >
                <div className="flex items-center">
                  <div className="ml-[.35rem] relative w-[.76rem] h-[.76rem]">
                    <Image src={ethToken} layout="fill" alt="eth" />
                  </div>

                  <div className="ml-[.35rem] text-white text-[.32rem] font-[700]">
                    4 ETH
                  </div>
                </div>

                <div className={styles["select-icon-container"]}>
                  <div className="w-[.19rem] h-[0.1rem] relative">
                    <Image src={downIcon} layout="fill" alt="down" />
                  </div>
                </div>
              </div>

              <div className="mt-[.56rem] text-text1 text-[.24rem]">
                Input Node Number
              </div>

              <div
                className={classNames(styles["row-container"], "mt-[.35rem]")}
              >
                <div className="flex items-center">
                  <div className="ml-[.35rem] relative w-[.76rem] h-[.76rem]">
                    <Image src={ethToken} layout="fill" alt="eth" />
                  </div>

                  <div className="ml-[.35rem] text-white text-[.32rem] font-[700]">
                    2
                  </div>
                </div>
              </div>

              <div className="flex mt-[.8rem]">
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="text-[.24rem] text-text2">
                      Total ETH Needed
                    </div>
                    <div className="ml-[.06rem] flex items-center">
                      <Icomoon
                        icon="question"
                        size="0.16rem"
                        color={"#5B6872"}
                      />
                    </div>
                  </div>

                  <div className="mt-[.23rem] font-[700] text-[.28rem] text-primary">
                    12 ETH
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="text-[.24rem] text-text2">
                      Estimated APR
                    </div>
                    <div className="ml-[.06rem] flex items-center">
                      <Icomoon
                        icon="question"
                        size="0.16rem"
                        color={"#5B6872"}
                      />
                    </div>
                  </div>

                  <div className="mt-[.23rem] font-[700] text-[.28rem] text-primary">
                    12 ETH
                  </div>
                </div>
              </div>

              <div className={styles["warning-container"]}>
                <div className="absolute w-[.22rem] h-[.22rem] right-[.16rem] top-[.16rem] cursor-pointer">
                  <Image src={closeIcon} layout="fill" alt="close" />
                </div>

                <div className="relative w-[.24rem] h-[.24rem] min-w-[.24rem]">
                  <Image src={warningIcon} layout="fill" alt="warning" />
                </div>

                <div className="ml-[.12rem] text-[.2rem] font-[400] text-warning">
                  For any reason, if the ETH you staked is not being matched all
                  the time, you can only withdraw it until Ethereum launch the
                  withdraw function, since your ETH will be sent to Ethereum
                  once you deposit successfully.
                </div>
              </div>
            </div>
          </Card>

          <Card mt=".76rem" backgroundColor="#1A283532">
            <div className="p-[.56rem] flex flex-col items-center">
              <div className="self-stretch flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-white text-[.32rem]">Upload Files</div>
                  <div className="ml-[.34rem] text-text2 text-[.24rem]">
                    Instruction
                  </div>
                  <div className="ml-[.09rem]">
                    <Icomoon icon="right" size="0.18rem" color={"#5B6872"} />
                  </div>
                </div>

                <div className="w-[.19rem] h-[0.1rem] relative">
                  <Image src={downIcon} layout="fill" alt="down" />
                </div>
              </div>

              <div className="mt-[.8rem] flex items-center justify-center">
                <div className="text-primary font-[700] text-[.24rem]">
                  23.344 ETH
                </div>
                <div className="ml-[.1rem] text-text1 text-[.24rem]">
                  is waiting to be staked
                </div>
                <div className="ml-[.16rem] text-primary text-[.24rem]">
                  check pool status
                </div>

                <div className="ml-[.16rem] w-[.27rem] h-[.18rem] relative rotate-180">
                  <Image src={leftArrowIcon} layout="fill" alt="back" />
                </div>
              </div>

              <div className="mt-[0.77rem] h-[2rem] self-stretch">
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
                      if (validatorKey.amount !== 4000000000) {
                        throw new Error("Deposit amount must be 4");
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

              <div className="mt-[.32rem] mb-[.3rem] text-[.24rem] text-text1">
                Please follow the
                <a
                  className="text-link underline mx-[.06rem]"
                  href="https://www.google.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  instruction
                </a>
                and combine public keys into single file.
              </div>
            </div>
          </Card>

          <div className="mt-[.76rem] flex items-center">
            <div className="text-[.32rem] text-primary">
              Est. total fee: 0.11ETH (Gwei 200)
            </div>
            <div className="ml-[.32rem] text-[.24rem] text-text1">
              Deposit Fee: 0.08ETH + Stake Fee:0.03
            </div>
          </div>

          <Button
            loading={ethTxLoading}
            disabled={!!account && validatorKeys.length === 0}
            mt=".32rem"
            height="1.3rem"
            onClick={() => {
              if (!account || chainId !== getMetamaskChainId()) {
                metaMask.activate(getMetamaskChainId());
                return;
              }

              dispatch(
                handleEthDeposit(
                  account,
                  validatorKeys,
                  "solo",
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
                            type: "solo",
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
      </Card>
    </div>
  );
};

SoloValidatorDeposit.getLayout = (page: ReactElement) => {
  return <RethLayout>{page}</RethLayout>;
};

export default SoloValidatorDeposit;
