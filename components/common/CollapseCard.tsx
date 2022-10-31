import classNames from "classnames";
import Image from "next/image";
import downIcon from "public/icon_down.png";
import { ReactNode, useState } from "react";

type CollapseCardProps = React.PropsWithChildren<{
  title?: ReactNode | undefined;
  mt?: string;
  mx?: string;
  background?: string;
}>;

export const CollapseCard = (props: CollapseCardProps) => {
  const [collapsed, setCollapsed] = useState(false);

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
        <div className="self-stretch flex items-center justify-between">
          {props.title}

          <div
            className="w-[.29rem] h-[0.2rem] p-[.05rem] cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
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

      {!collapsed && <div className="pb-[.56rem]">{props.children}</div>}
    </div>
  );
};
