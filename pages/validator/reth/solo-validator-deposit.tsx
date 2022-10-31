import classNames from "classnames";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { CollapseCard } from "components/common/CollapseCard";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { ConfirmModal } from "components/modal/ConfirmModal";
import { ValidatorKeyUpload } from "components/reth/upload";
import { getStafiLightNodeAbi } from "config/abi";
import { getApiHost, isDev } from "config/env";
import {
  getMetamaskValidatorChainId,
  getStafiEthContractConfig,
  getStafiEthWithdrawalCredentials,
} from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useEthPoolData } from "hooks/useEthPoolData";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import ethToken from "public/eth_token.svg";
import ethTokenOval from "public/eth_token_oval.svg";
import leftArrowIcon from "public/icon_arrow_left.png";
import closeIcon from "public/icon_close.svg";
import warningIcon from "public/icon_warning.svg";
import nodeNumberCircle from "public/node_number_circle.svg";
import arrowDownPath from "public/path_arrow_down.svg";
import dotLinePath from "public/path_dot_line.svg";
import rectangle from "public/rectangle_h.svg";
import uploadIcon from "public/upload.svg";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  handleEthValidatorDeposit,
  updateEthBalance,
} from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import styles from "styles/reth/SoloValidatorDeposit.module.scss";
import { openLink } from "utils/common";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { connectMetaMask, createWeb3 } from "utils/web3Utils";
import Web3 from "web3";

