import classNames from "classnames";

interface TokenStakeTabsProps {
  selectedTab: "unmatched" | "staked" | "others";
  onChange: (tab: "unmatched" | "staked" | "others") => void;
}

export const TokenStakeTabs = (props: TokenStakeTabsProps) => {
  const { selectedTab, onChange } = props;
  return (
    <div className="flex items-center justify-center">
      <div
        className={classNames(
          "w-[2.5rem] h-[.7rem] rounded-[.12rem] flex items-center justify-center text-[.24rem] font-[700] cursor-pointer",
          selectedTab === "unmatched"
            ? "text-text3 bg-primary"
            : "text-text1 bg-[#9DAFBE37]"
        )}
        onClick={() => onChange("unmatched")}
      >
        Unmatched
      </div>

      <div
        className={classNames(
          "ml-[.24rem] w-[2.5rem] h-[.7rem] rounded-[.12rem] flex items-center justify-center text-[.24rem] font-[700] cursor-pointer",
          selectedTab === "staked"
            ? "text-text3 bg-primary"
            : "text-text1 bg-[#9DAFBE37]"
        )}
        onClick={() => onChange("staked")}
      >
        Staked
      </div>

      <div
        className={classNames(
          "ml-[.24rem] w-[2.5rem] h-[.7rem] rounded-[.12rem] flex items-center justify-center text-[.24rem] font-[700] cursor-pointer",
          selectedTab === "others"
            ? "text-text3 bg-primary"
            : "text-text1 bg-[#9DAFBE37]"
        )}
        onClick={() => onChange("others")}
      >
        Others
      </div>
    </div>
  );
};
