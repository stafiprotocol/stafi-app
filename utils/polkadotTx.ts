import { SubmittableResult } from "@polkadot/api";
import { QueueTx, QueueTxStatus } from "interfaces/tx";
import { TRANSACTION_FAILED_MESSAGE } from "./constants";

export const NOOP = () => undefined;

export function handleTxResults(
  { id, txFailedCb = NOOP, txSuccessCb = NOOP, txUpdateCb = NOOP }: QueueTx,
  unsubscribe: () => void
): (result: SubmittableResult) => void {
  return (result: SubmittableResult): void => {
    if (!result || !result.status) {
      return;
    }

    const status = result.status.type.toLowerCase() as QueueTxStatus;

    txUpdateCb(result);

    if (result.status.isFinalized || result.status.isInBlock) {
      // result.events.forEach(({ phase, event: { data, method, section } }) => {
      //   console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
      // });

      result.events
        .filter(({ event: { section } }) => section === "system")
        .forEach(({ event: { method } }): void => {
          if (method === "ExtrinsicFailed") {
            txFailedCb(TRANSACTION_FAILED_MESSAGE);
          } else if (method === "ExtrinsicSuccess") {
            txSuccessCb(result);
          }
        });
    } else if (result.isError) {
      txFailedCb(TRANSACTION_FAILED_MESSAGE);
    }

    if (result.isCompleted) {
      unsubscribe();
    }
  };
}
