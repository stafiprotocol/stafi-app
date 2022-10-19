import { Tooltip } from "@mui/material";
import { Icomoon } from "./Icomoon";

interface MyTooltipProps {
  title: string;
  color?: string;
}

export const MyTooltip = (props: MyTooltipProps) => {
  return (
    <Tooltip
      title={props.title}
      placement="top-start"
      sx={{
        color: "#5B6872",
        fontSize: ".18rem",
      }}
      PopperProps={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, -10],
            },
          },
        ],
      }}
    >
      <div className="flex items-center">
        <Icomoon
          icon="question"
          size="0.16rem"
          color={props.color || "#5B6872"}
        />
      </div>
    </Tooltip>
  );
};
