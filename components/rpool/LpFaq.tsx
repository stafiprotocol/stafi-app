import { CollapseCard } from "components/common/CollapseCard";

const LpFaq = () => {
  return (
    <>
      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to obtain ERC20 rMATIC?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          You can swap rMATIC tokens into ERC-20 format at 1:1 ratio through the
          swapping function{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.stafi.io/rAsset/home/native/erc"
            target="_blank"
            rel="noreferrer"
          >
            rAsset
          </a>
          . Please refer to this guide to swap native rMATIC into ERC20 format:
          <br />
          <br />
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rasset/swap-guide"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rasset/swap-guide
          </a>
        </div>
      </CollapseCard>
    </>
  );
};

export default LpFaq;
