import classNames from "classnames";
import { Button } from "components/button";
import { Icomoon } from "components/Icomoon";
import { hooks } from "connectors/metaMask";
import { EthDepositItem } from "hooks/useEthStakeList";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import ethGreenIcon from "public/eth_type_green.svg";
import ethYellowIcon from "public/eth_type_yellow.svg";
import copyIcon from "public/icon_copy.svg";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import styles from "../../styles/reth/WaitingStakeCard.module.scss";
import commonStyles from "../../styles/Common.module.scss";
import { EthPubkeyDetailModal } from "components/modal/EthPubkeyDetailModal";
import { useState } from "react";
import { MyTooltip } from "components/MyTooltip";

interface WaitingStakeCardProps {
  depositItem: EthDepositItem;
  hasEnoughEth: boolean;
}

export const WaitingStakeCard = (props: WaitingStakeCardProps) => {
  const { useAccount } = hooks;
  const account = useAccount();
  const router = useRouter();
  const { depositItem } = props;
  const [pubkeyDetailModalVisible, setPubkeyDetailModalVisible] =
    useState(false);

  const getStatusDescription = (status: string) => {
    if (status === "2") {
      return "Waiting to be staked";
    }
    if (status === "3") {
      return "Validating";
    }
    if (status === "4") {
      return "Verification Failed";
    }
    if (status === "9") {
      return "Active";
    }
    if (status === "10") {
      return "Exited";
    }
    return "Waiting to be matched";
  };

  const getStatusDescriptionDetail = (status: string) => {
    if (status === "2") {
      return "32 ETH may be matched or not, please click the stake button to confirm and stake";
    }
    if (status === "3") {
      return "32 ETH is successfully staked, deposit now is in the validating process";
    }
    if (status === "4") {
      return "Check file failed";
    }
    if (status === "9") {
      return "Active";
    }
    if (status === "10") {
      return "Exited";
    }
    return "32 ETH is waiting to be staked in Ethereum, please wait for a moment";
  };

  const getStatusText = (status: string) => {
    if (status === "2") {
      return "Matched";
    }
    if (status === "3") {
      return "Staked";
    }
    if (status === "4") {
      return "Failed";
    }
    if (status === "8") {
      return "Waiting";
    }
    if (status === "9") {
      return "Active";
    }
    if (status === "10") {
      return "Exit";
    }
    return "Unmatched";
  };

  return (
    <div className={styles.card}>
      <div className="flex items-center justify-between">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image
            layout="fill"
            alt="icon"
            src={depositItem.type === "solo" ? ethYellowIcon : ethGreenIcon}
          />
        </div>

        <div
          className={classNames(
            commonStyles["gradient-text"],
            "font-bold text-[.4rem]"
          )}
        >
          32 ETH
        </div>
      </div>

      <div className={styles.description}>
        <div className="mr-[.06rem]">
          {getStatusDescription(depositItem.status)}
        </div>
        <MyTooltip
          title={getStatusDescriptionDetail(depositItem.status)}
          color="#ffffff"
        />
      </div>

      <div className="mt-[.24rem] flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-[.06rem] text-text2 text-[.16rem]">
            Stake Amount
          </div>
          <Icomoon icon="question" size="0.16rem" color={"#5B6872"} />
        </div>

        <div className="text-text1 text-[.16rem]">
          {depositItem.type === "solo" ? 4 : 0} ETH (Self)
        </div>
      </div>

      <div
        className={classNames("mt-[.24rem] flex items-center justify-between")}
      >
        <div className="flex items-center">
          <div className="mr-[.06rem] text-text2 text-[.16rem]">Pubkey</div>
          <Icomoon icon="question" size="0.16rem" color={"#5B6872"} />
        </div>

        <div className="text-text1 text-[.16rem]">
          {props.depositItem.pubkey ? (
            <div className="flex items-center">
              <div
                className="w-[.18rem] h-[.20rem] relative cursor-pointer"
                onClick={() => {
                  navigator.clipboard
                    .writeText(props.depositItem.pubkey)
                    .then(() => {
                      snackbarUtil.success("Copied");
                    });
                }}
              >
                <Image layout="fill" alt="icon" src={copyIcon} />
              </div>

              <div
                className="ml-[.12rem] flex items-center cursor-pointer"
                onClick={() => {
                  if (props.depositItem.pubkey) {
                    // router.push(
                    //   `/reth/pubkey-detail/${props.depositItem.pubkey}`
                    // );
                    setPubkeyDetailModalVisible(true);
                  }
                }}
              >
                <div className="mr-[.09rem] text-[.16rem] text-text1">
                  {getShortAddress(props.depositItem.pubkey, 4)}
                </div>

                <Icomoon icon="right" size="0.155rem" color={"#9DAFBE"} />
              </div>
            </div>
          ) : (
            "N/A"
          )}
        </div>
      </div>

      <div
        className="mt-[.24rem] flex items-center justify-between"
        onClick={() => {
          router.push(`/reth/my-data`);
        }}
      >
        <div className="flex items-center">
          <div className="mr-[.06rem] text-text2 text-[.16rem]">Node Addr</div>
          <Icomoon icon="question" size="0.16rem" color={"#5B6872"} />
        </div>

        <div className="ml-[.12rem] flex items-center cursor-pointer">
          <div className="mr-[.09rem] text-[.16rem] text-text1">
            {getShortAddress(account, 4)}
          </div>

          <Icomoon icon="right" size="0.155rem" color={"#9DAFBE"} />
        </div>
      </div>

      <div className="mt-[.24rem] flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-[.06rem] text-text2 text-[.16rem]">Status</div>
          <Icomoon icon="question" size="0.16rem" color={"#5B6872"} />
        </div>

        <div className="text-text1 text-[.16rem]">
          {getStatusText(depositItem.status)}
        </div>
      </div>

      <div
        className={classNames({
          invisible: depositItem.status !== "2" || !props.hasEnoughEth,
        })}
      >
        <Button
          mt=".24rem"
          height=".65rem"
          fontSize=".24rem"
          onClick={() => {
            router.push(
              {
                pathname: "/reth/stake",
                query: {
                  pubkeys: [depositItem.pubkey],
                  depositType: depositItem.type,
                },
              },
              "/reth/stake"
            );
          }}
        >
          Stake
        </Button>
      </div>

      <EthPubkeyDetailModal
        visible={pubkeyDetailModalVisible}
        onClose={() => setPubkeyDetailModalVisible(false)}
        pubkey={props.depositItem.pubkey}
      />
    </div>
  );
};
