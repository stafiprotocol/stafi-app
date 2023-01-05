import { Skeleton } from "@mui/material";

export const TableSkeleton = () => {
  return (
    <div>
      <Skeleton
        variant="rounded"
        animation="pulse"
        height=".5rem"
        sx={{
          fontSize: ".24rem",
          marginBottom: ".2rem",
          bgcolor: "grey.600",
        }}
      />

      <Skeleton
        variant="rounded"
        height=".3rem"
        animation="pulse"
        sx={{
          fontSize: ".24rem",
          bgcolor: "grey.600",
          marginBottom: ".1rem",
        }}
      />

      <Skeleton
        variant="rounded"
        height=".3rem"
        animation="pulse"
        sx={{
          fontSize: ".24rem",
          bgcolor: "grey.600",
          marginBottom: ".1rem",
        }}
      />

      <Skeleton
        variant="rounded"
        height=".3rem"
        animation="pulse"
        sx={{
          fontSize: ".24rem",
          bgcolor: "grey.600",
          marginBottom: ".1rem",
        }}
      />

      <Skeleton
        variant="rounded"
        height=".3rem"
        animation="pulse"
        sx={{
          fontSize: ".24rem",
          bgcolor: "grey.600",
          marginBottom: ".1rem",
        }}
      />
    </div>
  );
};
