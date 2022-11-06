import { Tooltip } from "@mui/material";
import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";

interface MyTooltipProps {
  title: string;
  text: string;
  color?: string;
  hideQuestionIcon?: boolean;
  className?: string;
}

export const MyTooltip = (props: MyTooltipProps) => {
  return (
    <Tooltip
      title={props.title}
      placement="top"
      sx={{
        color: "#5B6872",
        fontSize: ".18rem",
      }}
      PopperProps={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -5],
            },
          },
        ],
      }}
    >
      <div
        className={classNames(
          "flex items-center cursor-default",
          props.className || ""
        )}
      >
        <div>{props.text}</div>

        {!props.hideQuestionIcon && (
          <div className="flex items-center ml-[.08rem]">
            <Icomoon
              icon="question"
              size="0.16rem"
              color={props.color || "#5B6872"}
            />
          </div>
        )}
      </div>
    </Tooltip>
  );
};
