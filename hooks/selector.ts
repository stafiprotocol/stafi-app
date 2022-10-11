import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useAppSlice() {
  const { updateFlag15s } = useAppSelector((state: RootState) => {
    return {
      updateFlag15s: state.app.updateFlag15s,
    };
  });

  return {
    updateFlag15s,
  };
}
