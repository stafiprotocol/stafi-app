import { Box, Modal } from "@mui/material";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch } from "hooks/common";
import rectangle from "public/rectangle_h.svg";
import Image from "next/image";
import { useRouter } from "next/router";
import { TradeDexCardItem } from "components/rtoken/TradeDexCardItem";
import { DexType, TokenName, TokenStandard } from "interfaces/common";

interface TradeModalProps {
  tokenName: TokenName;
  visible: boolean;
  onClose: () => void;
}

interface DexItem {
  type: DexType;
  tokenStandard: TokenStandard;
  url: string;
}

export const TradeModal = (props: TradeModalProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getDexList = (): DexItem[] => {
    if (props.tokenName === TokenName.ETH) {
      return [
        {
          type: DexType.rDEX,
          tokenStandard: TokenStandard.Native,
          url: "https://app.rdex.finance/swap?first=rETH&second=FIS",
        },
        {
          type: DexType.Uniswap,
          tokenStandard: TokenStandard.ERC20,
          url: "https://app.uniswap.org/#/swap?inputCurrency=0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593&outputCurrency=ETH",
        },
        {
          type: DexType.Curve,
          tokenStandard: TokenStandard.ERC20,
          url: "https://curve.fi/reth",
        },
      ];
    }
    return [];
  };

  const onClickRBridge = () => {
    if (props.tokenName === TokenName.ETH) {
      window.open("https://app.stafi.io/rAsset/swap/rETH?first=native");
    }
  };

  return (
    <Modal open={props.visible} onClose={props.onClose}>
      <Box
        pt="0"
        sx={{
          border: "1px solid #1A2835",
          backgroundColor: "#0A131B",
          width: "14.88rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex flex-col items-stretch px-[.56rem] pb-[.6rem] relative">
          <div className="self-center relative w-[2.4rem] h-[.9rem]">
            <Image src={rectangle} layout="fill" alt="rectangle" />
          </div>

          <div
            className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
            onClick={props.onClose}
          >
            <Icomoon icon="close" size="0.24rem" color="#5B6872" />
          </div>

          <div className="text-center mt-[0rem] text-white font-[700] text-[.42rem]">
            Choose One DEX to Trade
          </div>

          <div
            className="grid gap-[.36rem] mt-[.85rem] mx-[2rem] justify-center"
            style={{
              gridTemplateColumns: "auto auto auto",
            }}
          >
            {getDexList().map((item) => (
              <TradeDexCardItem
                key={item.type}
                type={item.type}
                tokenStandard={item.tokenStandard}
                url={item.url}
              />
            ))}
          </div>

          <div className="mt-[.56rem] flex items-center justify-center">
            <div className="text-text2 text-[.24rem]">
              Need to change token standard?
            </div>

            <div
              className="ml-[.27rem] flex items-center text-primary cursor-pointer"
              onClick={onClickRBridge}
            >
              <div className="mr-[.16rem]">Go to rBridge</div>
              <Icomoon icon="arrow-right" size=".26rem" color="#00F3AB" />
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
