import { hooks } from "connectors/metaMask";

type ValidatorLayoutProps = React.PropsWithChildren<{}>;

export const ValidatorLayout = (props: ValidatorLayoutProps) => {
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