const SoloValidatorDeposit = () => {
  const { setNavigation, isWrongMetaMaskNetwork } = useContext(MyLayoutContext);
  const router = useRouter();
  const { useAccount, useChainId, useProvider } = hooks;
  const account = useAccount();
  const chainId = useChainId();
  const provider = useProvider();
  const dispatch = useAppDispatch();
  const [validatorKeys, setValidatorKeys] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const { unmatchedEth, validatorApr } = useEthPoolData();
  const [showWarning, setShowWarning] = useState(true);
  const [gasPrice, setGasPrice] = useState("--");
  const [depositFee, setDepositFee] = useState("--");
  const [stakeFee, setStakeFee] = useState("--");
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] =
    useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);

  const { ethTxLoading } = useAppSelector((state: RootState) => {
    return {
      ethTxLoading: state.eth.txLoading,
    };
  });

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/validator/reth/token-stake" },
      { name: "New Deposit", path: "/validator/reth/choose-validator" },
      { name: "Solo Validator Deposit" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    (async () => {
      const response = await fetch(`${getApiHost()}/reth/v1/gasPrice`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        setGasPrice(
          Number(resJson.data?.baseFee) + Number(resJson.data?.priorityFee) + ""
        );
      }
    })();
  }, []);

  const estimateFee = useCallback(async () => {
    if (
      !validatorKeys ||
      validatorKeys.length === 0 ||
      isNaN(Number(gasPrice))
    ) {
      setShowInsufficientFunds(false);
      return;
    }
    const ethContractConfig = getStafiEthContractConfig();

    const pubkeys: string[] = [];
    const signatures: string[] = [];
    const depositDataRoots: string[] = [];

    validatorKeys.forEach((validatorKey) => {
      pubkeys.push("0x" + validatorKey.pubkey);
      signatures.push("0x" + validatorKey.signature);
      depositDataRoots.push("0x" + validatorKey.deposit_data_root);
    });

    const web3 = createWeb3();
    const contract = new web3.eth.Contract(
      getStafiLightNodeAbi(),
      ethContractConfig.stafiLightNode
    );

    try {
      const estimateSoloDepositGas = await contract.methods
        .deposit(pubkeys, signatures, depositDataRoots)
        .estimateGas({
          from: account,
          value: Web3.utils.toWei(4 * validatorKeys.length + ""),
        });

      // console.log("estimateSoloDepositGas", estimateSoloDepositGas);

      const trustDepositFee = Web3.utils
        .toBN(estimateSoloDepositGas)
        .mul(Web3.utils.toBN(gasPrice));

      const trustDepositFeeEth = Web3.utils.fromWei(trustDepositFee, "gwei");
      // console.log("soloDepositFeeEth", trustDepositFeeEth);

      setDepositFee(trustDepositFeeEth);

      // setStakeFee(validatorKeys.length * 0.01 + "");
      setStakeFee(
        Web3.utils.fromWei(216485 + 61060 * validatorKeys.length + "", "gwei")
      );
    } catch (err: unknown) {
      if ((err as Error).message.startsWith("err: insufficient funds for")) {
        setShowInsufficientFunds(true);
        setDepositFee(
          Web3.utils.fromWei(
            125895 + 155965 * validatorKeys.length + "",
            "gwei"
          )
        );
        setStakeFee(
          Web3.utils.fromWei(216485 + 61060 * validatorKeys.length + "", "gwei")
        );
      } else {
        snackbarUtil.error((err as Error).message);
      }
    }
  }, [validatorKeys, account, gasPrice]);

  useEffect(() => {
    estimateFee();
  }, [estimateFee]);

  return (
    <div>
      <Card background="#0A131B">
        <div className="flex flex-col items-stretch px-[.56rem] pb-[.56rem]">
          <div className="self-center relative w-[2.4rem] h-[.9rem]">
            <Image src={rectangle} layout="fill" alt="rectangle" />
          </div>

          <div className="text-center mt-[0rem] text-white font-[700] text-[.42rem]">
            Deposit
          </div>

          <CollapseCard
            mt=".76rem"
            background="rgba(26, 40, 53, 0.2)"
            title={
              <div className="flex items-center">
                <div className="text-white text-[.32rem]">Upload Files</div>
                <div
                  className="ml-[.34rem] flex items-center cursor-pointer"
                  onClick={() => {
                    openLink(
                      "https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide#2.-use-deposit-cli-to-generate-a-key-file"
                    );
                  }}
                >
                  <div className=" text-text2 text-[.24rem]">Instruction</div>
                  <div className="ml-[.09rem] flex items-center">
                    <Icomoon icon="right" size="0.18rem" color={"#5B6872"} />
                  </div>
                </div>
              </div>
            }
          >
            <div className="flex flex-col items-center">
              <div className="mt-[.4rem] flex items-center justify-center">
                <div className="text-primary font-[700] text-[.24rem]">
                  {formatNumber(unmatchedEth)} ETH
                </div>
                <div className="ml-[.1rem] text-text1 text-[.24rem]">
                  is waiting to be staked
                </div>
                <Link href="/validator/reth/pool-data">
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
                        setDeleteConfirmModalVisible(true);
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
                        throw new Error(
                          "Please use solo validator file to deposit"
                        );
                      }
                      if (
                        validatorKey.withdrawal_credentials !==
                        getStafiEthWithdrawalCredentials()
                      ) {
                        throw new Error(
                          `Incorrect withdrawal_credentials value`
                        );
                      }
                      const networkName = isDev() ? "goerli" : "mainnet";
                      if (validatorKey.eth2_network_name !== networkName) {
                        throw new Error(
                          `Please use ${networkName} validator file to deposit`
                        );
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
            </div>
          </CollapseCard>

          <Card mt=".56rem" background="rgba(26, 40, 53, 0.2)">
            <div className="p-[.56rem] pb-[.76rem]">
              <div className="text-white text-[.32rem]">Deposit ETH</div>

              <div className="ml-[.35rem] mt-[.75rem] flex items-center">
                <div className="relative w-[.76rem] h-[.76rem]">
                  <Image src={ethTokenOval} layout="fill" alt="eth" />
                </div>

                <div className="ml-[.34rem] text-[.24rem] text-text1">
                  4 ETH for each contract needs to be deposited
                </div>
              </div>

              <div className="mt-[.06rem] ml-[.72rem] relative w-[.01rem] h-[.66rem]">
                <Image src={dotLinePath} layout="fill" alt="path" />
              </div>

              <div className="mt-[.06rem] ml-[.35rem] flex items-center">
                <div className="relative w-[.76rem] h-[.76rem]">
                  <Image src={nodeNumberCircle} layout="fill" alt="eth" />
                </div>

                <div className="ml-[.34rem] text-[.24rem] text-text1">
                  {validatorKeys.length > 0 ? validatorKeys.length : "--"} Node
                  Number according to your file uploaded
                </div>
              </div>

              <div className="mt-[.06rem] ml-[.72rem] relative w-[.01rem] h-[.66rem]">
                <Image src={arrowDownPath} layout="fill" alt="path" />
              </div>

              <div className="mt-[.06rem] ml-[.35rem] flex items-center">
                <div className="relative w-[.76rem] h-[.76rem]">
                  <Image src={ethToken} layout="fill" alt="eth" />
                </div>

                <div className="ml-[.34rem] flex items-center">
                  <div className="text-[.32rem] text-primary">
                    {validatorKeys.length > 0 ? validatorKeys.length * 4 : "--"}{" "}
                    ETH needed overall
                  </div>

                  <div
                    className="ml-[.24rem] rounded-[.16rem] h-[.57rem] px-[.16rem] flex items-center text-[.24rem] text-text2"
                    style={{ border: "1px solid rgba(0, 243, 171, 0.2)" }}
                  >
                    <MyTooltip
                      text="Estimated APR"
                      title="Validator APR: current network OV(s) annualized rewards. APR is denominated in terms of rETH, not USD and is not a guaranteed or promised return or profit."
                    />
                    <div className="ml-[.16rem] text-[.28rem] font-[700] text-primary">
                      {formatNumber(validatorApr, { decimals: 2 })}%
                    </div>
                  </div>
                </div>
              </div>

              {showWarning && (
                <div className={classNames(styles["warning-container"])}>
                  <div
                    className="absolute w-[.22rem] h-[.22rem] right-[.16rem] top-[.16rem] cursor-pointer"
                    onClick={() => setShowWarning(false)}
                  >
                    <Image src={closeIcon} layout="fill" alt="close" />
                  </div>

                  <div className="relative w-[.24rem] h-[.24rem] min-w-[.24rem]">
                    <Image src={warningIcon} layout="fill" alt="warning" />
                  </div>

                  <div className="ml-[.12rem] text-[.2rem] font-[400] text-warning">
                    For any reason, if the ETH you staked is not being matched,
                    you can only withdraw it when Ethereum launches the withdraw
                    function, since your ETH will be sent to Ethereum once you
                    deposit successfully.
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div
            className={classNames("mt-[.76rem] flex items-center", {
              invisible: !validatorKeys.length || !account,
            })}
          >
            <div className="text-[.32rem] text-primary">
              Est. total Fee:{" "}
              {isNaN(Number(depositFee)) || isNaN(Number(stakeFee))
                ? "--"
                : formatNumber(Number(depositFee) + Number(stakeFee))}
              ETH (Gwei {gasPrice})
            </div>
            <div className="ml-[.32rem] text-[.24rem] text-text1">
              Deposit Fee: {formatNumber(depositFee)}ETH + Stake Fee:{" "}
              {formatNumber(stakeFee)}ETH
            </div>
          </div>

          <Button
            disabled={
              (!!account && validatorKeys.length === 0) ||
              ethTxLoading ||
              showInsufficientFunds
            }
            mt=".32rem"
            height="1.3rem"
            onClick={() => {
              if (!account || isWrongMetaMaskNetwork) {
                connectMetaMask(getMetamaskValidatorChainId());
                return;
              }

              dispatch(
                handleEthValidatorDeposit(
                  account,
                  validatorKeys,
                  "solo",
                  (success, result) => {
                    dispatch(updateEthBalance(provider));
                    if (success) {
                      const pubkeys: string[] = [];

                      validatorKeys.forEach((validatorKey) => {
                        pubkeys.push("0x" + validatorKey.pubkey);
                      });

                      router.push(
                        {
                          pathname: "/validator/reth/check-deposit-file",
                          query: {
                            pubkeys,
                            type: "solo",
                            txHash: result?.transactionHash,
                          },
                        },
                        "/validator/reth/check-deposit-file"
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
              : ethTxLoading
              ? "Depositing, please wait for a moment..."
              : showInsufficientFunds
              ? "Insufficient Funds"
              : "Deposit"}
          </Button>
        </div>
      </Card>

      <ConfirmModal
        visible={deleteConfirmModalVisible}
        content={`Sure want to delete this file?`}
        confirmText="Yes, Delete"
        onClose={() => setDeleteConfirmModalVisible(false)}
        onConfirm={() => {
          setValidatorKeys([]);
          setFileName("");
          setDeleteConfirmModalVisible(false);
        }}
      />
    </div>
  );
};

SoloValidatorDeposit.getLayout = (page: ReactElement) => {
  return <ValidatorLayout>{page}</ValidatorLayout>;
};

export default SoloValidatorDeposit;
