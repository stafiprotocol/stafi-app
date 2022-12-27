import { TokenSymbol } from "interfaces/common";
import { stafiServer } from "servers/stafi";
import numberUtil from "utils/numberUtil";
import { formatDuration } from "utils/time";

export default class RPoolServer {
  async getRTokenMintRewardsActs(tokenSymbol: TokenSymbol) {
    const acts: any[] = [];
    const api = await stafiServer.createStafiApi();
    const actLatestCycleResult = await api.query.rClaim.actLatestCycle(
      tokenSymbol
    );
    const actLatestCycle = Number(actLatestCycleResult);

    if (actLatestCycle === 0) {
      // console.log(`empty ${tokenSymbol} mint info`);
    } else {
      const lastHeader = await api.rpc.chain.getHeader();
      if (!lastHeader || !lastHeader.toJSON()) {
        return acts;
      }
      const nowBlock: number = Number(lastHeader.toJSON().number);
      for (let i = 1; i <= actLatestCycle; i++) {
        try {
          const act = await api.query.rClaim.acts([tokenSymbol, i]);
          if (act.toJSON()) {
            const actJson: any = act.toJSON();
            acts.push(this.formatMintActJson(actJson, nowBlock));
          }
        } catch (err: any) {
          continue;
        }
      }

      acts.sort((x: any, y: any) => {
        if (x.nowBlock < x.end && y.nowBlock > y.end) {
          return -1;
        }
        if (x.end <= nowBlock && y.end <= nowBlock) {
          return y.total_reward - x.total_reward;
        }
        if (x.end > nowBlock && y.end > nowBlock) {
          return x.end - y.end;
        }
        return 0;
      });
    }

    return acts;
  }

  async getREthMintRewardsActs() {
    const acts: any[] = [];
    const api = await stafiServer.createStafiApi();
    const rEthActLatestCycleResult =
      await api.query.rClaim.rEthActLatestCycle();
    const rEthActLatestCycle = Number(rEthActLatestCycleResult);

    if (rEthActLatestCycle === 0) {
      // console.log("empty rEth mint info");
    } else {
      const lastHeader = await api.rpc.chain.getHeader();
      if (!lastHeader || !lastHeader.toJSON()) {
        return acts;
      }
      const nowBlock: number = Number(lastHeader.toJSON().number);
      for (let i = 1; i <= rEthActLatestCycle; i++) {
        try {
          const act = await api.query.rClaim.rEthActs(i);
          if (act.toJSON()) {
            const actJson: any = act.toJSON();
            acts.push(this.formatMintActJson(actJson, nowBlock));
          }
        } catch (err: any) {
          continue;
        }
      }

      acts.sort((x: any, y: any) => {
        if (x.nowBlock < x.end && y.nowBlock > y.end) {
          return -1;
        }
        return 0;
      });
    }

    return acts;
  }

  formatMintActJson(actJson: any, nowBlock: number): any {
    actJson.nowBlock = nowBlock;
    const days = numberUtil.divide(actJson.end - actJson.begin, 14400);
    actJson.durationInDays = Math.round(days * 10) / 10;
    actJson.remainingTime = formatDuration(
      Math.max(0, actJson.end - nowBlock) * 6
    );
    actJson.endTimeStamp = Date.now() + (actJson.end - nowBlock) * 6000;
    actJson.mintedValue = "--";
    return actJson;
  }

