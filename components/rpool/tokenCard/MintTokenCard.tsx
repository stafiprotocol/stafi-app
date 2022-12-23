import { Button } from "components/common/button";
import Image from "next/image";
import ethLogo from "public/eth_type_black.svg";
import maticLogo from "public/matic_type_black.png";
import { RTokenName, TokenStandard, WalletType } from "interfaces/common";
import { MyTooltip } from "components/common/MyTooltip";
import { formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";
import { formatDuration } from "utils/time";
import { AllListItem } from "../tokenList/LiveList";
import { useContext, useEffect, useMemo, useState } from "react";
import { MyLayoutContext } from "components/layout/layout";
import { rTokenNameToTokenName } from "utils/rToken";
import { useRouter } from "next/router";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import downIcon from "public/icon_down.png";
import { Icomoon } from "components/icon/Icomoon";
import classNames from "classnames";
import RPoolMintClaimModal from "components/modal/RPoolMintClaimModal";
import { useWalletAccount } from "hooks/useWalletAccount";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RootState } from "redux/store";
import { connectMetaMask } from "redux/reducers/WalletSlice";
import {
  getMetamaskEthChainId,
  getMetamaskMaticChainId,
} from "config/metaMask";
import { getPools, updateMaticBalance } from "redux/reducers/MaticSlice";
import { RTokenRedeemModal } from "components/modal/RTokenRedeemModal";

interface Props {
  data: AllListItem;
}

