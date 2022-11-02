import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useAppSlice() {
  const { updateFlag15s, isLoading } = useAppSelector((state: RootState) => {
    return {
      updateFlag15s: state.app.updateFlag15s,
      isLoading: state.app.isLoading,
    };
  });

  return {
    updateFlag15s,
    isLoading,
  };
}
