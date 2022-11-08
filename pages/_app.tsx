import { Fade, ThemeProvider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Web3ReactHooks } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { Layout } from "components/layout/layout";
import { hooks as metaMaskHooks, metaMask } from "connectors/metaMask";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { SnackbarProvider } from "notistack";
import type { ReactElement, ReactNode } from "react";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "redux/store";
import { theme } from "src/material-ui-theme";
import { SnackbarUtilsConfigurator } from "utils/snackbarUtils";
import "../styles/globals.css";

const ApiProvider = dynamic(() => import("providers/api-provider"), {
  ssr: false,
});

const useStyles = makeStyles({
  root: { marginLeft: "0" },
  successSnackbar: {
    backgroundColor: "rgba(0, 243, 171, 0.5) !important",
    border: "1px solid rgba(0, 243, 171, 0.8)",
    color: "#00F3AB !important",
    fontSize: "16px !important",
    fontFamily: "Helvetica, sans-serif",
  },
  errorSnackbar: {
    backgroundColor: "rgba(255,82,196, 0.5) !important",
    border: "1px solid rgba(255,82,196, 0.8)",
    color: "#FF52C4 !important",
    fontSize: "16px !important",
    fontFamily: "Helvetica, sans-serif",
  },
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, metaMaskHooks]];

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  const classes = useStyles();

  const resizeListener = () => {
    // 1rem:100px
    let designSize = 2048;
    let html = document.documentElement;
    let clientW = html.clientWidth;
    let htmlRem = (clientW * 100) / designSize;
    // html.style.fontSize = htmlRem + "px";
  };

  useEffect(() => {
    window.addEventListener("resize", resizeListener);
    resizeListener();

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Provider store={store}>
      <ApiProvider>
        {/* <Web3ReactProvider connectors={connectors}> */}
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            maxSnack={1}
            autoHideDuration={3000}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            TransitionComponent={Fade as React.ComponentType}
            classes={{
              root: classes.root,
              variantSuccess: classes.successSnackbar,
              variantError: classes.errorSnackbar,
            }}
          >
            <SnackbarUtilsConfigurator />
            <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
          </SnackbarProvider>
        </ThemeProvider>
      </ApiProvider>
      {/* </Web3ReactProvider> */}
    </Provider>
  );
}

export default MyApp;
