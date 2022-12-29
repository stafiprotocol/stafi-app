import { Popover } from "@mui/material";
import classNames from "classnames";
import { NavbarWallet } from "components/NavbarWallet";
import { NoticeList } from "components/notice/NoticeList";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import notificationIcon from "public/icon_notification.svg";
import stafiLogo from "public/stafi_logo.svg";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import styles from "styles/Navbar.module.scss";

export const Navbar = () => {
  const { unreadNoticeFlag } = useSelector((state: RootState) => {
    return {
      unreadNoticeFlag: state.app.unreadNoticeFlag,
    };
  });

  const router = useRouter();

  const noticePopupState = usePopupState({
    variant: "popover",
    popupId: "notice",
  });

  return (
    <div className="bg-navbarBg h-[1.3rem] flex items-center justify-between">
      <div className="flex items-center pl-[.85rem]">
        <div className="w-[.28rem] h-[.28rem] relative">
          <Image src={stafiLogo} alt="logo" layout="fill" />
        </div>
        <Link href="/rtoken">
          <div
            className={classNames(
              styles["rtoken-button"],
              router.pathname.startsWith("/rtoken")
                ? styles["rtoken-button_active"]
                : "",
              "text-white"
            )}
          >
            rToken
          </div>
        </Link>
        <Link href="/rpool">
          <div
            className={classNames(
              styles["rtoken-button"],
              router.pathname.startsWith("/rpool")
                ? styles["rtoken-button_active"]
                : "",
              "text-white"
            )}
          >
            rPool
          </div>
        </Link>
        <Link href="/fis-station">
          <div
            className={classNames(
              styles["rtoken-button"],
              router.pathname.startsWith("/fis-station")
                ? styles["rtoken-button_active"]
                : "",
              "text-white"
            )}
          >
            FIS Station
          </div>
        </Link>
      </div>

      <div className="flex items-center pr-[.85rem]">
        <NavbarWallet />

        <div
          className={styles.notification}
          {...bindTrigger(noticePopupState)}
          style={{
            background: noticePopupState.isOpen
              ? "linear-gradient(0deg,rgba(0, 243, 171, 0.3) 0%,rgba(26, 40, 53, 0.2) 30%),rgba(26, 40, 53, 0.2) 100%)"
              : "rgba(25, 38, 52, 0.35)",
            border: noticePopupState.isOpen
              ? "1px solid rgba(0, 243, 171, 0.2)"
              : "1px solid #1a2835",
          }}
        >
          {unreadNoticeFlag && (
            <div className="bg-primary rounded-full top-[.12rem] right-[.24rem] w-[.12rem] h-[.12rem] absolute" />
          )}
          <div className="w-[.26rem] h-[.3rem] relative">
            <Image src={notificationIcon} alt="logo" layout="fill" />
          </div>
        </div>
      </div>

      {/* Notice */}
      <Popover
        {...bindPopover(noticePopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: ".3rem",
          marginLeft: "55px",
          "& .MuiPopover-paper": {
            background: "rgba(25, 38, 52, 0.35)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".16rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <NoticeList
          isOpen={noticePopupState.isOpen}
          onClose={noticePopupState.close}
        />
      </Popover>
    </div>
  );
};
