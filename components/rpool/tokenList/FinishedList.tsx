import classNames from "classnames";
import { Button } from "components/common/button";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { MyLayoutContext } from "components/layout/layout";
import RPoolMintClaimModal from "components/modal/RPoolMintClaimModal";
import { RTokenRedeemModal } from "components/modal/RTokenRedeemModal";
import {
  getMetamaskEthChainId,
  getMetamaskMaticChainId,
} from "config/metaMask";
import { useAppDispatch } from "hooks/common";
import { useRPoolMintClaim } from "hooks/useRPoolMintClaim";
import { RTokenListItem } from "hooks/useRPoolMintRTokenActs";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useWalletAccount } from "hooks/useWalletAccount";
import {
  RTokenName,
  TokenName,
  TokenStandard,
  WalletType,
} from "interfaces/common";
import { string } from "mathjs";
import { ProgramTab } from "pages/rpool";
import { useContext, useMemo, useState } from "react";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";
import { RTokenActs } from "redux/reducers/MintProgramSlice";
import { connectMetaMask } from "redux/reducers/WalletSlice";
import { formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";
import { rTokenNameToTokenName } from "utils/rToken";

interface Props {
  programTab: ProgramTab;
  list: RTokenListItem[];
  viewMyStakes: boolean;
  rTokenBalances: {
    [rTokenName in RTokenName]?: string;
  };
}

const RPoolFinishedList = (props: Props) => {
  const { list, viewMyStakes, rTokenBalances } = props;

  const dispatch = useAppDispatch();

  const { walletNotConnected } = useContext(MyLayoutContext);
  const { polkadotAccount, metaMaskAccount } = useWalletAccount();

  const [claimModalVisible, setClaimModalVisible] = useState<boolean>(false);
  const [unstakeModalVisible, setUnstakeModalVisible] =
    useState<boolean>(false);
  const [currentRowItem, setCurrentRowItem] = useState<RTokenActs | undefined>(
    undefined
  );
  const [currentRowRToken, setCurrentRowRToken] = useState<
    RTokenName | undefined
  >(undefined);

  const renderedList = useMemo(() => {
    return list.filter((data: RTokenListItem) => {
      const criteria = Array.isArray(data.children) && data.children.length > 0;
      if (viewMyStakes) {
        const rTokenBalance = rTokenBalances[data.rToken];
        return (
          !isNaN(Number(rTokenBalance)) && Number(rTokenBalance) > 0 && criteria
        );
      }
      return criteria;
    });
  }, [list, viewMyStakes, rTokenBalances]);

  const onClickUnstake = (rTokenName: RTokenName, row: RTokenActs) => {
    if (walletNotConnected || !metaMaskAccount || !polkadotAccount) {
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: [WalletType.MetaMask, WalletType.Polkadot],
          targetUrl: "/rpool",
        })
      );
    } else {
      setCurrentRowItem(row);
      setCurrentRowRToken(rTokenName);
      setUnstakeModalVisible(true);
    }
  };

  const onClickClaim = (rTokenName: RTokenName, row: RTokenActs) => {
    if (walletNotConnected || !metaMaskAccount || !polkadotAccount) {
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: [WalletType.MetaMask, WalletType.Polkadot],
          targetUrl: "/rpool",
        })
      );
    } else {
      setCurrentRowItem(row);
      setCurrentRowRToken(rTokenName);
      setClaimModalVisible(true);
    }
  };

  const getDefaultReceivingAddress = () => {
    if (currentRowRToken === RTokenName.rMATIC) {
      return polkadotAccount;
    }
    return metaMaskAccount;
  };

  const onClickConnectWallet = () => {
    if (currentRowRToken === RTokenName.rETH) {
      dispatch(connectMetaMask(getMetamaskEthChainId()));
    } else if (currentRowRToken === RTokenName.rMATIC) {
      dispatch(connectMetaMask(getMetamaskMaticChainId()));
    }
  };

  return (
    <div
      className="mt-[.36rem] rounded-[.16rem]"
      style={{
        border: "1px solid #1A2835",
        backdropFilter: "blur(.7rem)",
        background: "rgba(26, 40, 53, 0.2)",
      }}
    >
      <div
        className="grid mb-[.5rem] mt-[.56rem] mx-[.56rem]"
        style={{ gridTemplateColumns: "14% 16% 16% 16% 14% 24%" }}
      >
        <div className="flex justify-start text-text2 text-[.2rem]">
          Token Name
        </div>
        <div className="flex justify-center">
          <MyTooltip
            text="Minted Value"
            title=""
            className="text-text2 text-[.2rem]"
          />
        </div>
        <div className="flex justify-center">
          <MyTooltip
            text="Reward"
            title=""
            className="text-text2 text-[.2rem]"
          />
        </div>
        <div className="flex justify-center">
          <MyTooltip
            text="Reward Ratio"
            title=""
            className="text-text2 text-[.2rem]"
          />
        </div>
        <div className="flex justify-center">
          <MyTooltip text="APR" title="" className="text-text2 text-[.2rem]" />
        </div>
      </div>

      {!!renderedList &&
        renderedList.map((data: RTokenListItem, i: number) => (
          <div
            key={`${data.rToken}${i}`}
            className="px-[.56rem]"
            style={{
              borderTop: i % 2 === 1 ? "1px solid #1A2835" : "none",
              borderBottom: i % 2 === 1 ? "1px solid #1A2835" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(26, 40, 53, 0.3)",
            }}
          >
            {data.children.map((item: RTokenActs, index: number) => (
              <div
                key={`${data.rToken}${i}${index}`}
                className="grid h-[1.1rem] text-[.24rem] text-text1"
                style={{
                  gridTemplateColumns: "14% 16% 16% 16% 14% 24%",
                }}
              >
                <div className="flex justify-start items-center">
                  {index === 0 && data.rToken}
                </div>
                <div className="flex justify-center items-center">
                  {formatNumber(item.mintedValue)}
                </div>
                <div className="flex justify-center items-center">
                  {formatNumber(numberUtil.fisAmountToHuman(item.total_reward))}
                </div>
                <div className="flex justify-center items-center">
                  1:
                  {numberUtil.tokenMintRewardRateToHuman(
                    item.reward_rate,
                    data.rToken
                  )}
                </div>
                <div className="flex justify-center items-center">
                  {item.apr}
                </div>
                <div className="flex justify-end items-center">
                  <div
                    className={classNames(
                      "h-[.48rem] rounded-[.43rem] w-[1.58rem] text-text1 text-[.24rem] flex items-center justify-center cursor-pointer mr-[.16rem]",
                      {
                        hidden:
                          isNaN(Number(rTokenBalances[data.rToken])) ||
                          Number(rTokenBalances[data.rToken]) === 0,
                      }
                    )}
                    style={{
                      border: "1px solid rgba(91, 104, 114, 0.5)",
                    }}
                    onClick={() => onClickUnstake(data.rToken, item)}
                  >
                    Unstake
                  </div>
                  <Button
                    height="0.48rem"
                    fontSize="0.24rem"
                    width="1.58rem"
                    onClick={() => onClickClaim(data.rToken, item)}
                  >
                    Claim
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {renderedList.length === 0 && (
        <div className="flex flex-col items-center pb-[.3rem]">
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
          </div>
        </div>
      )}

      <RPoolMintClaimModal
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
        rTokenName={currentRowRToken || RTokenName.rETH}
        cycle={currentRowItem ? currentRowItem.cycle : 1}
        totalMintedValue={currentRowItem ? currentRowItem.mintedValue : "0"}
      />

      <RTokenRedeemModal
        visible={unstakeModalVisible}
        onClose={() => setUnstakeModalVisible(false)}
        tokenName={rTokenNameToTokenName(currentRowRToken as RTokenName)}
        defaultReceivingAddress={getDefaultReceivingAddress()}
        editAddressDisabled={currentRowRToken === RTokenName.rETH}
        balance={currentRowRToken ? rTokenBalances[currentRowRToken] : "--"}
        onClickConnectWallet={onClickConnectWallet}
      />
    </div>
  );
};

export default RPoolFinishedList;
