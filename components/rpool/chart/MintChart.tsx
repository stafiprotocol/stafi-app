const MintChart = () => {
  return (
    <div className="flex justify-between mt-[.36rem]">
      <div
				className="rounded-[.16rem] w-[49%] min-h-[1rem]"
        style={{
          background: "rgba(23, 38, 54, 0.15)",
          border: "1px solid #1A2835",
          backdropFilter: "blur(.7rem)",
        }}
      ></div>
      <div
				className="rounded-[.16rem] w-[49%] min-h-[1rem]"
        style={{
          background: "rgba(23, 38, 54, 0.15)",
          border: "1px solid #1A2835",
          backdropFilter: "blur(.7rem)",
        }}
			></div>
    </div>
  );
};

export default MintChart;
