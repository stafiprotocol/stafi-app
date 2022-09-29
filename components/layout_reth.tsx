import { hooks, metaMask } from "connectors/metaMask";
import { useEffect } from "react";

type RethLayoutProps = React.PropsWithChildren<{}>;

export const RethLayout = (props: RethLayoutProps) => {
  const { useChainId, useAccount } = hooks;
  const chainId = useChainId();
  const account = useAccount();

  // useEffect(() => {
  //   if (!account) {
  //     metaMask.connectEagerly();
  //   }
  // }, [account]);

  return <div>{props.children}</div>;
};
