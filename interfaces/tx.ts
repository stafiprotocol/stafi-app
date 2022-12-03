import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { SubmittableResult } from "@polkadot/api";
import { SignerResult } from "@polkadot/types/types";

export type QueueTxStatus =
  | "future"
  | "ready"
  | "finalized"
  | "finalitytimeout"
  | "usurped"
  | "dropped"
  | "inblock"
  | "invalid"
  | "broadcast"
  | "cancelled"
  | "completed"
  | "error"
  | "incomplete"
  | "queued"
  | "qr"
  | "retracted"
  | "sending"
  | "signing"
  | "sent"
  | "blocked";

export type TxCallback = (status: SubmittableResult) => void;

export type TxFailedCallback = (status: SubmittableResult | null) => void;

export type SignerCallback = (id: number, result: SignerResult | null) => void;

// export type FailedReason = "Invalid Fee" | "Unknown";
export type FailedReason = string;

export interface QueueTx {
  id?: number;
  status?: QueueTxStatus;
  extrinsic?: SubmittableExtrinsic<"promise">;
  fisCost?: number | string;
  result?: any;
  error?: Error;
  signerCb?: SignerCallback;
  // txFailedCb?: TxFailedCallback;
  txFailedCb?: (reason: FailedReason) => void;
  txSuccessCb?: TxCallback;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
  txCancelCb?: () => void;
}
