import { useContext } from "react";
import { ApiContext, ApiCtx } from "providers/api-provider";

export const usePolkadotApi = () =>
  useContext(ApiContext) as Exclude<ApiCtx, null>;
