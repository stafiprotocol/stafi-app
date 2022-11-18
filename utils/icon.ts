import { TokenName, TokenStandard } from "interfaces/common";
import ethWhiteIcon from "public/token/eth_white.svg";
import ethChainIcon from "public/token/eth_chain.svg";
import ethLogo from "public/eth_logo.png";
import erc20Logo from 'public/mintType/erc20.png';
import bep20Logo from 'public/mintType/bep20.png';
import nativeLogo from 'public/mintType/native.png';

export function getWhiteTokenIcon(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) {
    return ethWhiteIcon;
  }

  return ethWhiteIcon;
}

export function getChainIcon(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) {
    return ethChainIcon;
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
