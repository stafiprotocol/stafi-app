import { Fee, TokenName, TokenStandard, TokenSymbol } from "interfaces/common";
import { i } from "mathjs";
import { useEffect, useState } from "react";
import { queryBridgeFees } from "redux/reducers/BridgeSlice";
import {
  getDotBondFees,
  getDotBondTransactionFees,
} from "redux/reducers/DotSlice";
import {
  getKsmBondFees,
  getKsmBondTransactionFees,
} from "redux/reducers/KsmSlice";
import { RootState } from "redux/store";
import { chainAmountToHuman } from "utils/number";
import { useAppDispatch, useAppSelector } from "./common";

export function useStakeFees(
  tokenName: TokenName,
  tokenStandard: TokenStandard
) {
  const dispatch = useAppDispatch();

  const [sendFee, setSendFee] = useState<Fee | undefined>();
  const [txFee, setTxFee] = useState<Fee | undefined>();
  const [bridgeFee, setBridgeFee] = useState<Fee | undefined>();

  const {
    erc20BridgeFee,
    bep20BridgeFee,
    solBridgeFee,
    ksmBondFees,
    ksmBondTxFees,
    dotBondFees,
    dotBondTxFees,
  } = useAppSelector((state: RootState) => {
    return {
      erc20BridgeFee: state.bridge.erc20BridgeFee,
      bep20BridgeFee: state.bridge.bep20BridgeFee,
      solBridgeFee: state.bridge.solBridgeFee,
      ksmBondFees: state.ksm.bondFees,
      ksmBondTxFees: state.ksm.bondTxFees,
      dotBondFees: state.dot.bondFees,
      dotBondTxFees: state.dot.bondTxFees,
    };
  });

  useEffect(() => {
    dispatch(queryBridgeFees());

    if (tokenName === TokenName.KSM) {
      dispatch(getKsmBondFees());
      dispatch(getKsmBondTransactionFees(tokenStandard));
    } else if (tokenName === TokenName.DOT) {
      dispatch(getDotBondFees());
      dispatch(getDotBondTransactionFees(tokenStandard));
    }
  }, [dispatch, tokenStandard, tokenName]);

  useEffect(() => {
    if (tokenName === TokenName.KSM) {
      setSendFee({
        amount: "0.00005",
        tokenName: "KSM",
      });

      const bondFee = Number(chainAmountToHuman(ksmBondFees, TokenSymbol.FIS));
      const txFeeAmount = Number(ksmBondTxFees);
      setTxFee({
        amount: txFeeAmount + "",
        tokenName: "FIS",
      });

      // console.log("xxx bondFee", bondFee);
      if (tokenStandard === TokenStandard.Native) {
        setBridgeFee({
          amount: bondFee + "",
          tokenName: "FIS",
        });
      } else if (tokenStandard === TokenStandard.ERC20) {
        setBridgeFee({
          amount: bondFee + Number(erc20BridgeFee) + "",
          tokenName: "FIS",
        });
      } else if (tokenStandard === TokenStandard.BEP20) {
        setBridgeFee({
          amount: bondFee + Number(bep20BridgeFee) + "",
          tokenName: "FIS",
        });
      } else if (tokenStandard === TokenStandard.SPL) {
        setBridgeFee({
          amount: bondFee + Number(solBridgeFee) + "",
          tokenName: "FIS",
        });
      }

      // console.log("ksm", ksmBondFees);
      // console.log("ksmTx", ksmBondTxFees);
      // console.log("erc20BridgeFee", erc20BridgeFee);
      // console.log("bep20BridgeFee", bep20BridgeFee);
    } else if (tokenName === TokenName.DOT) {
      setSendFee({
        amount: "0.015",
        tokenName: "DOT",
      });

      const bondFee = Number(chainAmountToHuman(dotBondFees, TokenSymbol.FIS));
      const txFeeAmount = Number(dotBondTxFees);
      setTxFee({
        amount: txFeeAmount + "",
        tokenName: "FIS",
      });

      // console.log("xxx bondFee", bondFee);
      if (tokenStandard === TokenStandard.Native) {
        setBridgeFee({
          amount: bondFee + "",
          tokenName: "FIS",
        });
      } else if (tokenStandard === TokenStandard.ERC20) {
        setBridgeFee({
          amount: bondFee + Number(erc20BridgeFee) + "",
          tokenName: "FIS",
        });
      } else if (tokenStandard === TokenStandard.BEP20) {
        setBridgeFee({
          amount: bondFee + Number(bep20BridgeFee) + "",
          tokenName: "FIS",
        });
      } else if (tokenStandard === TokenStandard.SPL) {
        setBridgeFee({
          amount: bondFee + Number(solBridgeFee) + "",
          tokenName: "FIS",
        });
      }
    }
  }, [
    tokenName,
    tokenStandard,
    ksmBondFees,
    ksmBondTxFees,
    dotBondFees,
    dotBondTxFees,
    erc20BridgeFee,
    bep20BridgeFee,
    solBridgeFee,
  ]);

  return {
    sendFee,
    txFee,
    bridgeFee,
  };
}
