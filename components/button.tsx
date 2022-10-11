import styles from "../styles/Button.module.scss";
import classNames from "classnames";
import { CircularLoading } from "components/CircularLoading";

type ButtonProps = React.PropsWithChildren<{
  disabled?: boolean;
  loading?: boolean;
  stroke?: boolean;
  mt?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  onClick?: () => void;
}>;

export const Button = (props: ButtonProps) => {
  return (
    <div
      className={classNames(
        props.stroke ? styles["button-stroke"] : styles.button,
        props.disabled
          ? props.stroke
            ? styles["button-stroke-disabled"]
            : styles["button-disabled"]
          : "",
        { "opacity-50": props.loading }
      )}
      style={{
        ...(props.width ? { width: props.width } : {}),
        height: props.height || "1rem",
        marginTop: props.mt || "0",
        fontSize: props.fontSize || "0.32rem",
        cursor: props.loading || props.disabled ? "default" : "pointer",
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
            color: props.disabled
              ? props.stroke
                ? "#5b6872"
                : "#5b6872"
              : props.stroke
              ? "#00f3ab"
              : "#1a2835",
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
