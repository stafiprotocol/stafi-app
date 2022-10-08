import { CircularProgress } from "@mui/material";

interface CustomLoadingProps {
  color:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "inherit"
    | undefined;
  size: string;
}

export const CustomLoading = (props: CustomLoadingProps) => {
  return <CircularProgress size={props.size} color={props.color} />;
};
