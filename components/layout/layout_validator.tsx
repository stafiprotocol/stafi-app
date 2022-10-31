import { getMetamaskValidatorChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useContext, useEffect } from "react";
import { MyLayoutContext } from "./layout";

type ValidatorLayoutProps = React.PropsWithChildren<{}>;

export const ValidatorLayout = (props: ValidatorLayoutProps) => {
  const { setTargetMetaMaskChainId } = useContext(MyLayoutContext);
  const { useChainId, useAccount } = hooks;

  useEffect(() => {
    setTargetMetaMaskChainId(getMetamaskValidatorChainId());
  }, [setTargetMetaMaskChainId]);

  return <div>{props.children}</div>;
};
