import ReactLoading from "react-loading";

interface CustomLoadingProps {
  color: string;
  size: string;
}

export const CustomLoading = (props: CustomLoadingProps) => {
  return (
    <ReactLoading
      type="spin"
      color={props.color}
      height={props.size}
      width={props.size}
    />
  );
};
