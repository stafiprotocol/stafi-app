import { AppBar } from "@mui/material";
import classNames from "classnames";
import { ChooseFisAccountModal } from "components/modal/ChooseFisAccountModal";
import { ConnectWalletModal } from "components/modal/ConnectWalletModal";
import { RTokenStakeLoadingModal } from "components/modal/RTokenStakeLoadingModal";
import { hooks } from "connectors/metaMask";
import { useAppDispatch } from "hooks/common";
import { useInit } from "hooks/useInit";
import { useWalletAccount } from "hooks/useWalletAccount";
import { NavigationItem, WalletType } from "interfaces/common";
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HideOnScroll } from "../common/HideOnScroll";
import { Icomoon } from "../icon/Icomoon";
import { EthValidatorStakeLoadingModal } from "../modal/EthValidatorStakeLoadingModal";
import { EthValidatorStakeSidebar } from "../modal/EthValidatorStakeSidebar";
import { Navbar } from "./navbar";
import Particles from "react-tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { useRouter } from "next/router";
import {
  getMetamaskBscChainId,
  getMetamaskEthChainId,
  getMetamaskMaticChainId,
  getMetamaskValidatorChainId,
} from "config/metaMask";
import { RTokenStakeLoadingSidebar } from "components/modal/RTokenStakeLoadingSidebar";
import { RTokenRedeemLoadingModal } from "components/modal/RTokenRedeemLoadingModal";
import { RTokenRedeemLoadingSidebar } from "components/modal/RTokenRedeemLoadingSidebar";
import FisStationModal from "components/modal/FisStationModal";

type LayoutProps = React.PropsWithChildren<{}>;

export const MyLayoutContext = React.createContext<{
  navigation: NavigationItem[] | undefined;
  setNavigation: any;
  targetMetaMaskChainId: number | undefined;
  setTargetMetaMaskChainId: any;
  walletType: WalletType;
  setWalletType: any;
  // MetaMask wrong network flag.
  isWrongMetaMaskNetwork: boolean;
  // All wallet wrong network flag, including MetaMask, Phantom, Keplr, etc.
  isWrongNetwork: boolean;
  // Will change through pages, depending on which wallet to connect.
  walletNotConnected: boolean;
}>({
  navigation: undefined,
  setNavigation: undefined,
  targetMetaMaskChainId: undefined,
  setTargetMetaMaskChainId: undefined,
  walletType: WalletType.MetaMask,
  setWalletType: undefined,
  isWrongMetaMaskNetwork: false,
  isWrongNetwork: false,
  walletNotConnected: false,
});

