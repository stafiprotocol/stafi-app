import { Dialog, DialogContent } from "@mui/material";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch } from "hooks/common";
import { useRPoolMintClaim } from "hooks/useRPoolMintClaim";
import { RTokenName } from "interfaces/common";
import Image from "next/image";
import { useMemo } from "react";
import {
  claimREthReward,
  claimRTokenReward,
} from "redux/reducers/MintProgramSlice";
import { formatNumber } from "utils/number";
import { rTokenNameToTokenSymbol } from "utils/rToken";

interface Props {
  visible: boolean;
  onClose: () => void;
  rTokenName: RTokenName;
  cycle: number;
  totalMintedValue: string;
}

const RPoolMintClaimModal = (props: Props) => {
  const dispatch = useAppDispatch();

  const { mintOverView } = useRPoolMintClaim(props.rTokenName, props.cycle);
  console.log({ mintOverView });

  const [claimButtonDisabled, claimButtonContent] = useMemo(() => {
    if (!mintOverView) {
      return [true, "Claim"];
    }
    if (mintOverView.fisClaimableReward <= 0) {
      return [true, "No Enough FIS Claimable"];
    }
    return [false, "Claim"];
  }, [mintOverView]);

  const onClickClaim = () => {
    if (!mintOverView) return;
    if (props.rTokenName === RTokenName.rETH) {
      dispatch(
        claimREthReward(
          mintOverView.fisClaimableReward,
          mintOverView.claimIndexes,
          props.cycle
        )
      );
    } else {
      dispatch(
        claimRTokenReward(
          mintOverView.fisClaimableReward,
          mintOverView.claimIndexes,
          rTokenNameToTokenSymbol(props.rTokenName),
          props.cycle
        )
      );
    }
  };

  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      scroll="body"
      sx={{
        borderRadius: "0.16rem",
        background: "#0A131Bba",
        "& .MuiDialog-container": {
          padding: "0",
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "6.04rem", // Set your width here
            backgroundColor: "transparent",
            padding: "0",
          },
          "& .MuiDialogContent-root": {
            padding: "0",
            width: "6.04rem",
          },
        },
      }}
    >
      <DialogContent>
        <Card
          background="#0A131B"
          className="max-h-full px-[.32rem] overflow-hidden"
        >
          <div
            className="absolute right-[.16rem] top-[.16rem] cursor-pointer"
            onClick={props.onClose}
          >
            <Icomoon icon="close" size="0.24rem" color="#5B6872" />
          </div>

          <div className="text-[.32rem] text-center text-white mt-[.7rem]">
            Claim Rewards
          </div>

          <div className="flex justify-center items-end mt-[.3rem]">
            <div className="text-primary text-[.36rem] relative">
              <div>
                {formatNumber(
                  mintOverView ? mintOverView.fisClaimableReward : 0
                )}{" "}
                FIS
              </div>
              <div className="text-text2 text-[.16rem] absolute right-[-0.9rem] bottom-0">
                Claimable
              </div>
            </div>
          </div>

          <div
            className="rounded-[.32rem] mt-[.56rem] pt-[.35rem] pb-[.31rem] pl-[.83rem] text-[.16rem]"
            style={{
              background: "rgba(9, 15, 23, 0.25)",
              backdropFilter: "blur(.4rem)",
              border: "1px solid rgba(38, 73, 78, 0.5)",
            }}
          >
            <div className="grid" style={{ gridTemplateColumns: "60% 40%" }}>
              <div className="text-text2">Total Minted Value</div>
              <div className="text-text1">
                ${formatNumber(props.totalMintedValue, { decimals: 2 })}
              </div>
            </div>
            <div
              className="grid mt-[.15rem]"
              style={{ gridTemplateColumns: "60% 40%" }}
            >
              <div className="text-text2">My Mint</div>
              <div className="text-text1">
                $
                {formatNumber(mintOverView ? mintOverView.userMintReward : 0, {
                  decimals: 2,
                })}{" "}
                (
                {!mintOverView
                  ? 0
                  : (
                      (mintOverView.userMintReward /
                        Number(props.totalMintedValue)) *
                      100
                    ).toFixed(2)}{" "}
                %)
              </div>
            </div>
            <div
              className="grid mt-[.15rem]"
              style={{ gridTemplateColumns: "60% 40%" }}
            >
              <div className="text-text2">Total Rewards</div>
              <div className="text-text1">
                {formatNumber(mintOverView ? mintOverView.fisTotalReward : 0, {
                  decimals: 2,
                })}{" "}
                FIS
              </div>
            </div>
            <div
              className="grid mt-[.15rem]"
              style={{ gridTemplateColumns: "60% 40%" }}
            >
              <div className="text-text2">Claimable Rewards</div>
              <div className="text-text1">
                {formatNumber(
                  mintOverView ? mintOverView.fisClaimableReward : 0,
                  { decimals: 2 }
                )}{" "}
                FIS
              </div>
            </div>
            <div
              className="grid mt-[.15rem]"
              style={{ gridTemplateColumns: "60% 40%" }}
            >
              <div className="text-text2">Locked Reward</div>
              <div className="text-text1">
                {formatNumber(mintOverView ? mintOverView.fisLockedReward : 0, {
                  decimals: 2,
                })}{" "}
                FIS
              </div>
            </div>
          </div>

          <div className="mt-[.55rem] mb-[.56rem]">
            <Button
              // disabled={claimButtonDisabled}
              width="5.4rem"
              height=".65rem"
              fontSize=".24rem"
              onClick={onClickClaim}
            >
              {claimButtonContent}
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default RPoolMintClaimModal;
