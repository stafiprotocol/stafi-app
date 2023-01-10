import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { getSolanaRestRpc, getSolanaWsRpc } from "config/env";
import { getSPLTokenContractConfig } from "config/splContract";
import { RTokenName, TokenName, TokenType } from "interfaces/common";
import { timeout } from "./common";
import { getTokenType } from "./rToken";
import snackbarUtil from "./snackbarUtils";

declare const window: any;

export function getSolanaExtension() {
  if (window.solana && window.solana.isPhantom) {
    return window.solana;
  }
  return undefined;
}

export async function refreshPhantom() {
  if (window.solana && window.solana.isPhantom) {
    await window.solana.disconnect();
    await timeout(500);
    if (!window.solana.isConnected) {
      await window.solana.connect();
      await timeout(500);
    }
  }
}

export async function getSplAssetBalance(
  solanaAccount: string | undefined,
  tokenName?: TokenName | RTokenName
) {
  if (!solanaAccount || !tokenName) {
    return undefined;
  }
  try {
    let balance = undefined;
    const { Connection } = await import("@solana/web3.js");
    const tokenAccountPubkey = await getSolanaTokenAccountPubkey(
      solanaAccount,
      getTokenType(tokenName)
    );
    if (tokenAccountPubkey) {
      const connection = new Connection(getSolanaRestRpc(), {
        wsEndpoint: getSolanaWsRpc(),
        commitment: "singleGossip",
      });
      const tokenAccountBalance = await connection.getTokenAccountBalance(
        tokenAccountPubkey
      );
      if (tokenAccountBalance && tokenAccountBalance.value) {
        balance = tokenAccountBalance.value.uiAmount + "";
      }
    } else {
      balance = "0";
    }
    return balance;
  } catch (err: any) {
    // console.log(err);
    return undefined;
  }
}

export async function getSolanaTokenAccountPubkey(
  walletAddress: string | undefined,
  tokenType: TokenType | undefined
) {
  if (!walletAddress || !tokenType) {
    return null;
  }
  try {
    let slpTokenMintAddress;
    if (tokenType === TokenType.FIS) {
      slpTokenMintAddress = getSPLTokenContractConfig().FIS;
    } else if (tokenType === TokenType.rSOL) {
      slpTokenMintAddress = getSPLTokenContractConfig().rSOL;
    }

    if (!slpTokenMintAddress) {
      throw new Error("Unknown spl token");
    }

    const { Connection, PublicKey } = await import("@solana/web3.js");

    const connection = new Connection(getSolanaRestRpc(), {
      wsEndpoint: getSolanaWsRpc(),
    });

    const acc = await connection.getTokenAccountsByOwner(
      new PublicKey(walletAddress),
      {
        mint: new PublicKey(slpTokenMintAddress),
      }
    );

    if (acc.value && acc.value.length > 0) {
      return acc.value[0].pubkey;
    }
  } catch (err) {
    return null;
  }

  return null;
}

export async function createSolanaTokenAccount(
  walletAddress: string | undefined,
  tokenType: TokenType
) {
  try {
    const solana = getSolanaExtension();
    if (!solana || !solana.isConnected) {
      return false;
    }

    if (!walletAddress || solana.publicKey.toString() !== walletAddress) {
      return false;
    }

    let slpTokenMintAddress;
    if (tokenType === TokenType.FIS) {
      slpTokenMintAddress = getSPLTokenContractConfig().FIS;
    } else if (tokenType === TokenType.rSOL) {
      slpTokenMintAddress = getSPLTokenContractConfig().rSOL;
    }

    if (!slpTokenMintAddress) {
      return false;
    }

    const { Connection, PublicKey, Transaction } = await import(
      "@solana/web3.js"
    );
    const splToken = await import("@solana/spl-token");

    const connection = new Connection(getSolanaRestRpc(), {
      wsEndpoint: getSolanaWsRpc(),
    });

    let ata = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      new PublicKey(slpTokenMintAddress),
      solana.publicKey
    );

    // console.log(`ata: ${ata.toBase58()}`);

    const inx = splToken.Token.createAssociatedTokenAccountInstruction(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      new PublicKey(slpTokenMintAddress),
      ata,
      solana.publicKey,
      new PublicKey(walletAddress)
    );

    let transaction = new Transaction().add(inx);

    let { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = solana.publicKey;

    let signed = await solana.signTransaction(transaction);

    let txid = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: true,
    });

    const result = await connection.confirmTransaction({
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signature: txid,
    });

    if (!result.value.err) {
      return true;
    }
  } catch (err) {
    return false;
  }
}

export async function sendSolanaTransaction(
  amount: number,
  poolAddress: string
) {
  const solana = getSolanaExtension();
  if (!solana || !solana.isConnected) {
    return undefined;
  }

  const { PublicKey, Transaction, SystemProgram, Connection } = await import(
    "@solana/web3.js"
  );

  //   console.log("poolAddress", poolAddress);
  let transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: solana.publicKey,
      toPubkey: new PublicKey(poolAddress),
      lamports: amount,
    })
  );

  const connection = new Connection(getSolanaRestRpc(), {
    wsEndpoint: getSolanaWsRpc(),
  });
  let { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = solana.publicKey;

  try {
    let signed = await solana.signTransaction(transaction);
    let txid = await connection.sendRawTransaction(signed.serialize());
    // console.log("txid", txid);
    await connection.confirmTransaction({
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signature: txid,
    });
    // await timeout(5000);
    // const tx = await connection.getTransaction(
    //   "5MUrJCMGW9UKxDJZ9Nkqj1rtBepRMXbAJktMp7ZeRauBQ9LU2F5q6qGwrKiu6RGV53g5Lv53ajDqLQQergpGTLSN",
    //   {
    //     maxSupportedTransactionVersion: 0,
    //   }
    // );
    let tx;
    let retryCount = 0;

    while (!tx) {
      tx = await connection.getTransaction(txid, {
        maxSupportedTransactionVersion: 0,
      });
      await timeout(3000);
      retryCount++;
      if (retryCount > 10) {
        break;
      }
    }

    if (!tx) {
      return undefined;
    }

    const block = await connection.getBlock(tx.slot, {
      maxSupportedTransactionVersion: 0,
    });

    if (!block) {
      return undefined;
    }

    return {
      blockHash: block.blockhash,
      txHash: txid,
    };
  } catch (e) {
    throw e;
  }
}

export const getSolanaStakingSignature = async (fisAddress: string) => {
  const solana = getSolanaExtension();
  if (!solana) {
    return null;
  }

  let pubkey = u8aToHex(decodeAddress(fisAddress), -1, false);
  let { signature } = await solana.signMessage(
    new TextEncoder().encode(pubkey),
    "utf8"
  );

  if (!signature) {
    return null;
  }
  return u8aToHex(signature);
};
