import { TokenName, TokenStandard } from "interfaces/common";
import ethWhiteIcon from "public/token/eth_white.svg";
import ethChainIcon from "public/token/eth_chain.svg";
import ethLogo from "public/eth_logo.png";

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
    return ethLogo;
  }

  return ethLogo;
}
