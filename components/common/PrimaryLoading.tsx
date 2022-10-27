import classNames from "classnames";
import Image from "next/image";
import loading from "public/loading.png";
import commonStyles from "styles/Common.module.scss";

interface PrimaryLoadingProps {
  size: string;
}

export const PrimaryLoading = (props: PrimaryLoadingProps) => {
  return (
    <div
      className={classNames("ml-[.16rem] relative", commonStyles.loading)}
      style={{
        width: props.size,
        height: props.size,
      }}
    >
      <Image src={loading} layout="fill" alt="loading" />
    </div>
  );
};