const MintTokenCard = (props: Props) => {
  const { data } = props;

  const dispatch = useAppDispatch();

  const router = useRouter();

  const { walletNotConnected } = useContext(MyLayoutContext);
  const { polkadotAccount, metaMaskAccount } = useWalletAccount();
  // todo: tokenStandard
  const rTokenBalance = useRTokenBalance(
    TokenStandard.Native,
    rTokenNameToTokenName(data.rToken)
  );

  const balance = useAppSelector((state: RootState) => {
    if (data.rToken === RTokenName.rETH) {
      return state.eth.balance;
    }
    if (data.rToken === RTokenName.rMATIC) {
      return state.matic.balance;
    }
  });

  const [showMore, setShowMore] = useState<boolean>(false);
  const [claimModalVisible, setClaimModalVisible] = useState<boolean>(false);
  const [stakeModalVisible, setStakeModalVisible] = useState<boolean>(false);
  const [unstakeModalVisible, setUnstakeModalVisible] =
    useState<boolean>(false);

  const isBalanceValid = useMemo(() => {
    return !isNaN(Number(rTokenBalance)) && Number(rTokenBalance) > 0;
  }, [rTokenBalance]);

  const getRTokenLogo = (rTokenName: RTokenName) => {
    if (rTokenName === RTokenName.rMATIC) return maticLogo;
    if (rTokenName === RTokenName.rETH) return ethLogo;
    return ethLogo;
  };

  const closeClaimModal = () => {
    setClaimModalVisible(false);
  };

  const onClickConnectWallet = () => {
    if (data.rToken === RTokenName.rETH) {
      dispatch(connectMetaMask(getMetamaskEthChainId()));
    } else if (data.rToken === RTokenName.rMATIC) {
      dispatch(connectMetaMask(getMetamaskMaticChainId()));
    }
  };

  const onClickMint = () => {
    if (walletNotConnected || !metaMaskAccount || !polkadotAccount) {
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: [WalletType.MetaMask, WalletType.Polkadot],
          targetUrl: "/rpool",
        })
      );
    } else {
      if (data.rToken === RTokenName.rMATIC) {
        dispatch(getPools());
      }
      setStakeModalVisible(true);
    }
  };

  const onClickClaim = () => {
    if (walletNotConnected || !metaMaskAccount || !polkadotAccount) {
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: [WalletType.MetaMask, WalletType.Polkadot],
          targetUrl: "/rpool",
        })
      );
    } else {
      setClaimModalVisible(true);
    }
  };

  const onClickUnstake = () => {
    if (walletNotConnected || !metaMaskAccount || !polkadotAccount) {
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: [WalletType.MetaMask, WalletType.Polkadot],
          targetUrl: "/rpool",
        })
      );
    } else {
      setUnstakeModalVisible(true);
    }
  };

  const getDefaultReceivingAddress = () => {
    if (data.rToken === RTokenName.rMATIC) {
      return polkadotAccount;
    }
    return metaMaskAccount;
  };

  useEffect(() => {
    if (data.rToken === RTokenName.rMATIC) {
      dispatch(updateMaticBalance());
    } else if (data.rToken === RTokenName.rETH) {
    }
  }, [dispatch, data.rToken]);

  return (
    <div
      className="py-[0] px-[.24rem] pb-[.24rem] w-[3.35rem] rounded-[.16rem] bg-[#1a283533] hover:bg-[#58779826]"
      style={{
        border: "1px solid #1a2835",
        backdropFilter: "blur(0.67rem)",
      }}
    >
      <div className="mt-[.36rem] flex items-center justify-between relative">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image src={getRTokenLogo(data.rToken)} layout="fill" alt="logo" />
        </div>

        <div
          className="w-[.38rem] h-[.38rem] absolute left-[.55rem] bottom-[.07rem] rounded-full z-10 p-[.04rem] hidden"
          style={{
            background: "rgba(25, 38, 52, 0.4)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.13rem)",
          }}
        >
          <div className="w-full h-full relative">
            <Image
              src={getRTokenLogo(data.rToken)}
              layout="fill"
              alt="circulate"
            />
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="mt-[.1rem] text-text1 text-[.12rem]">StaFi</div>
          <div className="mt-[.12rem] text-[#FFA540] font-[700] text-[.36rem]">
            {data.rToken}
          </div>
        </div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="APR"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text1 font-[700] text-[.28rem]">{data.apr}</div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Reward"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="flex">
          <div className="text-[.12rem] text-text2 border-[1px] border-[#1A2835] rounded-[.02rem] py-[.02rem] px-[.06rem] mr-[.07rem]">
            FIS
          </div>
          <div className="text-text1 text-[.16rem]">
            {formatNumber(numberUtil.fisAmountToHuman(data.total_reward), {
              decimals: 2,
            })}
          </div>
        </div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Minted Value"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text1 text-[.16rem]">
          ${formatNumber(data.mintedValue, { decimals: 2 })}
        </div>
      </div>

      <div className="text-[#00F3AB] text-[.16rem] text-center mt-[.24rem] leading-[.18rem]">
        {`${formatDuration(data.endTimeStamp - Date.now(), true)} Left`}
      </div>

      <Button
        mt="0.15rem"
        height="0.65rem"
        fontSize="0.24rem"
        onClick={onClickMint}
      >
        Mint
      </Button>

      <div
        className="h-[.65rem] rounded-[.45rem] w-[2.87rem] text-text1 text-[.24rem] flex items-center justify-center cursor-pointer mt-[.24rem]"
        style={{
          border: "1px solid rgba(91, 104, 114, 0.5)",
        }}
        onClick={onClickClaim}
      >
        Claim
      </div>

      {!walletNotConnected || !metaMaskAccount && (
        <div className="text-[.16rem] mt-[.24rem]">
          <div
            className="flex justify-center cursor-pointer"
            onClick={() => setShowMore(!showMore)}
          >
            <div className={classNames(showMore ? "text-white" : "text-text2")}>
              More
            </div>
            <div
              className={classNames(
                showMore ? "rotate-[-90deg]" : "rotate-[90deg]",
                "ml-[.06rem]"
              )}
            >
              <Icomoon
                icon="right"
                size=".16rem"
                color={showMore ? "#FFFFFF" : "#5B6872"}
              />
            </div>
          </div>

          {showMore && (
            <>
              <div
                className="p-[.24rem] mt-[.16rem]"
                style={{
                  background: "rgba(9, 15, 23, 0.25)",
                  backdropFilter: "blur(.7rem)",
                  border: "1px solid rgba(38, 73, 78, 0.5)",
                  borderRadius: ".32rem",
                }}
              >
                <div>
                  <MyTooltip
                    text="Reward Ratio"
                    title=""
                    className="text-text2"
                  />
                </div>
                <div className="text-text1 mt-[.1rem]">
                  1:
                  {numberUtil.tokenMintRewardRateToHuman(
                    data.reward_rate,
                    data.rToken
                  )}
                </div>
                <div className="mt-[.17rem]">
                  <MyTooltip
                    text="Remaining Reward"
                    title=""
                    className="text-text2"
                  />
                </div>
                <div className="text-text1 mt-[.1rem]">
                  {formatNumber(numberUtil.fisAmountToHuman(data.left_amount))}
                </div>
              </div>

              {isBalanceValid && (
                <div
                  className="text-text1 text-[.2rem] text-center cursor-pointer mt-[.24rem]"
                  onClick={onClickUnstake}
                >
                  Unstake
                </div>
              )}
            </>
          )}
        </div>
      )}

      <RPoolMintClaimModal
        visible={claimModalVisible}
        onClose={closeClaimModal}
        rTokenName={data.rToken}
        cycle={data.cycle}
        totalMintedValue={data.mintedValue}
      />

      <RTokenStakeModal
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        tokenName={rTokenNameToTokenName(data.rToken)}
        defaultReceivingAddress={getDefaultReceivingAddress()}
        editAddressDisabled={data.rToken === RTokenName.rETH}
        balance={balance || "--"}
        onClickConnectWallet={onClickConnectWallet}
      />

      <RTokenRedeemModal
        visible={unstakeModalVisible}
        onClose={() => setUnstakeModalVisible(false)}
        tokenName={rTokenNameToTokenName(data.rToken)}
        defaultReceivingAddress={getDefaultReceivingAddress()}
        editAddressDisabled={data.rToken === RTokenName.rETH}
        balance={rTokenBalance}
        onClickConnectWallet={onClickConnectWallet}
      />
    </div>
  );
};

export default MintTokenCard;
