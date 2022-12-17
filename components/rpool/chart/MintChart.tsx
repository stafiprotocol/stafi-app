interface Props {
	totalMintedValue?: string;
	totalRewardFis?: string;
}

const MintChart = (props: Props) => {
  return (
    <div className="flex justify-between mt-[.36rem]">
      <div
				className="rounded-[.16rem] w-[49%] min-h-[1rem] p-[.32rem]"
        style={{
          background: "rgba(23, 38, 54, 0.15)",
          border: "1px solid #1A2835",
          backdropFilter: "blur(.7rem)",
        }}
      >
				<div className="flex flex-col">
					<div className="text-[.2rem] text-text2">Total Minted Value</div>
					<div className="text-[.32rem] mt-[.11rem]">${props.totalMintedValue || '--'}</div>
				</div>
			</div>

      <div
				className="rounded-[.16rem] w-[49%] min-h-[1rem] p-[.32rem]"
        style={{
          background: "rgba(23, 38, 54, 0.15)",
          border: "1px solid #1A2835",
          backdropFilter: "blur(.7rem)",
        }}
			>
				<div className="flex flex-col">
					<div className="text-[.2rem] text-text2">Total Reward FIS</div>
					<div className="text-[.32rem] mt-[.11rem]">${props.totalRewardFis || '--'}</div>
				</div>
			</div>
    </div>
  );
};

export default MintChart;
