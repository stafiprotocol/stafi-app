import { Button } from "components/common/button";
import Image from "next/image";
import ethLogo from "public/eth_type_black.svg";
import maticLogo from "public/matic_type_black.png";
import ksmLogo from "public/ksm_type_black.png";
import dotLogo from "public/dot_type_black.png";
import bnbLogo from "public/bnb_type_black.png";
import { RTokenName, TokenStandard, WalletType } from "interfaces/common";
import { MyTooltip } from "components/common/MyTooltip";
import { formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";
import { formatDuration } from "utils/time";
import { AllListItem } from "../tokenList/LiveList";
import { useContext, useEffect, useMemo, useState } from "react";
import { MyLayoutContext } from "components/layout/layout";
import { rTokenNameToTokenName, rTokenNameToTokenSymbol } from "utils/rToken";
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
import UnableClaimModal from "components/modal/UnableClaimModal";
import { useRPoolMintClaim } from "hooks/useRPoolMintClaim";
import { getMintOverview } from "redux/reducers/MintProgramSlice";
import { transformSs58Address } from "utils/polkadotUtils";
import { getDotPools } from "redux/reducers/DotSlice";
import { useDotBalance } from "hooks/useDotBalance";
import { useKsmBalance } from "hooks/useKsmBalance";
import { PriceItem } from "redux/reducers/RTokenSlice";
import { hooks } from "connectors/metaMask";

interface Props {
  data: AllListItem;
  rTokenBalance: string | undefined;
}

const MintTokenCard = (props: Props) => {
  const { data, rTokenBalance } = props;

  const dispatch = useAppDispatch();

  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();

  const router = useRouter();

  const { mintOverView } = useRPoolMintClaim(data.rToken, data.cycle);

  const { walletNotConnected } = useContext(MyLayoutContext);
  const { polkadotAccount, metaMaskAccount, ksmAccount, dotAccount } =
    useWalletAccount();
  const ksmBalance = useKsmBalance();
  const dotBalance = useDotBalance();

  const balance = useAppSelector((state: RootState) => {
    if (data.rToken === RTokenName.rETH) {
      return state.eth.balance;
    }
    if (data.rToken === RTokenName.rMATIC) {
      return state.matic.balance;
    }
  });

  // const priceList = useAppSelector((state: RootState) => {
  //   return state.rToken.priceList;
  // });

  const [showMore, setShowMore] = useState<boolean>(false);
  const [claimModalVisible, setClaimModalVisible] = useState<boolean>(false);
  const [unableClaimModalVisible, setUnableClaimModalVisible] =
    useState<boolean>(false);
  const [stakeModalVisible, setStakeModalVisible] = useState<boolean>(false);
  const [unstakeModalVisible, setUnstakeModalVisible] =
    useState<boolean>(false);

  const unstakeAvaiable = useMemo(() => {
    if (!mintOverView || mintOverView.mintsCount === 0) {
      return false;
    }
    return true;
  }, [mintOverView]);

  const claimAvaiable = useMemo(() => {
    if (!mintOverView || mintOverView.fisClaimableReward <= 0) {
      return false;
    }
    return true;
  }, [mintOverView]);

  // const totalMintedValue = useMemo(() => {
  //   const unitPrice = priceList.find(
  //     (item: PriceItem) => item.symbol === data.rToken
  //   );
  //   if (!unitPrice || !mintOverView || !mintOverView.actData) return "--";
  //   const rTokenTotalReward = numberUtil.tokenAmountToHuman(
  //     mintOverView.actData.total_rtoken_amount,
  //     rTokenNameToTokenSymbol(data.rToken)
  //   );
  //   if (isNaN(Number(rTokenTotalReward))) return "--";
  //   return Number(rTokenTotalReward) * Number(unitPrice.price);
  // }, [priceList, mintOverView, data.rToken]);

  const getRTokenLogo = (rTokenName: RTokenName) => {
    if (rTokenName === RTokenName.rMATIC) return maticLogo;
    if (rTokenName === RTokenName.rKSM) return ksmLogo;
    if (rTokenName === RTokenName.rETH) return ethLogo;
    if (rTokenName === RTokenName.rDOT) return dotLogo;
    if (rTokenName === RTokenName.rBNB) return bnbLogo;
    return ethLogo;
  };

  const closeClaimModal = () => {
    setClaimModalVisible(false);
    dispatch(getMintOverview(data.rToken, data.cycle));
  };

  const onClickConnectWallet = () => {
    if (data.rToken === RTokenName.rETH) {
      dispatch(connectMetaMask(getMetamaskEthChainId()));
    } else if (data.rToken === RTokenName.rMATIC) {
      dispatch(connectMetaMask(getMetamaskMaticChainId()));
    } else {
      dispatch(connectMetaMask(getMetamaskMaticChainId()));
		}
  };

  const onClickMint = () => {
    let targetMetaMaskChainId = getMetamaskMaticChainId();
    if (data.rToken === RTokenName.rMATIC) {
      targetMetaMaskChainId = getMetamaskMaticChainId();
    } else if (data.rToken === RTokenName.rETH) {
      targetMetaMaskChainId = getMetamaskEthChainId();
    }

    if (
      walletNotConnected ||
      !metaMaskAccount ||
      !polkadotAccount ||
      metaMaskChainId !== targetMetaMaskChainId
    ) {
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: [WalletType.MetaMask, WalletType.Polkadot],
          targetMetaMaskChainId,
          targetUrl: "/rpool",
        })
      );
    } else {
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
      if (!mintOverView || mintOverView.fisClaimableReward <= 0) {
        setUnableClaimModalVisible(true);
      } else {
        setClaimModalVisible(true);
      }
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

  const getDefaultReceivingAddress = (type: "stake" | "unstake") => {
    if (type === "stake") {
      return polkadotAccount;
    }
    if (data.rToken === RTokenName.rKSM) {
      return transformSs58Address(ksmAccount, WalletType.Polkadot_KSM);
    }
    if (data.rToken === RTokenName.rDOT) {
      return transformSs58Address(dotAccount, WalletType.Polkadot_DOT);
    }
    return metaMaskAccount;
  };

  const getTokenBalance = () => {
    if (data.rToken === RTokenName.rKSM) {
      return ksmBalance;
    }
    if (data.rToken === RTokenName.rDOT) {
      return dotBalance;
    }
    return balance;
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
            title="Mint APR estimated based on the last 7 days"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text1 font-[700] text-[.28rem]">{data.apr}</div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Reward"
            title="Overall mint reward, counted by reward token amount"
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
            title="Overall minted value for this rtoken, counted by USD"
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
        className="h-[.65rem] rounded-[.45rem] w-[2.87rem] text-text1 text-[.24rem] flex items-center justify-center mt-[.24rem]"
        style={{
          border: claimAvaiable ? "1px solid rgba(91, 104, 114, 0.5)" : "",
          backgroundColor: claimAvaiable ? "" : "#1A2835",
          cursor: claimAvaiable ? "pointer" : "default",
        }}
        onClick={onClickClaim}
      >
        Claim
      </div>

      {!walletNotConnected && metaMaskAccount && (
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
                    text="Remaining Reward"
                    title="Remaining mint reward, counted by reward token value in USD"
                    className="text-text2"
                  />
                </div>
                <div className="text-text1 mt-[.1rem]">
                  $
                  {formatNumber(numberUtil.fisAmountToHuman(data.left_amount), {
                    decimals: 2,
                  })}
                </div>
              </div>

              {unstakeAvaiable && (
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
        rTokenBalance={rTokenBalance}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        tokenName={rTokenNameToTokenName(data.rToken)}
        defaultReceivingAddress={getDefaultReceivingAddress("stake")}
        editAddressDisabled={data.rToken === RTokenName.rETH}
        balance={getTokenBalance() || "--"}
        onClickConnectWallet={onClickConnectWallet}
      />

      <RTokenRedeemModal
        visible={unstakeModalVisible}
        onClose={() => setUnstakeModalVisible(false)}
        tokenName={rTokenNameToTokenName(data.rToken)}
        defaultReceivingAddress={getDefaultReceivingAddress("unstake")}
        editAddressDisabled={data.rToken === RTokenName.rETH}
        balance={rTokenBalance}
        onClickConnectWallet={onClickConnectWallet}
      />

      <UnableClaimModal
        visible={unableClaimModalVisible}
        onClose={() => setUnableClaimModalVisible(false)}
      />
    </div>
  );
};

export default MintTokenCard;
