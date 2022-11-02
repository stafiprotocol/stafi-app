import classNames from "classnames";
import commonStyles from "styles/Common.module.scss";

type GradientTextProps = React.PropsWithChildren<{
  size: string;
  fontWeight?: string;
  ml?: string;
  isError?: boolean;
}>;

export const GradientText = (props: GradientTextProps) => {
  return (
    <div
      className={classNames(
        props.isError
          ? commonStyles["gradient-text-error"]
          : commonStyles["gradient-text"],
        "ml-.24rem text-[.72rem] tracking-normal"
      )}
      style={{
        fontSize: props.size,
        marginLeft: props.ml || "0",
        fontWeight: props.fontWeight || "800",
      }}
    >
      {props.children}
    </div>
  );
};
