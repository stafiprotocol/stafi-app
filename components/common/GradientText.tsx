import classNames from "classnames";
import commonStyles from "styles/Common.module.scss";

type GradientTextProps = React.PropsWithChildren<{
  size: string;
  fontWeight?: string;
  ml?: string;
  isError?: boolean;
  className?: string;
}>;

export const GradientText = (props: GradientTextProps) => {
  return (
    <div
      className={classNames(
        props.isError
          ? commonStyles["gradient-text-error"]
          : commonStyles["gradient-text"],
        "ml-.24rem text-[.72rem] tracking-normal",
        props.className || ""
      )}
      style={{
        fontSize: props.size,
        lineHeight: 1.2,
        marginLeft: props.ml || "0",
        fontWeight: props.fontWeight || "800",
      }}
    >
      {props.children}
    </div>
  );
};
