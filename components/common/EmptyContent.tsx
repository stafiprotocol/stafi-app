import Image from "next/image";
import empty from "public/empty.svg";

interface EmptyContentProps {
  hideText?: boolean;
  mt?: string;
  size?: string;
}

export const EmptyContent = (props: EmptyContentProps) => {
  return (
    <div
      className="flex justify-center"
      style={{
        marginTop: props.mt || "0",
      }}
    >
      <div className="flex flex-col items-center">
        <div
          className="relative"
          style={{
            width: props.size || "1rem",
            height: props.size || "1rem",
          }}
        >
          <Image src={empty} alt="empty" layout="fill" />
        </div>
        {!props.hideText && (
          <div className="mt-[.2rem] text-[.16rem] text-text2">
            Oops, there is nothing here
          </div>
        )}
      </div>
    </div>
  );
};
