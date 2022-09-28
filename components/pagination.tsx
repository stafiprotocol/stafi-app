import { Pagination } from "@mui/material";

const COUNT_PER_PAGE = 10;

interface CustomPaginationProps {
  totalCount: number;
  page: number;
  onChange: (page: number) => void;
}

export const CustomPagination = (props: CustomPaginationProps) => {
  const pageCount = Math.ceil(props.totalCount / COUNT_PER_PAGE);

  return (
    <Pagination
      shape="rounded"
      count={pageCount}
      page={props.page}
      onChange={(_, page) => props.onChange(page)}
      sx={{
        "& .MuiPaginationItem-root": {
          color: "#ffffffa0",
          fontSize: ".14rem",
          width: ".28rem",
          height: ".28rem",
          padding: "0",
          minWidth: ".28rem",
        },
        "& .MuiPaginationItem-root.Mui-selected": {
          background:
            "linear-gradient(140.73deg, #0093ED 4.72%, #00F3AB 96.52%)",
          color: "#1A2835",
        },
        "& .MuiPaginationItem-icon": {
          width: "0.3rem",
          height: "0.5rem",
        },
      }}
    />
  );
};
