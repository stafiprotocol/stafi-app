import classNames from "classnames";

type CardProps = React.PropsWithChildren<{
  mt?: string;
  mb?: string;
  mx?: string;
  ml?: string;
  mr?: string;
  background?: string;
  borderColor?: string;
  style?: any;
  className?: string;
}>;

export const Card = (props: CardProps) => {
  return (
    <div
      className={classNames("rounded-[.16rem]", props.className || "")}
      style={{
        ...props.style,
        marginTop: props.mt || "0",
        marginBottom: props.mb || "0",
        marginLeft: props.ml || props.mx || "0",
        marginRight: props.mr || props.mx || "0",
        background: props.background || "transparent",
        backdropFilter: "blur(.4rem)",
        border: props.borderColor
          ? `solid 1px ${props.borderColor}`
          : "solid 1px #1A2835",
      }}
    >
      {props.children}
    </div>
  );
};