  async getRTokenMintOverview(
    tokenSymbol: TokenSymbol,
    cycle: number,
    polkadotAccount: string,
    metaMaskAccount: string,
    fisPrice: string | number
  ) {
    try {
      const response: any = {
        actData: null,
        myMint: "--",
        myMintRatio: "--",
        myReward: "--",
        fisTotalReward: "--",
        fisClaimableReward: "--",
        fisLockedReward: "--",
        claimIndexs: [],
        vesting: "--",
				mintsCount: 0,
      };
      const api = await stafiServer.createStafiApi();
      let act;
      if (tokenSymbol === TokenSymbol.ETH) {
        act = await api.query.rClaim.rEthActs(cycle);
      } else {
        act = await api.query.rClaim.acts([tokenSymbol, cycle]);
      }
      if (!act.toJSON()) {
        return response;
      }
      const actJson: any = act.toJSON();
      response.actData = actJson;
      response.vesting = (actJson.locked_blocks * 6) / 60 / 60 / 24;

      let userMintsCount;
      if (tokenSymbol === TokenSymbol.ETH) {
        userMintsCount = await api.query.rClaim.userREthMintsCount([
          metaMaskAccount,
          cycle,
        ]);
      } else {
        userMintsCount = await api.query.rClaim.userMintsCount([
          polkadotAccount,
          tokenSymbol,
          cycle,
        ]);
      }
      if (!userMintsCount) return response;

      let totalReward = BigInt(0);
      let fisClaimableReward = 0;
      let fisClaimedReward = 0;
      let userMint = BigInt(0);
      const claimIndexes: any[] = [];
      const mintsCount = Number(userMintsCount.toJSON());
      if (mintsCount <= 0) {
        response.myMint = 0;
        response.myMintRatio = 0;
        response.myReward = 0;
        response.fisTotalReward = 0;
        response.fisClaimableReward = 0;
        response.fisLockedReward = 0;
        return response;
      }

      for (let i = 0; i < mintsCount; i++) {
        try {
          let claimInfo;
          if (tokenSymbol === TokenSymbol.ETH) {
            claimInfo = await api.query.rClaim.rEthClaimInfos([
              metaMaskAccount,
              cycle,
              i,
            ]);
          } else {
            claimInfo = await api.query.rClaim.claimInfos([
              polkadotAccount,
              tokenSymbol,
              cycle,
              i,
            ]);
          }
          if (!claimInfo.toJSON()) continue;
          const claimInfoJson: any = claimInfo.toJSON();
          totalReward += BigInt(claimInfoJson.total_reward);

          const finalBlock = claimInfoJson.mint_block + actJson.locked_blocks;
          const lastHeader = await api.rpc.chain.getHeader();
          if (!lastHeader.toJSON()) continue;
          const nowBlock: number = Number(lastHeader.toJSON().number);

          let shouldClaimAmount = 0;
          let leftClaimAmount =
            claimInfoJson.total_reward - claimInfoJson.total_claimed;
          if (leftClaimAmount > 0) {
            if (nowBlock < finalBlock) {
              let duBlocks = nowBlock - claimInfoJson.latest_claimed_block;
              let lockedDuBlocks =
                finalBlock - claimInfoJson.latest_claimed_block;
              shouldClaimAmount = leftClaimAmount * (duBlocks / lockedDuBlocks);
            } else {
              shouldClaimAmount = leftClaimAmount;
            }
          }

          if (shouldClaimAmount > 0) {
            claimIndexes.push(i);
            fisClaimableReward += shouldClaimAmount;
          }

          fisClaimedReward += claimInfoJson.total_claimed;
          if (tokenSymbol === TokenSymbol.ETH) {
            userMint += BigInt(BigInt(claimInfoJson.mint_amount).toString(16));
          } else {
            userMint += BigInt(BigInt(claimInfoJson.mint_amount).toString(10));
          }
        } catch (err: any) {
          console.error(err);
          continue;
        }
      }

      const formatTotalReward = numberUtil.fisAmountToHuman(
        totalReward.toString(10)
      );
      response.myMint =
        Math.round(
          Number(numberUtil.tokenAmountToHuman(userMint, tokenSymbol)) * 1000000
        ) / 1000000;

      if (actJson.total_rtoken_amount === 0) {
        if (response.myMint > 0) {
          response.myMintRatio = 100;
        } else {
          response.myMintRatio = 0;
        }
      } else {
        response.myMintRatio = Math.min(
          100,
          Math.round(
            ((response.myMint * 100) /
              Number(
                numberUtil.tokenAmountToHuman(
                  actJson.total_rtoken_amount,
                  tokenSymbol
                )
              )) *
              10
          ) / 10
        );
      }

      if (isNaN(Number(fisPrice))) {
        response.myReward = "--";
      } else {
        const mintValue = formatTotalReward * Number(fisPrice);
        response.myReward = Math.round(mintValue * 1000000) / 1000000;
      }

      response.fisTotalReward = formatTotalReward.toFixed(4);
      response.fisClaimableReward = numberUtil
        .fisAmountToHuman(fisClaimableReward)
        .toFixed(4);
      response.fisLockedReward = numberUtil
        .fisAmountToHuman(
          Number(totalReward.toString(10)) -
            fisClaimableReward -
            fisClaimedReward
        )
        .toFixed(4);
      response.claimIndexes = claimIndexes;
			response.mintsCount = mintsCount;

      return response;
    } catch (err: any) {}
  }

  async getUserActs(
    tokenSymbol: TokenSymbol,
    polkadotAccount: string,
    metaMaskAccount: string
  ) {
    try {
      const api = await stafiServer.createStafiApi();
      let acts;
      if (tokenSymbol === TokenSymbol.ETH) {
        acts = await api.query.rClaim.userREthActs([
          metaMaskAccount,
          tokenSymbol,
        ]);
      } else {
        acts = await api.query.rClaim.userActs([polkadotAccount, tokenSymbol]);
      }
      if (acts && acts.toJSON()) {
        return acts.toJSON();
      }
    } catch (err: any) {}
  }
}
