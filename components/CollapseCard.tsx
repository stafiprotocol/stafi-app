import Image from "next/image";
import downIcon from "public/icon_down.png";
import { ReactNode, useState } from "react";

type CollapseCardProps = React.PropsWithChildren<{
  title?: ReactNode | undefined;
  mt?: string;
  mx?: string;
  backgroundColor?: string;
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
        backgroundColor: props.backgroundColor || "transparent",
      }}
    >
      <div className="p-[.56rem] flex flex-col items-center">
        <div className="self-stretch flex items-center justify-between">
          {props.title}

          <div
            className="w-[.19rem] h-[0.1rem] relative cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Image src={downIcon} layout="fill" alt="down" />
          </div>
        </div>
      </div>

      {!collapsed && <div className="pb-[.56rem]">{props.children}</div>}
    </div>
  );
};
