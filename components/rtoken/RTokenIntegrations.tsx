import classNames from "classnames";
import { CollapseCard } from "components/common/CollapseCard";
import { DexType, TokenName } from "interfaces/common";
import {
  IntegrationItem,
  RTokenIntegrationItem,
} from "./RTokenIntegrationItem";
import commonStyles from "styles/Common.module.scss";
import { useMemo } from "react";
import { getDexIcon, getDexList } from "utils/rToken";
import tidal from "public/tidal.svg";

interface RTokenIntegrationsProps {
  tokenName: TokenName;
}

export const RTokenIntegrations = (props: RTokenIntegrationsProps) => {
  const integrationList = useMemo(() => {
    const getDexDesc = (dexType: DexType) => {
      switch (dexType) {
        case DexType.rDEX:
          return "StaFi native DEX for rTokens";
        case DexType.Uniswap:
          return `Add r${props.tokenName} Liquidity on Uniswap`;
        case DexType.Curve:
          return `Add r${props.tokenName} Liquidity on Curve`;
      }
      return "Decentralized Exchange";
    };

    const dexList = getDexList(props.tokenName);

    const resList: IntegrationItem[] = dexList.map((item) => {
      return {
        ...item,
        icon: getDexIcon(item.type),
        title: item.type,
        desc: getDexDesc(item.type),
      };
    });
    if (props.tokenName === TokenName.ETH) {
      resList.unshift({
        icon: tidal,
        title: "Tidal",
        desc: "Buy insurance to cover potential loss",
        url: "https://docs.tidal.finance/how-to-use-1/buy-cover",
      });
    }

    return resList;
  }, [props.tokenName]);

  return (
    <CollapseCard
      background="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={
        <div className="text-white text-[.32rem]">
          r{props.tokenName} Integrations
        </div>
      }
    >
      <div
        className={classNames(
          commonStyles["hide-scrollbar"],
          "flex overflow-x-auto px-[.32rem] mb-[.32rem]"
        )}
      >
        {integrationList.map((item) => (
          <RTokenIntegrationItem data={item} key={item.title} />
        ))}
      </div>
    </CollapseCard>
  );
};
