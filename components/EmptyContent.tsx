import Image from "next/image";
import empty from "public/empty.svg";

interface EmptyContentProps {
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
      <div
        className="relative"
        style={{
          width: props.size || "1.1rem",
          height: props.size || "1.1rem",
        }}
      >
        <Image src={empty} alt="empty" layout="fill" />
      </div>
    </div>
  );
};
