import classNames from "classnames";
import { CircularLoading } from "components/common/CircularLoading";
import styles from "styles/Button.module.scss";

type ButtonProps = React.PropsWithChildren<{
  disabled?: boolean;
  loading?: boolean;
  stroke?: boolean;
  secondary?: boolean;
  mt?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  radius?: string;
  className?: string;
  onClick?: () => void;
}>;

export const Button = (props: ButtonProps) => {
  const textColor = props.disabled
    ? "#5b6872"
    : props.stroke
    ? "#00f3ab"
    : props.secondary
    ? "#ffffff"
    : "#1a2835";

  return (
    <div
      className={classNames(
        props.stroke
          ? styles["button-stroke"]
          : props.secondary
          ? styles["button-secondary"]
          : styles.button,
        props.className || "",
        props.disabled
          ? props.stroke
            ? styles["button-stroke-disabled"]
            : styles["button-disabled"]
          : "",
        { "opacity-50": props.loading }
      )}
      style={{
        ...(props.width ? { width: props.width } : {}),
        color: textColor,
        height: props.height || "1rem",
        marginTop: props.mt || "0",
        fontSize: props.fontSize || "0.32rem",
        cursor: props.loading || props.disabled ? "default" : "pointer",
        borderRadius: props.radius || (props.stroke ? ".12rem" : ".32rem"),
      }}
      onClick={() => {
        if (!props.disabled && !props.loading) {
          props.onClick && props.onClick();
        }
      }}
    >
      {props.loading && (
        <div
          style={{
            color: textColor,
          }}
        >
          <CircularLoading color="inherit" size={props.fontSize || "0.32rem"} />
        </div>
      )}

      <div className={classNames({ "ml-1": props.loading })}>
        {props.children}
      </div>
    </div>
  );
};
