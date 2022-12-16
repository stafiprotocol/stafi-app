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
      console.log(`empty ${tokenSymbol} mint info`);
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
      console.log("empty rEth mint info");
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
}
