import { Collapse } from "@mui/material";
import classNames from "classnames";
import Image from "next/image";
import downIcon from "public/icon_down.png";
import { ReactNode, useEffect, useState } from "react";

type CollapseCardProps = React.PropsWithChildren<{
  defaultCollapsed?: boolean;
  title?: ReactNode | undefined;
  mt?: string;
  mx?: string;
  background?: string;
}>;

export const CollapseCard = (props: CollapseCardProps) => {
  const [collapsed, setCollapsed] = useState(props.defaultCollapsed);

  return (
    <div
      className="bg-cardBg border-solid border-[1px] border-[#1A2835] rounded-[.16rem]"
      style={{
        marginTop: props.mt || "0",
        marginLeft: props.mx || "0",
        marginRight: props.mx || "0",
        background: props.background || "transparent",
        backdropFilter: "blur(.7rem)",
      }}
    >
      <div className="p-[.56rem] flex flex-col items-center">
        <div
          className="self-stretch flex items-center justify-between cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          {props.title}

          <div className="w-[.29rem] h-[0.2rem] p-[.05rem]">
            <div
              className={classNames("w-full h-full relative ", {
                "-rotate-90": collapsed,
              })}
            >
              <Image src={downIcon} layout="fill" alt="down" />
            </div>
          </div>
        </div>
      </div>

      {
        <Collapse in={!collapsed}>
          <div>
            {/* <div
              className={classNames(
                collapsed ? "h-0 max-h-0 overflow-hidden" : ""
              )}
            > */}
            {props.children}
            <div className="h-[.56rem]" />
            {/* </div> */}
          </div>
        </Collapse>
      }
    </div>
  );
};
