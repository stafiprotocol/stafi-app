import classNames from "classnames";
import { Button } from "components/common/button";
import { Icomoon } from "components/icon/Icomoon";
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
import commonStyles from "../../styles/Common.module.scss";
import { EthPubkeyDetailModal } from "components/modal/EthPubkeyDetailModal";
import { useState } from "react";
import { MyTooltip } from "components/common/MyTooltip";
import styles from "../../styles/reth/WaitingStakeCard.module.scss";
import { openLink } from "utils/common";

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
    if (status === "3" || status === "8" || status === "20") {
      return "Waiting in the queue";
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
    if (status === "3" || status === "8" || status === "20") {
      return "32 ETH is waiting to be staked in Ethereum, please wait for a moment";
    }
    if (status === "4") {
      return "Your deposit/stake was failed because of the invalid file";
    }
    if (status === "9") {
      return "Your node is active now";
    }
    if (status === "10") {
      return "Exited";
    }
    return "32 ETH is waiting to be matched, please wait for a moment";
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
    if (status === "8" || status === "20") {
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

      <div
        className={styles.description}
        style={{
          backgroundColor:
            depositItem.status === "9" ? "rgba(0, 243, 171, 0.1)" : "#55362a",
        }}
      >
        <MyTooltip
          title={getStatusDescriptionDetail(depositItem.status)}
          text={getStatusDescription(depositItem.status)}
          color="#ffffff"
        />
      </div>

      <div className="mt-[.24rem] flex items-center justify-between">
        <div className="flex items-center text-text2 text-[.16rem]">
          <MyTooltip
            text="Stake Amount"
            title="The combination of your ETH stake amount and user delegated "
          />
        </div>

        <div className="text-text1 text-[.16rem]">
          {depositItem.type === "solo" ? 4 : 0} ETH (Self)
        </div>
      </div>

      <div
        className={classNames("mt-[.24rem] flex items-center justify-between")}
      >
        <div className="flex items-center text-text2 text-[.16rem]">
          <MyTooltip text="Pubkey" title="Your validator public key address" />
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
          router.push(`/validator/reth/my-data`);
        }}
      >
        <div className="flex items-center text-text2 text-[.16rem]">
          <MyTooltip title="Your Ethereum account" text="Node Addr" />
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
          <div
            className="cursor-pointer"
            onClick={() =>
              openLink(
                "https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide"
              )
            }
          >
            <Icomoon icon="question" size="0.16rem" color={"#5B6872"} />
          </div>
        </div>

        <div className="text-text1 text-[.16rem]">
          {getStatusText(depositItem.status)}
        </div>
      </div>

      <div
        className={classNames({
          hidden: depositItem.status !== "2" || !props.hasEnoughEth,
        })}
      >
        <Button
          mt=".24rem"
          height=".65rem"
          fontSize=".24rem"
          onClick={() => {
            router.push(
              {
                pathname: "/validator/reth/stake",
                query: {
                  pubkeys: [depositItem.pubkey],
                  depositType: depositItem.type,
                },
              },
              "/validator/reth/stake"
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
