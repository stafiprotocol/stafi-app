import classNames from "classnames";
import { CollapseCard } from "components/common/CollapseCard";
import { TokenName } from "interfaces/common";
import { RTokenIntegrationItem } from "./RTokenIntegrationItem";
import commonStyles from "styles/Common.module.scss";

interface RTokenIntegrationsProps {
  tokenName: TokenName;
}

export const RTokenIntegrations = (props: RTokenIntegrationsProps) => {
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
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
        <RTokenIntegrationItem />
      </div>
    </CollapseCard>
  );
};
