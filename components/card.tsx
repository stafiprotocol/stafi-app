type CardProps = React.PropsWithChildren<{
  mt?: string;
  mb?: string;
  mx?: string;
  backgroundColor?: string;
}>;

export const Card = (props: CardProps) => {
  return (
    <div
      className="bg-cardBg border-solid border-[1px] border-[#1A2835] rounded-[.16rem]"
      style={{
        marginTop: props.mt || "0",
        marginBottom: props.mb || "0",
        marginLeft: props.mx || "0",
        marginRight: props.mx || "0",
        backgroundColor: props.backgroundColor || "transparent",
      }}
    >
      {props.children}
    </div>
  );
};
