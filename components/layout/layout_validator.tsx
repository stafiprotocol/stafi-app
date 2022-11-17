import { getMetamaskValidatorChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { WalletType } from "interfaces/common";
import Head from "next/head";
import { useContext, useEffect } from "react";
import { MyLayoutContext } from "./layout";

type ValidatorLayoutProps = React.PropsWithChildren<{}>;

export const ValidatorLayout = (props: ValidatorLayoutProps) => {
  return (
    <div>
      <Head>
        <title>StaFi rETH</title>
      </Head>
      {props.children}
    </div>
  );
};