export const Layout = (props: LayoutProps) => {
  useInit();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [targetMetaMaskChainId, setTargetMetaMaskChainId] = useState<
    number | undefined
  >();
  const [walletType, setWalletType] = useState<WalletType>(WalletType.MetaMask);

  const { metaMaskAccount } = useWalletAccount();

  const isWrongMetaMaskNetwork = useMemo(() => {
    return (
      targetMetaMaskChainId !== undefined &&
      metaMaskChainId !== targetMetaMaskChainId
    );
  }, [metaMaskChainId, targetMetaMaskChainId]);

  const isWrongNetwork = useMemo(() => {
    return isWrongMetaMaskNetwork;
    // if (walletType === WalletType.MetaMask) {
    //   return isWrongMetaMaskNetwork;
    // }
    // return false;
  }, [isWrongMetaMaskNetwork]);

  const walletNotConnected = useMemo(() => {
    if (walletType === WalletType.MetaMask) {
      return !metaMaskAccount;
    }
    return false;
  }, [walletType, metaMaskAccount]);

  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine);

    // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  // if (isServer()) {
  //   return null;
  // }

  useEffect(() => {
    if (router.pathname === "/rtoken") {
      setTargetMetaMaskChainId(undefined);
      setWalletType(WalletType.Polkadot);
    } else if (router.pathname.startsWith("/validator")) {
      setTargetMetaMaskChainId(getMetamaskValidatorChainId());
      setWalletType(WalletType.MetaMask);
    } else if (router.pathname === "/rtoken/stake/ETH") {
      setTargetMetaMaskChainId(getMetamaskEthChainId());
      setWalletType(WalletType.MetaMask);
    } else if (router.pathname === "/rtoken/stake/MATIC") {
      setTargetMetaMaskChainId(getMetamaskMaticChainId());
      setWalletType(WalletType.MetaMask);
    } else if (router.pathname === "/rtoken/stake/BNB") {
      setTargetMetaMaskChainId(getMetamaskBscChainId());
      setWalletType(WalletType.MetaMask);
    } else if (router.pathname === "/rtoken/stake/KSM") {
      setTargetMetaMaskChainId(undefined);
      setWalletType(WalletType.Polkadot_KSM);
    } else if (router.pathname === "/rtoken/stake/DOT") {
      setTargetMetaMaskChainId(undefined);
      setWalletType(WalletType.Polkadot_DOT);
    } else if (router.pathname.startsWith("/rpool")) {
      setTargetMetaMaskChainId(undefined);
      setWalletType(WalletType.MetaMask);
    } else {
      setTargetMetaMaskChainId(getMetamaskMaticChainId());
      setWalletType(WalletType.Polkadot);
    }
  }, [router.pathname]);

  return (
    <MyLayoutContext.Provider
      value={{
        navigation,
        setNavigation,
        targetMetaMaskChainId,
        setTargetMetaMaskChainId,
        walletType,
        setWalletType,
        isWrongMetaMaskNetwork,
        isWrongNetwork,
        walletNotConnected,
      }}
    >
      <div className="">
        <Particles
          id="1"
          height="100px"
          init={particlesInit}
          options={{
            particles: {
              number: {
                value: 202,
                density: {
                  enable: true,
                  value_area: 800,
                },
              },
              color: {
                value: "#00f3ab",
              },
              shape: {
                type: "circle",
                stroke: {
                  width: 0,
                  color: "#000000",
                },
                polygon: {
                  nb_sides: 5,
                },
                image: {
                  src: "img/github.svg",
                  width: 100,
                  height: 100,
                },
              },
              opacity: {
                value: 0.3551164387345227,
                random: true,
                anim: {
                  enable: true,
                  speed: 1,
                  opacity_min: 0,
                  sync: false,
                },
              },
              size: {
                value: 3,
                random: true,
                anim: {
                  enable: false,
                  speed: 4,
                  size_min: 0.3,
                  sync: false,
                },
              },
              line_linked: {
                enable: false,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1,
              },
              move: {
                enable: true,
                speed: 0.2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: false,
                  rotateX: 600,
                  rotateY: 600,
                },
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: false,
                  mode: "bubble",
                },
                onclick: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                grab: {
                  distance: 400,
                  line_linked: {
                    opacity: 1,
                  },
                },
                bubble: {
                  distance: 250,
                  size: 0,
                  duration: 2,
                  opacity: 0,
                  speed: 3,
                },
                repulse: {
                  distance: 400,
                  duration: 0.4,
                },
                push: {
                  particles_nb: 4,
                },
                remove: {
                  particles_nb: 2,
                },
              },
            },
            retina_detect: true,
          }}
        />

        <Head>
          <title>StaFi rToken APP</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <HideOnScroll>
          <AppBar position="fixed" color="transparent" elevation={0}>
            <Navbar />
          </AppBar>
        </HideOnScroll>

        <main className="flex flex-col items-center pt-[1.3rem]">
          <div
            className={classNames(
              "w-[14.88rem] flex items-center py-[.56rem] relative z-10",
              {
                hidden: !navigation || navigation.length <= 1,
              }
            )}
          >
            {navigation?.map((item, index) => (
              <div
                key={item.name}
                className={classNames(
                  "flex items-center text-text2 text-[.24rem]"
                )}
              >
                <div className="cursor-default">
                  {!!item.path ? (
                    <Link href={item.path}>{item.name}</Link>
                  ) : (
                    item.name
                  )}
                </div>
                {index !== navigation.length - 1 && (
                  <div className="mx-[.2rem] rotate-[180deg]">
                    <Icomoon icon="right" size=".16rem" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className={classNames("w-[14.88rem] mb-[1rem]", {
              "mt-[.56rem]": !navigation || navigation.length <= 1,
            })}
          >
            {props.children}
          </div>
        </main>

        <EthValidatorStakeLoadingModal />

        <EthValidatorStakeSidebar />

        <RTokenStakeLoadingModal />

        <RTokenStakeLoadingSidebar />

        <RTokenRedeemLoadingSidebar />

        <RTokenRedeemLoadingModal />

        <ConnectWalletModal />

        <ChooseFisAccountModal />

				<FisStationModal />
      </div>
    </MyLayoutContext.Provider>
  );
};
