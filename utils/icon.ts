import { TokenName, TokenStandard } from "interfaces/common";
import ethWhiteIcon from "public/token/eth_white.svg";
import ethChainIcon from "public/token/eth_chain.svg";
import ksmWhiteIcon from "public/token/ksm_white.png";
import ksmChainIcon from "public/token/ksm_chain.png";
import dotWhiteIcon from "public/token/dot_white.png";
import dotChainIcon from "public/token/dot_chain.png";
import ethLogo from "public/eth_logo.png";
import erc20Logo from "public/mintType/erc20.png";
import bep20Logo from "public/mintType/bep20.png";
import nativeLogo from "public/mintType/native.png";
import maticLogo from "public/matic_logo.svg";
import maticLogoBlack from "public/matic_logo_black.svg";

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

  return ethLogo;
}
