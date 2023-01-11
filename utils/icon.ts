import { RTokenName, TokenName, TokenStandard } from "interfaces/common";
import ethWhiteIcon from "public/token/eth_white.svg";
import solWhiteIcon from "public/token/sol_white.png";
import solChainIcon from "public/token/sol_chain.png";
import ethChainIcon from "public/token/eth_chain.svg";
import ksmWhiteIcon from "public/token/ksm_white.png";
import ksmChainIcon from "public/token/ksm_chain.png";
import dotWhiteIcon from "public/token/dot_white.png";
import dotChainIcon from "public/token/dot_chain.png";
import ethLogo from "public/eth_logo.png";
import erc20Logo from "public/mintType/erc20.svg";
import bep20Logo from "public/mintType/bep20.svg";
import nativeLogo from "public/mintType/native.svg";
import splLogo from "public/mintType/spl.svg";
import maticLogo from "public/matic_logo.svg";
import maticLogoBlack from "public/matic_logo_black.svg";
import bnbWhiteIcon from "public/token/bnb_white.svg";
import bnbChainIcon from "public/token/bnb_chain.svg";

export function getWhiteTokenIcon(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) {
    return ethWhiteIcon;
  }
  if (tokenName === TokenName.MATIC) {
    return maticLogoBlack;
  }
  if (tokenName === TokenName.KSM) {
    return ksmWhiteIcon;
  }
  if (tokenName === TokenName.DOT) {
    return dotWhiteIcon;
  }
  if (tokenName === TokenName.SOL) {
    return solWhiteIcon;
  }
  if (tokenName === TokenName.BNB) {
    return bnbWhiteIcon;
  }

  return ethWhiteIcon;
}

export function getChainIcon(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) {
    return ethChainIcon;
  }
  if (tokenName === TokenName.MATIC) {
    return maticLogo;
  }
  if (tokenName === TokenName.KSM) {
    return ksmChainIcon;
  }
  if (tokenName === TokenName.DOT) {
    return dotChainIcon;
  }
  if (tokenName === TokenName.SOL) {
    return solChainIcon;
  }
  if (tokenName === TokenName.BNB) {
    return bnbChainIcon;
  }

  return ethChainIcon;
}

export function getTokenStandardIcon(tokenStandard: TokenStandard) {
  if (tokenStandard === TokenStandard.ERC20) {
    return erc20Logo;
  }
  if (tokenStandard === TokenStandard.BEP20) {
    return bep20Logo;
  }
  if (tokenStandard === TokenStandard.Native) {
    return nativeLogo;
  }
  if (tokenStandard === TokenStandard.SPL) {
    return splLogo;
  }

  return ethLogo;
}

export function getRBridgeTokenIcon(tokenName: TokenName | RTokenName) {
  if (tokenName === TokenName.FIS) {
    return nativeLogo;
  }
  if (tokenName === RTokenName.rFIS) {
    return nativeLogo;
  }
  if (tokenName === RTokenName.rETH) {
    return ethWhiteIcon;
  }
  if (tokenName === RTokenName.rMATIC) {
    return maticLogoBlack;
  }
  if (tokenName === RTokenName.rKSM) {
    return ksmWhiteIcon;
  }
  if (tokenName === RTokenName.rDOT) {
    return dotWhiteIcon;
  }

  return nativeLogo;
}
